"""
Paave ETL transformers.

Each function takes the raw envelope returned by the Paave API (per spec, always:
{success, data, error, meta}) and returns a list[dict] of rows ready to upsert
into the corresponding Supabase table.

Keep these side-effect free and pure. They are unit-testable.
"""
from __future__ import annotations

from typing import Any, Iterable


def _unwrap(envelope: dict[str, Any]) -> Any:
    """Paave standard response envelope unwrap with defensive defaults."""
    if not envelope.get("success", False):
        err = envelope.get("error") or {}
        raise ValueError(
            f"Upstream returned error: {err.get('code')} — {err.get('message')}"
        )
    return envelope.get("data")


def _as_list(x: Any) -> list[dict]:
    if x is None:
        return []
    if isinstance(x, list):
        return x
    # Some endpoints return {items:[...]} — accept common shapes.
    for key in ("items", "rows", "results", "data"):
        if isinstance(x, dict) and isinstance(x.get(key), list):
            return x[key]
    return [x] if isinstance(x, dict) else []


# ---------------------------------------------------------------------------
# MARKET
# ---------------------------------------------------------------------------
def symbols(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    out = []
    for r in rows:
        out.append({
            "code": r.get("symbolCode") or r.get("code"),
            "name": r.get("symbolName") or r.get("name"),
            "short_name": r.get("shortName"),
            "exchange": r.get("exchange"),
            "symbol_type": r.get("symbolType") or "STOCK",
            "industry": r.get("industry"),
            "sector": r.get("sector"),
            "isin": r.get("isin"),
            "currency": r.get("currency") or "VND",
            "listed_at": r.get("listedAt"),
            "is_active": r.get("isActive", True),
            "static_info": r.get("staticInfo") or {},
        })
    return [r for r in out if r["code"]]


def quote_latest(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    out = []
    for r in rows:
        out.append({
            "symbol_code": r.get("symbolCode") or r.get("code"),
            "ref_price": r.get("refPrice"),
            "ceiling_price": r.get("ceilingPrice"),
            "floor_price": r.get("floorPrice"),
            "open_price": r.get("openPrice"),
            "high_price": r.get("highPrice"),
            "low_price": r.get("lowPrice"),
            "last_price": r.get("lastPrice"),
            "last_volume": r.get("lastVolume"),
            "total_volume": r.get("totalVolume"),
            "total_value": r.get("totalValue"),
            "pct_change": r.get("pctChange"),
            "bid_price": r.get("bidPrice"),
            "bid_size": r.get("bidSize"),
            "ask_price": r.get("askPrice"),
            "ask_size": r.get("askSize"),
            "foreign_buy_vol": r.get("foreignBuyVol"),
            "foreign_sell_vol": r.get("foreignSellVol"),
            "session": r.get("session"),
            "quote_time": r.get("quoteTime") or r.get("timestamp"),
        })
    return [r for r in out if r["symbol_code"]]


def day_bars(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    out = []
    for r in rows:
        out.append({
            "symbol_code": r.get("symbolCode") or r.get("code"),
            "trade_date": r.get("date") or r.get("tradeDate"),
            "open": r.get("open"),
            "high": r.get("high"),
            "low": r.get("low"),
            "close": r.get("close"),
            "volume": r.get("volume"),
            "value": r.get("value"),
            "adj_close": r.get("adjClose"),
        })
    return [r for r in out if r["symbol_code"] and r["trade_date"]]


def session_status(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [
        {"exchange": r["exchange"], "session": r["session"]}
        for r in rows if r.get("exchange") and r.get("session")
    ]


def indices(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [
        {
            "code": r.get("indexCode") or r.get("code"),
            "name": r.get("name"),
            "exchange": r.get("exchange"),
        }
        for r in rows if (r.get("indexCode") or r.get("code"))
    ]


def ranking_up_down(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    return [{
        "kind": "UP_DOWN",
        "scope": None,
        "window_code": "1D",
        "payload": data,
    }]


def dividend_events(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    out = []
    for r in rows:
        out.append({
            "symbol_code": r.get("symbolCode"),
            "ex_date": r.get("exDate"),
            "record_date": r.get("recordDate"),
            "payment_date": r.get("paymentDate"),
            "event_type": r.get("eventType") or "CASH",
            "ratio": r.get("ratio"),
            "amount": r.get("amount"),
            "currency": r.get("currency") or "VND",
        })
    return [r for r in out if r["symbol_code"] and r["ex_date"]]


# ---------------------------------------------------------------------------
# FUNDAMENTALS
# ---------------------------------------------------------------------------
def company_profile(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    if isinstance(data, dict):
        return [{
            "symbol_code": data.get("symbolCode"),
            "profile": data.get("profile") or data,
            "business_info": data.get("businessInfo") or {},
        }]
    return []


def company_financials(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "period": r.get("period"),
        "period_type": r.get("periodType") or "QUARTER",
        "statements": r.get("statements") or {},
        "ratios": r.get("ratios") or {},
    } for r in rows if r.get("symbolCode") and r.get("period")]


def company_shareholders(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    if isinstance(data, dict):
        return [{
            "symbol_code": data.get("symbolCode"),
            "as_of_date": data.get("asOfDate"),
            "shareholders": data.get("shareholders") or [],
        }]
    return []


def ratio_ranking(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "metric": r.get("metric"),
        "period": r.get("period"),
        "value": r.get("value"),
        "rank": r.get("rank"),
        "sector": r.get("sector"),
    } for r in rows if r.get("symbolCode") and r.get("metric") and r.get("period")]


# ---------------------------------------------------------------------------
# NEWS
# ---------------------------------------------------------------------------
def news_items(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "id": r.get("id"),
        "source": r.get("source") or "UNKNOWN",
        "title": r.get("title"),
        "body": r.get("body"),
        "url": r.get("url"),
        "image_url": r.get("imageUrl"),
        "symbols": r.get("symbols") or [],
        "tags": r.get("tags") or [],
        "language": r.get("language") or "vi",
        "published_at": r.get("publishedAt"),
    } for r in rows if r.get("id") and r.get("title")]


def news_announcements(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "id": r.get("id"),
        "symbol_code": r.get("symbolCode"),
        "type": r.get("type"),
        "title": r.get("title"),
        "body": r.get("body"),
        "url": r.get("url"),
        "published_at": r.get("publishedAt"),
    } for r in rows if r.get("id")]


def news_notices(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "id": r.get("id"),
        "title": r.get("title"),
        "body": r.get("body"),
        "url": r.get("url"),
        "category": r.get("category"),
        "published_at": r.get("publishedAt"),
    } for r in rows if r.get("id")]


# ---------------------------------------------------------------------------
# APP
# ---------------------------------------------------------------------------
def holidays(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "holiday_date": r.get("date"),
        "exchange": r.get("exchange"),
        "name": r.get("name"),
        "description": r.get("description"),
    } for r in rows if r.get("date") and r.get("exchange")]


def services(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "name": r.get("name"),
        "status": r.get("status") or "UP",
        "config": r.get("config") or {},
    } for r in rows if r.get("name")]


def app_locale(envelope: dict, *, context: dict | None = None) -> list[dict]:
    """Takes the whole locale catalog and stores one row per language."""
    data = _unwrap(envelope)
    lang = (context or {}).get("lang") or (
        data.get("lang") if isinstance(data, dict) else None
    ) or "vi"
    return [{"lang": lang, "catalog": data}]


def faq(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    ms_name = (context or {}).get("module") or "GENERAL"
    out = []
    for r in rows:
        out.append({
            "ms_name": ms_name,
            "lang": r.get("lang") or "vi",
            "question": r.get("question"),
            "answer": r.get("answer"),
        })
    return [r for r in out if r["question"] and r["answer"]]


# ---------------------------------------------------------------------------
# MARKET EXTRAS
# ---------------------------------------------------------------------------
def daily_returns(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "trade_date":  r.get("date") or r.get("tradeDate"),
        "return_pct":  r.get("returnPct"),
        "volume":      r.get("volume"),
    } for r in rows if r.get("symbolCode") and (r.get("date") or r.get("tradeDate"))]


def liquidity(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    return [{"exchange": (data or {}).get("exchange"), "data": data}]


def price_board(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    return [{"exchange": (data or {}).get("exchange"), "data": data}]


def last_trading_date(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "exchange": r.get("exchange"),
        "trade_date": r.get("tradeDate") or r.get("date"),
    } for r in rows if r.get("exchange")]


def tick_size_match(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    if isinstance(data, list):
        return [{"exchange": None, "rules": data}]
    return [{
        "exchange": data.get("exchange") if isinstance(data, dict) else None,
        "rules":    data,
        "effective_from": (data or {}).get("effectiveFrom"),
    }]


def vnindex_returns(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "trade_date": r.get("date"),
        "close":      r.get("close"),
        "return_1d":  r.get("return1d"),
        "return_1w":  r.get("return1w"),
        "return_1m":  r.get("return1m"),
        "return_ytd": r.get("returnYtd"),
    } for r in rows if r.get("date")]


def static_info(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode") or r.get("code"),
        "lot_size":    r.get("lotSize"),
        "tick_size_rule": r.get("tickSizeRule"),
        "price_limit_pct": r.get("priceLimitPct"),
        "margin_eligible": r.get("marginEligible"),
    } for r in rows if (r.get("symbolCode") or r.get("code"))]


def oddlot_latest(envelope: dict, *, context: dict | None = None) -> list[dict]:
    data = _unwrap(envelope)
    # The endpoint returns a list keyed by symbol
    rows = _as_list(data)
    if rows:
        return [{
            "symbol_code": r.get("symbolCode"),
            "data": r,
        } for r in rows if r.get("symbolCode")]
    if isinstance(data, dict) and (context or {}).get("symbol"):
        return [{"symbol_code": context["symbol"], "data": data}]
    return []


# PUT-THROUGH
def putthrough_advertise(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "side":        r.get("side"),
        "quantity":    r.get("quantity"),
        "price":       r.get("price"),
        "broker":      r.get("broker"),
        "posted_at":   r.get("postedAt"),
    } for r in rows]


def putthrough_deal(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "quantity":    r.get("quantity"),
        "price":       r.get("price"),
        "value":       r.get("value"),
        "executed_at": r.get("executedAt"),
    } for r in rows]


def putthrough_deal_total(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "trade_date":  r.get("tradeDate") or r.get("date"),
        "total_qty":   r.get("totalQty"),
        "total_value": r.get("totalValue"),
        "deal_count":  r.get("dealCount"),
    } for r in rows if r.get("tradeDate") or r.get("date")]


# RANKINGS (typed)
def rankings_foreigner(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    out = []
    now = None
    for r in rows:
        out.append({
            "rank": r.get("rank"),
            "symbol_code": r.get("symbolCode"),
            "net_value":  r.get("netValue"),
            "net_volume": r.get("netVolume"),
            "direction":  r.get("direction") or "NET_BUY",
        })
    return [r for r in out if r["symbol_code"]]


def rankings_stock_trade(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "rank": r.get("rank"),
        "symbol_code": r.get("symbolCode"),
        "trade_value": r.get("tradeValue"),
        "volume": r.get("volume"),
    } for r in rows if r.get("symbolCode")]


def rankings_stock_period(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "rank": r.get("rank"),
        "symbol_code": r.get("symbolCode"),
        "period_code": r.get("period") or "1M",
        "change_pct": r.get("changePct"),
    } for r in rows if r.get("symbolCode")]


def rankings_stock_top(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "rank": r.get("rank"),
        "symbol_code": r.get("symbolCode"),
        "kind": r.get("kind") or "VALUE",
        "value": r.get("value"),
    } for r in rows if r.get("symbolCode")]


def rankings_stock_up_down(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "rank": r.get("rank"),
        "symbol_code": r.get("symbolCode"),
        "direction": r.get("direction") or ("UP" if (r.get("changePct") or 0) >= 0 else "DOWN"),
        "change_pct": r.get("changePct"),
    } for r in rows if r.get("symbolCode")]


def top_ai_rating(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "rank": r.get("rank"),
        "rating": r.get("rating"),
        "score": r.get("score"),
    } for r in rows if r.get("symbolCode")]


def top_foreigner_trading(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "rank": r.get("rank"),
        "direction": r.get("direction") or "NET_BUY",
        "net_value": r.get("netValue"),
    } for r in rows if r.get("symbolCode")]


# ---------------------------------------------------------------------------
# PER-SYMBOL (context dict contains {"symbol": "<CODE>"})
# ---------------------------------------------------------------------------
def symbol_quote_detail(envelope: dict, *, context: dict | None = None) -> list[dict]:
    data = _unwrap(envelope)
    if not isinstance(data, dict): return []
    return [{
        "symbol_code": (context or {}).get("symbol") or data.get("symbolCode"),
        "bids": data.get("bids") or [],
        "asks": data.get("asks") or [],
        "match_history": data.get("matchHistory") or [],
        "session": data.get("session"),
        "quote_time": data.get("quoteTime") or data.get("timestamp"),
    }]


def symbol_minute_chart(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    sym = (context or {}).get("symbol")
    return [{
        "symbol_code": sym or r.get("symbolCode"),
        "bar_time":    r.get("barTime") or r.get("ts") or r.get("timestamp"),
        "open": r.get("open"), "high": r.get("high"),
        "low":  r.get("low"),  "close": r.get("close"),
        "volume": r.get("volume"),
    } for r in rows if (sym or r.get("symbolCode")) and (r.get("barTime") or r.get("ts") or r.get("timestamp"))]


def symbol_statistic(envelope: dict, *, context: dict | None = None) -> list[dict]:
    data = _unwrap(envelope)
    if not isinstance(data, dict): return []
    return [{
        "symbol_code": (context or {}).get("symbol") or data.get("symbolCode"),
        "week52_high": data.get("week52High"),
        "week52_low":  data.get("week52Low"),
        "avg_volume_30d": data.get("avgVolume30d"),
        "beta":           data.get("beta"),
        "market_cap":     data.get("marketCap"),
        "shares_outstanding": data.get("sharesOutstanding"),
        "free_float_pct": data.get("freeFloatPct"),
        "pe_ratio":       data.get("peRatio"),
        "pb_ratio":       data.get("pbRatio"),
        "eps":            data.get("eps"),
        "dividend_yield": data.get("dividendYield"),
    }]


def symbol_rights(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    sym = (context or {}).get("symbol")
    return [{
        "symbol_code": sym or r.get("symbolCode"),
        "right_type":  r.get("rightType") or r.get("type"),
        "ex_date":     r.get("exDate"),
        "record_date": r.get("recordDate"),
        "ratio":       r.get("ratio"),
        "description": r.get("description"),
    } for r in rows]


def symbol_ticks(envelope: dict, *, context: dict | None = None) -> list[dict]:
    data = _unwrap(envelope)
    sym = (context or {}).get("symbol")
    ticks = data if isinstance(data, list) else (data or {}).get("ticks") or []
    return [{"symbol_code": sym, "ticks": ticks}] if sym else []


def symbol_foreigner_daily(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    sym = (context or {}).get("symbol")
    return [{
        "symbol_code": sym or r.get("symbolCode"),
        "trade_date":  r.get("tradeDate") or r.get("date"),
        "buy_volume":  r.get("buyVolume"),
        "sell_volume": r.get("sellVolume"),
        "buy_value":   r.get("buyValue"),
        "sell_value":  r.get("sellValue"),
    } for r in rows if (sym or r.get("symbolCode")) and (r.get("tradeDate") or r.get("date"))]


def symbol_foreigner_summary(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    return [{
        "symbol_code": r.get("symbolCode"),
        "trade_date":  r.get("tradeDate") or r.get("date"),
        "buy_volume":  r.get("buyVolume"),
        "sell_volume": r.get("sellVolume"),
        "buy_value":   r.get("buyValue"),
        "sell_value":  r.get("sellValue"),
        "room_available": r.get("roomAvailable"),
        "room_pct":    r.get("roomPct"),
    } for r in rows if r.get("symbolCode")]


# ---------------------------------------------------------------------------
# PER-INDEX (context: {"index": "VN30"})
# ---------------------------------------------------------------------------
def index_members(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    idx = (context or {}).get("index")
    return [{
        "index_code":  idx or r.get("indexCode"),
        "symbol_code": r.get("symbolCode"),
        "weight":      r.get("weight"),
    } for r in rows if (idx or r.get("indexCode")) and r.get("symbolCode")]


# ---------------------------------------------------------------------------
# PER-ETF (context: {"symbol": "<ETF_CODE>"})
# ---------------------------------------------------------------------------
def etf_index_daily(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    sym = (context or {}).get("symbol")
    return [{
        "symbol_code": sym or r.get("symbolCode"),
        "trade_date":  r.get("date") or r.get("tradeDate"),
        "index_value": r.get("indexValue") or r.get("value"),
        "return_pct":  r.get("returnPct"),
    } for r in rows if (sym or r.get("symbolCode")) and (r.get("date") or r.get("tradeDate"))]


def etf_nav_daily(envelope: dict, *, context: dict | None = None) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    sym = (context or {}).get("symbol")
    return [{
        "symbol_code": sym or r.get("symbolCode"),
        "trade_date":  r.get("date") or r.get("tradeDate"),
        "nav":         r.get("nav"),
        "nav_change":  r.get("navChange"),
    } for r in rows if (sym or r.get("symbolCode")) and (r.get("date") or r.get("tradeDate"))]


# ---------------------------------------------------------------------------
# FUNDAMENTALS EXTRAS
# ---------------------------------------------------------------------------
def company_business_info(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    if not isinstance(data, dict): return []
    return [{"symbol_code": data.get("symbolCode"), "info": data}]


def company_statements(envelope: dict) -> list[dict]:
    rows = _as_list(_unwrap(envelope))
    out = []
    for r in rows:
        for stmt in ("IS", "BS", "CF"):
            blob = r.get(stmt.lower()) or r.get(stmt)
            if blob is None:
                continue
            out.append({
                "symbol_code": r.get("symbolCode"),
                "period":      r.get("period"),
                "statement":   stmt,
                "data":        blob,
            })
    return [o for o in out if o["symbol_code"] and o["period"]]


def company_insiders(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    if not isinstance(data, dict): return []
    return [{
        "symbol_code": data.get("symbolCode"),
        "as_of_date":  data.get("asOfDate"),
        "insiders":    data.get("insiders") or [],
    }] if data.get("symbolCode") else []


def stock_sector_overview(envelope: dict) -> list[dict]:
    data = _unwrap(envelope)
    if not isinstance(data, dict): return []
    return [{"symbol_code": data.get("symbolCode"), "overview": data}]
