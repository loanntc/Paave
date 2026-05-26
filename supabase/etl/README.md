# Paave ETL

Ingests the Paave upstream API into the project's Supabase database.

## Quick start

```bash
cd paave
python -m venv .venv && source .venv/bin/activate
pip install -r supabase/etl/requirements.txt

# Set env in .env.local
#   NEXT_PUBLIC_SUPABASE_URL=...
#   SUPABASE_SERVICE_ROLE_KEY=...       (server-only)
#   PAAVE_API_BASE_URL=https://api.paave.example.com
#   PAAVE_SYSTEM_TOKEN=...               (optional, for protected endpoints)

# dry-run one endpoint
python -m supabase.etl.sync --only market.session_status --dry-run

# full hourly job
python -m supabase.etl.sync --group hourly

# full daily job
python -m supabase.etl.sync --group daily
```

## Cron (recommended)

```
# Hourly (xx:03, to avoid 00:00 quota spikes)
3 * * * *   cd /srv/paave && python -m supabase.etl.sync --group hourly

# Daily post-market (18:30 ICT)
30 11 * * * cd /srv/paave && python -m supabase.etl.sync --group daily
```

Or wire it as a Supabase **Scheduled Edge Function** that triggers the
script over HTTP.

## Adding a new endpoint → table

1. Add a block to `endpoints.yaml`.
2. Add a pure transformer in `transforms.py` (`envelope → list[dict]`).
3. Deploy.

No code changes to `sync.py` required.

## Observability

- Every run writes to `public.etl_sync_runs`.
- Failures go to `public.etl_dead_letter` for operator review.
- `structlog` emits JSON-ish logs — pipe to Loki/Datadog.

## Safety

- The service_role key **bypasses RLS**; never expose it to the mobile app
  or frontend. This process runs server-side only.
- Respect upstream rate limits via the built-in exponential backoff
  (configurable via `ETL_MAX_RETRIES`).
