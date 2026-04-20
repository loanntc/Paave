# API Design Standards

## 1. REST Conventions

### URL Structure
```
/api/v{version}/{resource}/{id}/{sub-resource}
```
- Lowercase, hyphen-separated
- Plural nouns for collections: `/orders`, `/accounts`
- No verbs in URLs (use HTTP methods)

### HTTP Methods
| Method | Use | Idempotent |
|---|---|---|
| GET | Read | Yes |
| POST | Create | No |
| PUT | Full replace | Yes |
| PATCH | Partial update | No |
| DELETE | Remove | Yes |

### Versioning
- URL path versioning: `/api/v1/`, `/api/v2/`
- Minimum: support current + 1 previous version
- Deprecation notice: 6 months minimum

---

## 2. Standard Response Envelope

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-15T09:00:00.000Z",
    "version": "1.0"
  }
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ORDER_PRICE_OUT_OF_RANGE",
    "message": "Order price 25,000 exceeds ceiling price 21,700",
    "details": { "ceiling": 21700, "floor": 19300, "submitted": 25000 }
  },
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

---

## 3. Standard Error Codes

### Order Errors
| Code | HTTP | Description |
|---|---|---|
| `ORDER_PRICE_OUT_OF_RANGE` | 422 | Price outside [floor, ceiling] |
| `ORDER_INVALID_TICK_SIZE` | 422 | Price not multiple of tick size |
| `ORDER_INVALID_QUANTITY` | 422 | Quantity not multiple of board lot |
| `ORDER_TYPE_NOT_ALLOWED` | 422 | Order type not valid for current session/exchange |
| `ORDER_OUTSIDE_TRADING_HOURS` | 422 | Order submitted outside trading session |
| `ORDER_FOREIGN_ROOM_EXCEEDED` | 422 | Insufficient foreign room |
| `ORDER_INSUFFICIENT_BALANCE` | 422 | Insufficient buying power |
| `ORDER_NOT_FOUND` | 404 | Order ID does not exist |
| `ORDER_ALREADY_CANCELLED` | 409 | Cannot cancel already-cancelled order |
| `ORDER_ALREADY_EXECUTED` | 409 | Cannot modify executed order |

### Auth Errors
| Code | HTTP | Description |
|---|---|---|
| `AUTH_UNAUTHORIZED` | 401 | Missing or invalid token |
| `AUTH_FORBIDDEN` | 403 | Insufficient permissions |
| `AUTH_SESSION_EXPIRED` | 401 | Token expired |

### System Errors
| Code | HTTP | Description |
|---|---|---|
| `SYSTEM_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 4. Authentication

> Full authentication rules in `references/auth-security.md`. Summary below.

- **Access token**: JWT (RS256), short-lived (15 min), contains `sub`, `device_id`, `session_id`, `jti`
- **Refresh token**: Opaque, 7-day sliding TTL, **per-device**, server-side in Redis
- **Header**: `Authorization: Bearer <token>`
- **Step-up token**: `X-StepUp-Token: <token>` for sensitive actions (5 min, action-scoped)
- **API Key** (system-to-system): `X-API-Key: <key>` — never in URL
- SSO flows must use PKCE + state parameter — see `references/auth-security.md` Section 11
- All auth events must be logged — see `references/auth-security.md` Section 9

---

## 5. Rate Limiting

| Endpoint Type | Limit |
|---|---|
| Order placement | 10 req/sec per account |
| Order query | 100 req/sec per account |
| Market data | 50 req/sec per IP |
| Auth endpoints | 5 req/min per IP |

Headers returned:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1705312800
```

---

## 6. WebSocket Standards

- Endpoint: `wss://api.domain.com/v1/ws`
- Heartbeat: client sends `{"type":"ping"}` every 30s; server responds `{"type":"pong"}`
- Auth: send auth message within 5s of connect or connection drops
- Message envelope:
```json
{
  "type": "order_update",
  "channel": "orders",
  "data": { },
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

---

## 7. Pagination

```
GET /api/v1/orders?page=1&page_size=50&sort=created_at&order=desc
```

Response meta:
```json
"meta": {
  "page": 1,
  "page_size": 50,
  "total_count": 1250,
  "total_pages": 25
}
```

Cursor-based (for high-volume, time-series):
```
GET /api/v1/trades?cursor=<encoded_cursor>&limit=100
```
