"""
Paave ETL — runtime configuration.

All config is driven by environment variables (.env.local in dev). Nothing
secret-looking is hard-coded.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv


ENV_FILE = Path(__file__).resolve().parents[2] / ".env.local"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)


@dataclass(frozen=True)
class Settings:
    # --- Supabase (destination) ---
    supabase_url: str
    supabase_service_role_key: str  # bypasses RLS — NEVER expose client-side

    # --- Paave API (source) ---
    paave_base_url: str
    paave_system_token: str | None   # optional system JWT for auth'd endpoints

    # --- ETL runtime ---
    endpoints_yaml: Path
    run_group: str                   # 'hourly' | 'daily' | 'manual'
    dry_run: bool
    request_timeout_s: float
    max_retries: int
    batch_size: int
    log_level: str


def load_settings(run_group: str = "manual", dry_run: bool = False) -> Settings:
    missing = [
        k for k in ("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
        if not os.getenv(k)
    ]
    if missing:
        raise RuntimeError(f"Missing required env vars: {missing}")

    return Settings(
        supabase_url=os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/"),
        supabase_service_role_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        paave_base_url=os.environ.get(
            "PAAVE_API_BASE_URL", "https://api.paave.example.com"
        ).rstrip("/"),
        paave_system_token=os.environ.get("PAAVE_SYSTEM_TOKEN"),
        endpoints_yaml=Path(__file__).parent / "endpoints.yaml",
        run_group=run_group,
        dry_run=dry_run,
        request_timeout_s=float(os.environ.get("ETL_TIMEOUT_S", "30")),
        max_retries=int(os.environ.get("ETL_MAX_RETRIES", "5")),
        batch_size=int(os.environ.get("ETL_BATCH_SIZE", "500")),
        log_level=os.environ.get("ETL_LOG_LEVEL", "INFO"),
    )
