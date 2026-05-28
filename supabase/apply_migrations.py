"""
Apply Paave migrations + seed to the real Supabase project.

Strategy:
- Each migration runs in its own transaction. If any fails, we STOP
  (don't proceed to the next) and report. Prior successful migrations
  stay applied.
- Seed runs last, also in a transaction.
"""
import os
import pathlib
import re
import sys

import psycopg
from dotenv import dotenv_values

ROOT = pathlib.Path("/sessions/lucid-determined-meitner/mnt/Paave")
env = dotenv_values(ROOT / ".env.local")

PW = env["SUPABASE_DB_PASSWORD"]
REF = "wlxyfcymrtvklznnyykn"
# Session pooler (port 5432) — supports DDL.
DSN = (
    f"postgresql://postgres.{REF}:{PW}"
    f"@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
    "?sslmode=require&application_name=paave-migrator"
)

migrations = sorted((ROOT / "supabase" / "migrations").glob("*.sql"))
seed_path = ROOT / "supabase" / "seed.sql"

def apply(label: str, sql: str, *, allow_failure: bool = False):
    print(f"\n==> {label}  ({len(sql.splitlines())} lines)", flush=True)
    try:
        with psycopg.connect(DSN, autocommit=False) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
        print(f"    ✓ applied", flush=True)
        return True
    except Exception as e:
        msg = str(e)[:800]
        if allow_failure:
            print(f"    ⚠ skipped: {msg}", flush=True)
            return True
        print(f"    ✗ FAILED: {msg}", flush=True)
        return False

def main():
    print(f"Connecting to {DSN.split('@')[1].split('?')[0]}…")
    try:
        with psycopg.connect(DSN) as conn:
            with conn.cursor() as cur:
                cur.execute("select current_database(), version();")
                db, ver = cur.fetchone()
                print(f"  database: {db}")
                print(f"  version:  {ver.split(',')[0]}")
                # Check for pre-existing public tables
                cur.execute("""
                    select table_name from information_schema.tables
                    where table_schema='public' and table_type='BASE TABLE'
                    order by table_name
                """)
                pre = [r[0] for r in cur.fetchall()]
                print(f"  pre-existing public.* tables: {len(pre)}")
                if pre:
                    print(f"    {pre}")
    except Exception as e:
        print(f"FATAL: cannot connect — {e}")
        sys.exit(1)

    for m in migrations:
        ok = apply(m.name, m.read_text())
        if not ok:
            print(f"\nSTOPPING — migration {m.name} failed. Fix + rerun.")
            sys.exit(2)

    # Seed
    ok = apply("seed.sql", seed_path.read_text())
    if not ok:
        print("\nSchema applied but seed failed. You can re-run seed manually.")
        sys.exit(3)

    # Post-check
    with psycopg.connect(DSN) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select 'profiles',       (select count(*) from public.profiles) union all
                select 'symbols',        (select count(*) from public.symbols)  union all
                select 'posts',          (select count(*) from public.posts)    union all
                select 'virtual_orders', (select count(*) from public.virtual_orders) union all
                select 'virtual_trades', (select count(*) from public.virtual_trades) union all
                select 'news_items',     (select count(*) from public.news_items) union all
                select 'watchlists',     (select count(*) from public.watchlists);
            """)
            print("\n=== ROW COUNTS ===")
            for name, n in cur.fetchall():
                print(f"  {name:18s} {n}")

            cur.execute("""
                select count(*) from pg_tables
                where schemaname='public' and rowsecurity=true;
            """)
            rls_count = cur.fetchone()[0]
            cur.execute("""
                select count(*) from pg_tables
                where schemaname='public';
            """)
            total_tables = cur.fetchone()[0]
            print(f"\n=== RLS COVERAGE ===")
            print(f"  {rls_count}/{total_tables} public tables have RLS enabled")

    print("\n✓ Done.")

if __name__ == "__main__":
    main()
