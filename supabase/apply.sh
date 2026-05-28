#!/usr/bin/env bash
# ============================================================================
# Paave Supabase — apply migrations + seed.
# ============================================================================
# Usage (from the Paave repo root):
#   ./supabase/apply.sh           # schema + seed
#   ./supabase/apply.sh --dry     # schema only, rolled back (validates)
#   ./supabase/apply.sh --schema  # schema only (no seed)
#
# Reads credentials from ./.env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_DB_PASSWORD).
# ============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Load .env.local
set -a
# shellcheck disable=SC1091
source ./.env.local
set +a

REF="wlxyfcymrtvklznnyykn"
HOST="aws-1-ap-southeast-1.pooler.supabase.com"   # session pooler (DDL-safe)
PORT="5432"
DB="postgres"
USER="postgres.${REF}"
PW="${SUPABASE_DB_PASSWORD:?SUPABASE_DB_PASSWORD missing in .env.local}"

export PGPASSWORD="$PW"
export PGSSLMODE="require"

MODE="${1:-apply}"
case "$MODE" in
  --dry)     SEED=0; WRAP='begin; \i %s; rollback;' ;;
  --schema)  SEED=0; WRAP='\i %s' ;;
  apply|"")  SEED=1; WRAP='\i %s' ;;
  *) echo "unknown mode: $MODE"; exit 2 ;;
esac

echo ">>> Connecting to $HOST:$PORT as $USER"
psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
     -v ON_ERROR_STOP=1 \
     -c "select 'connected to ' || current_database() as db, version();"

for f in supabase/migrations/*.sql; do
  echo ""
  echo ">>> $f"
  # shellcheck disable=SC2059
  CMD=$(printf "$WRAP" "$f")
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -v ON_ERROR_STOP=1 -f "$f"
done

if [ "$SEED" = "1" ]; then
  echo ""
  echo ">>> supabase/seed.sql"
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -v ON_ERROR_STOP=1 -f supabase/seed.sql
fi

echo ""
echo ">>> Row counts"
psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -A -t <<'SQL'
select 'profiles='       || (select count(*) from public.profiles);
select 'symbols='        || (select count(*) from public.symbols);
select 'posts='          || (select count(*) from public.posts);
select 'virtual_orders=' || (select count(*) from public.virtual_orders);
select 'virtual_trades=' || (select count(*) from public.virtual_trades);
select 'watchlists='     || (select count(*) from public.watchlists);
select 'news_items='     || (select count(*) from public.news_items);
select 'rls_enabled_tables=' || (select count(*) from pg_tables where schemaname='public' and rowsecurity);
select 'public_tables='      || (select count(*) from pg_tables where schemaname='public');
SQL

echo ""
echo "✓ Done."
