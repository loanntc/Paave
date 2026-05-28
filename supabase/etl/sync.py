"""
Paave ETL worker  —  Upstream Paave API → Supabase (via PostgREST).

Usage:
    python -m supabase.etl.sync --group hourly
    python -m supabase.etl.sync --group daily --dry-run
    python -m supabase.etl.sync --only market.quote_latest news.latest

Design notes:
- Supabase REST upsert uses header: Prefer: resolution=merge-duplicates + on_conflict=<pk>.
- Retries use exponential backoff (tenacity) on 5xx + network errors.
- Every run writes one row to public.etl_sync_runs (RUNNING → SUCCESS/PARTIAL/FAILED).
- Failed rows go to public.etl_dead_letter so an operator can inspect + retry.
- SERVICE_ROLE_KEY is ONLY used here (server-side), never on mobile/web clients.
"""
from __future__ import annotations

import argparse
import importlib
import json
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Callable

import httpx
import structlog
import yaml
from tenacity import (
    retry, retry_if_exception_type, stop_after_attempt, wait_exponential
)

from .config import Settings, load_settings

log = structlog.get_logger("paave-etl")


# ---------------------------------------------------------------------------
# Placeholder resolution for endpoint params
# ---------------------------------------------------------------------------
def _render_params(params: dict[str, Any] | None) -> dict[str, str]:
    if not params:
        return {}
    now = datetime.now(timezone.utc)
    subs = {
        "date":          now.date().isoformat(),
        "date_minus_1":  (now - timedelta(days=1)).date().isoformat(),
        "date_minus_5":  (now - timedelta(days=5)).date().isoformat(),
        "ts":            now.isoformat(),
        "ts_minus_2h":   (now - timedelta(hours=2)).isoformat(),
    }
    out = {}
    for k, v in params.items():
        if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
            out[k] = subs.get(v[1:-1], v)
        else:
            out[k] = str(v)
    return out


def _load_transform(dotted: str) -> Callable:
    mod_name, fn_name = dotted.rsplit(".", 1)
    mod = importlib.import_module(f"supabase.etl.{mod_name}")
    return getattr(mod, fn_name)


# Default modules to iterate for per_module endpoints (FAQ)
DEFAULT_MODULES = ("ONBOARDING", "TRADING", "SOCIAL", "ACCOUNT", "LEARNING", "GENERAL")


def _call_transform(fn: Callable, envelope: dict, context: dict | None):
    """Transformers may or may not accept a `context` kwarg."""
    try:
        return fn(envelope, context=context)
    except TypeError:
        return fn(envelope)


# ---------------------------------------------------------------------------
# HTTP clients
# ---------------------------------------------------------------------------
class PaaveAPIClient:
    def __init__(self, s: Settings):
        headers = {"Accept": "application/json"}
        if s.paave_system_token:
            headers["Authorization"] = f"Bearer {s.paave_system_token}"
        self.client = httpx.Client(
            base_url=s.paave_base_url,
            headers=headers,
            timeout=s.request_timeout_s,
        )

    @retry(
        reraise=True,
        stop=stop_after_attempt(5),
        wait=wait_exponential(min=1, max=30),
        retry=retry_if_exception_type(
            (httpx.NetworkError, httpx.TimeoutException, httpx.RemoteProtocolError)
        ),
    )
    def get(self, path: str, params: dict[str, str]) -> dict:
        r = self.client.get(path, params=params)
        if r.status_code >= 500:
            r.raise_for_status()          # will trigger retry
        if r.status_code == 429:
            retry_after = int(r.headers.get("Retry-After", "5"))
            raise httpx.NetworkError(f"Rate limited; retry in {retry_after}s")
        if r.status_code >= 400:
            # 4xx is a permanent failure — don't retry.
            raise ValueError(f"Upstream {r.status_code}: {r.text[:500]}")
        return r.json()

    def close(self):
        self.client.close()


class SupabaseRestClient:
    """Thin PostgREST client. Uses service_role key → bypasses RLS."""

    def __init__(self, s: Settings):
        self.base = f"{s.supabase_url}/rest/v1"
        self.headers = {
            "apikey": s.supabase_service_role_key,
            "Authorization": f"Bearer {s.supabase_service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        }
        self.client = httpx.Client(timeout=s.request_timeout_s)

    @retry(
        reraise=True,
        stop=stop_after_attempt(5),
        wait=wait_exponential(min=1, max=30),
        retry=retry_if_exception_type(
            (httpx.NetworkError, httpx.TimeoutException)
        ),
    )
    def upsert(self, table: str, rows: list[dict], on_conflict: list[str]) -> int:
        if not rows:
            return 0
        params = {}
        if on_conflict:
            params["on_conflict"] = ",".join(on_conflict)
        r = self.client.post(
            f"{self.base}/{table}",
            headers=self.headers,
            params=params,
            content=json.dumps(rows, default=str),
        )
        if r.status_code >= 500:
            r.raise_for_status()
        if r.status_code >= 400:
            raise ValueError(f"Supabase {r.status_code}: {r.text[:500]}")
        return len(rows)

    def insert_run(self, endpoint_key: str, target: str, run_group: str) -> int:
        r = self.client.post(
            f"{self.base}/etl_sync_runs",
            headers={**self.headers, "Prefer": "return=representation"},
            content=json.dumps([{
                "run_group": run_group,
                "endpoint_key": endpoint_key,
                "target_table": target,
                "status": "RUNNING",
            }]),
        )
        r.raise_for_status()
        return r.json()[0]["id"]

    def finish_run(
        self, run_id: int, status: str,
        fetched: int, upserted: int, failed: int,
        error: str | None = None,
    ):
        self.client.patch(
            f"{self.base}/etl_sync_runs",
            headers=self.headers,
            params={"id": f"eq.{run_id}"},
            content=json.dumps({
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "status": status,
                "rows_fetched": fetched,
                "rows_upserted": upserted,
                "rows_failed": failed,
                "error_message": error,
            }),
        )

    def fetch_active_symbols(self, filter_type: str | None = None) -> list[str]:
        """Used by per_symbol / per_etf schedules."""
        params = {"select": "code", "is_active": "eq.true", "limit": "5000"}
        if filter_type:
            params["symbol_type"] = f"eq.{filter_type}"
        r = self.client.get(
            f"{self.base}/symbols",
            headers=self.headers, params=params,
        )
        r.raise_for_status()
        return [row["code"] for row in r.json()]

    def fetch_indices(self) -> list[str]:
        r = self.client.get(
            f"{self.base}/indices",
            headers=self.headers, params={"select": "code", "limit": "100"},
        )
        r.raise_for_status()
        return [row["code"] for row in r.json()]

    def dead_letter(self, run_id: int, endpoint_key: str, table: str,
                    payload: Any, error: str):
        try:
            self.client.post(
                f"{self.base}/etl_dead_letter",
                headers=self.headers,
                content=json.dumps([{
                    "run_id": run_id,
                    "endpoint_key": endpoint_key,
                    "target_table": table,
                    "payload": payload,
                    "error_message": error[:2000],
                }]),
            )
        except Exception:
            log.exception("dead_letter_write_failed", key=endpoint_key)

    def close(self):
        self.client.close()


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------
def _single_call(
    cfg: dict, s: Settings,
    paave: PaaveAPIClient, supa: SupabaseRestClient,
    *, extra_params: dict[str, str] | None = None,
    path_subs: dict[str, str] | None = None,
    context: dict | None = None,
) -> tuple[int, int, int, str | None]:
    """One fetch + transform + upsert cycle (shared by all schedule kinds)."""
    key = cfg["key"]
    target = cfg["target_table"]
    conflict = cfg.get("conflict_cols") or []
    transform_fn = _load_transform(cfg["transform"])

    params = {**_render_params(cfg.get("params")), **(extra_params or {})}
    path = cfg["upstream"]
    for k, v in (path_subs or {}).items():
        path = path.replace("{" + k + "}", str(v))

    run_id = supa.insert_run(f"{key}|{context}", target, s.run_group) if not s.dry_run else -1

    try:
        envelope = paave.get(path, params)
        rows = _call_transform(transform_fn, envelope, context)
        if s.dry_run:
            log.info("dry_run.preview", key=key, ctx=context, rows=len(rows))
            return len(rows), 0, 0, None

        upserted = failed = 0
        for i in range(0, len(rows), s.batch_size):
            batch = rows[i : i + s.batch_size]
            try:
                upserted += supa.upsert(target, batch, conflict)
            except Exception as e:
                failed += len(batch)
                for row in batch:
                    supa.dead_letter(run_id, key, target, row, str(e))
        status = "SUCCESS" if failed == 0 else ("PARTIAL" if upserted > 0 else "FAILED")
        supa.finish_run(run_id, status, len(rows), upserted, failed)
        return len(rows), upserted, failed, None
    except Exception as e:
        err = str(e)[:1000]
        if not s.dry_run:
            supa.finish_run(run_id, "FAILED", 0, 0, 0, err)
        log.error("fetch.failed", key=key, ctx=context, error=err)
        return 0, 0, 0, err


def run_endpoint(
    cfg: dict, s: Settings,
    paave: PaaveAPIClient, supa: SupabaseRestClient,
) -> tuple[str, int, int, int, str | None]:
    key = cfg["key"]
    sched = cfg.get("schedule", "hourly")
    log.info("endpoint.start", key=key, schedule=sched)

    fetched = upserted = failed = 0
    first_err = None

    if sched in ("hourly", "daily", "on_demand", "manual"):
        f, u, fl, err = _single_call(cfg, s, paave, supa)
        fetched, upserted, failed = f, u, fl
        first_err = err

    elif sched == "per_symbol":
        symbols = supa.fetch_active_symbols()
        log.info("per_symbol.iter", key=key, count=len(symbols))
        for sym in symbols:
            f, u, fl, err = _single_call(
                cfg, s, paave, supa,
                path_subs={"symbol": sym},
                context={"symbol": sym},
            )
            fetched += f; upserted += u; failed += fl
            if err and not first_err:
                first_err = err

    elif sched == "per_etf":
        etfs = supa.fetch_active_symbols(filter_type="ETF")
        log.info("per_etf.iter", key=key, count=len(etfs))
        for sym in etfs:
            f, u, fl, err = _single_call(
                cfg, s, paave, supa,
                path_subs={"symbol": sym},
                context={"symbol": sym},
            )
            fetched += f; upserted += u; failed += fl
            if err and not first_err:
                first_err = err

    elif sched == "per_index":
        idxs = supa.fetch_indices()
        log.info("per_index.iter", key=key, count=len(idxs))
        for idx in idxs:
            f, u, fl, err = _single_call(
                cfg, s, paave, supa,
                path_subs={"index": idx},
                context={"index": idx},
            )
            fetched += f; upserted += u; failed += fl
            if err and not first_err:
                first_err = err

    elif sched == "per_module":
        for mod in DEFAULT_MODULES:
            f, u, fl, err = _single_call(
                cfg, s, paave, supa,
                path_subs={"module": mod},
                context={"module": mod},
            )
            fetched += f; upserted += u; failed += fl
            if err and not first_err:
                first_err = err

    else:
        log.warning("endpoint.unknown_schedule", key=key, schedule=sched)

    log.info("endpoint.done", key=key,
             fetched=fetched, upserted=upserted, failed=failed)
    return key, fetched, upserted, failed, first_err


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--group", default="hourly",
                   choices=["hourly", "daily", "manual"])
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--only", nargs="*",
                   help="Run only these endpoint keys.")
    args = p.parse_args()

    s = load_settings(run_group=args.group, dry_run=args.dry_run)
    structlog.configure(wrapper_class=structlog.make_filtering_bound_logger(
        __import__("logging").getLevelName(s.log_level)))

    with s.endpoints_yaml.open() as f:
        cfg_all = yaml.safe_load(f)

    # Schedule → runtime group mapping. Per-* endpoints run with the 'daily'
    # group by default because iterating over every symbol every hour is costly.
    SCHED_TO_GROUP = {
        "hourly":     "hourly",
        "daily":      "daily",
        "per_symbol": "daily",
        "per_etf":    "daily",
        "per_index":  "daily",
        "per_module": "daily",
        "on_demand":  "manual",
        "manual":     "manual",
    }

    endpoints = cfg_all["endpoints"]
    if args.only:
        endpoints = [e for e in endpoints if e["key"] in args.only]
    else:
        endpoints = [
            e for e in endpoints
            if SCHED_TO_GROUP.get(e.get("schedule", "hourly")) == args.group
        ]

    if not endpoints:
        log.warning("no_endpoints_matched", group=args.group, only=args.only)
        sys.exit(0)

    paave = PaaveAPIClient(s)
    supa = SupabaseRestClient(s)
    totals = {"endpoints": 0, "fetched": 0, "upserted": 0, "failed": 0}
    first_error = None

    try:
        for ep in endpoints:
            _, fetched, upserted, failed, err = run_endpoint(ep, s, paave, supa)
            totals["endpoints"] += 1
            totals["fetched"] += fetched
            totals["upserted"] += upserted
            totals["failed"] += failed
            if err and not first_error:
                first_error = err
    finally:
        paave.close()
        supa.close()

    log.info("etl.summary", **totals)
    sys.exit(0 if totals["failed"] == 0 and not first_error else 1)


if __name__ == "__main__":
    main()
