# Data Patterns for Trading Systems

## 1. Core Schema Patterns

### Orders Table
```sql
CREATE TABLE orders (
    order_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(account_id),
    exchange        VARCHAR(10) NOT NULL,  -- HOSE, HNX, UPCOM
    symbol          VARCHAR(20) NOT NULL,
    side            VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type      VARCHAR(10) NOT NULL,  -- LO, MP, MOK, MAK, ATO, ATC
    quantity        BIGINT NOT NULL,
    price           NUMERIC(18,2),         -- NULL for MP orders
    filled_qty      BIGINT NOT NULL DEFAULT 0,
    avg_fill_price  NUMERIC(18,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    session         VARCHAR(20),           -- CONTINUOUS, ATO, ATC
    trading_date    DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    cancel_reason   TEXT,
    broker_order_id VARCHAR(50),           -- exchange-assigned ID
    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_lot_size CHECK (quantity % 100 = 0)
);

CREATE INDEX idx_orders_account_date ON orders(account_id, trading_date);
CREATE INDEX idx_orders_symbol_date ON orders(symbol, trading_date);
CREATE INDEX idx_orders_status ON orders(status) WHERE status IN ('PENDING', 'PARTIAL');
```

### Trades (Executions) Table
```sql
CREATE TABLE trades (
    trade_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(order_id),
    account_id      UUID NOT NULL,
    exchange        VARCHAR(10) NOT NULL,
    symbol          VARCHAR(20) NOT NULL,
    side            VARCHAR(4) NOT NULL,
    quantity        BIGINT NOT NULL,
    price           NUMERIC(18,2) NOT NULL,
    trade_value     NUMERIC(18,2) GENERATED ALWAYS AS (quantity * price) STORED,
    fee             NUMERIC(18,2),
    tax             NUMERIC(18,2),
    settlement_date DATE NOT NULL,
    executed_at     TIMESTAMPTZ NOT NULL,
    exchange_trade_id VARCHAR(50)
) PARTITION BY RANGE (executed_at);

CREATE INDEX idx_trades_order ON trades(order_id);
CREATE INDEX idx_trades_account_date ON trades(account_id, executed_at);
```

### Audit Log Table
```sql
CREATE TABLE order_audit_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(30) NOT NULL,
    order_id        UUID,
    user_id         UUID NOT NULL,
    account_id      UUID NOT NULL,
    ip_address      INET,
    exchange        VARCHAR(10),
    symbol          VARCHAR(20),
    side            VARCHAR(4),
    order_type      VARCHAR(10),
    quantity        BIGINT,
    price           NUMERIC(18,2),
    status_before   VARCHAR(20),
    status_after    VARCHAR(20),
    rejection_reason TEXT,
    session_id      VARCHAR(100),
    payload         JSONB,               -- full snapshot
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE order_audit_log_2024_01 PARTITION OF order_audit_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## 2. Market Data Schema (TimescaleDB)

```sql
-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- OHLCV (candlestick) data
CREATE TABLE ohlcv (
    time        TIMESTAMPTZ NOT NULL,
    symbol      VARCHAR(20) NOT NULL,
    exchange    VARCHAR(10) NOT NULL,
    open        NUMERIC(18,2),
    high        NUMERIC(18,2),
    low         NUMERIC(18,2),
    close       NUMERIC(18,2),
    volume      BIGINT,
    value       NUMERIC(20,2),  -- total trade value
    num_trades  INT
);

SELECT create_hypertable('ohlcv', 'time', chunk_time_interval => INTERVAL '1 day');
CREATE INDEX idx_ohlcv_symbol_time ON ohlcv(symbol, time DESC);

-- Tick data (individual trades)
CREATE TABLE tick_data (
    time        TIMESTAMPTZ NOT NULL,
    symbol      VARCHAR(20) NOT NULL,
    exchange    VARCHAR(10) NOT NULL,
    price       NUMERIC(18,2) NOT NULL,
    volume      BIGINT NOT NULL,
    side        VARCHAR(4),
    match_type  VARCHAR(20)
);

SELECT create_hypertable('tick_data', 'time', chunk_time_interval => INTERVAL '1 day');

-- Order book snapshots
CREATE TABLE order_book_snapshot (
    time        TIMESTAMPTZ NOT NULL,
    symbol      VARCHAR(20) NOT NULL,
    exchange    VARCHAR(10) NOT NULL,
    bids        JSONB,   -- [{price, qty}, ...]
    asks        JSONB,
    ref_price   NUMERIC(18,2),
    ceiling     NUMERIC(18,2),
    floor       NUMERIC(18,2)
);

SELECT create_hypertable('order_book_snapshot', 'time', chunk_time_interval => INTERVAL '1 hour');
```

---

## 3. Foreign Room Table

```sql
CREATE TABLE foreign_room (
    symbol              VARCHAR(20) PRIMARY KEY,
    exchange            VARCHAR(10) NOT NULL,
    total_shares        BIGINT NOT NULL,
    foreign_limit_pct   NUMERIC(5,2) NOT NULL,  -- e.g. 49.00
    foreign_limit_qty   BIGINT GENERATED ALWAYS AS 
                        (FLOOR(total_shares * foreign_limit_pct / 100)) STORED,
    foreign_held_qty    BIGINT NOT NULL DEFAULT 0,
    reserved_qty        BIGINT NOT NULL DEFAULT 0,  -- pending buy orders
    available_room      BIGINT GENERATED ALWAYS AS
                        (FLOOR(total_shares * foreign_limit_pct / 100) - foreign_held_qty - reserved_qty) STORED,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_foreign_room_exchange ON foreign_room(exchange);
```

---

## 4. Redis Key Patterns

```
# Session state per exchange
trading:session:{exchange}  →  { state: "CONTINUOUS", start: "09:00", end: "11:30" }

# Foreign room reservation (atomic)
foreign:room:{symbol}:reserved  →  integer (quantity)

# Order rate limiting per account
ratelimit:order:{account_id}  →  counter (TTL: 1 second)

# Reference prices
market:ref_price:{exchange}:{symbol}  →  { price, ceiling, floor, tick_size }

# Order book (sorted set)
orderbook:bid:{exchange}:{symbol}  →  ZSET { price: quantity }
orderbook:ask:{exchange}:{symbol}  →  ZSET { price: quantity }

# Account buying power cache
account:buying_power:{account_id}  →  { available, reserved } (TTL: 30 seconds)
```

---

## 5. Kafka Topic Patterns

```
# Order lifecycle events
orders.placed         # new order submitted
orders.modified       # order amendment
orders.cancelled      # order cancelled
orders.executed       # order fill (partial or full)
orders.rejected       # order rejected at gateway

# Market data
market.tick.{exchange}.{symbol}     # real-time tick data
market.ohlcv.{exchange}.1m          # 1-minute candles
market.orderbook.{exchange}.{symbol} # order book updates
market.session.{exchange}           # session state changes

# Settlement
settlement.pending    # trades awaiting settlement
settlement.completed  # confirmed settlements

# Audit
audit.order.events    # all order events for compliance logging
```

---

## 6. Partitioning Strategy

| Table | Partition By | Interval | Archive After |
|---|---|---|---|
| orders | trading_date (RANGE) | Monthly | 2 years |
| trades | executed_at (RANGE) | Monthly | 2 years |
| order_audit_log | created_at (RANGE) | Monthly | 2 years (cold after 2y, keep 10y) |
| tick_data | time (hypertable) | Daily | 1 year hot, 5 years cold |
| ohlcv | time (hypertable) | Daily | Keep indefinitely (small) |
