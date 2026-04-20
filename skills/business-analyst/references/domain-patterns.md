# Domain Patterns Reference

Read the section matching the current project domain. Apply terminology, actors, compliance notes,
and common feature patterns from that section when producing BRD/FRD/SRD.

---

## 1. FINTECH / SECURITIES

### Typical Actors
| Actor | Description |
|-------|-------------|
| Retail Investor | End customer placing orders |
| Relationship Manager (RM) | Staff managing VIP clients |
| Compliance Officer | Reviews regulatory adherence |
| Custodian System | External settlement/clearing |
| Core Banking / OMS | Upstream/downstream integration |

### Common Features & FR Patterns
- Account opening / KYC / eKYC
- Order placement (market, limit, stop-loss)
- Portfolio dashboard & P&L calculation
- Community / social trading feeds
- Notification: order execution, margin call, dividend
- Reporting: trade confirmation, statement, tax report

### Business Rule Patterns
- BR-x: Orders must be validated against available margin before submission
- BR-x: KYC status must be APPROVED before any transaction is permitted
- BR-x: Trade data must be immutable after T+0 confirmation
- BR-x: All user actions must be logged to audit trail with timestamp and IP

### Compliance Flags (Vietnam)
- SSC (Ủy ban Chứng khoán Nhà nước) regulations
- HNX / HOSE trading rules
- Circular 121/2020/TT-BTC (securities companies)
- AML / CTF requirements
- Data retention: minimum 10 years for transaction records

### NFR Defaults
- Order submission latency: p99 < 500ms
- Availability: 99.95% during trading hours (9:00–15:00 VN time)
- Audit log: append-only, tamper-evident

---

## 2. EDTECH / SCHOOL MANAGEMENT

### Typical Actors
| Actor | Description |
|-------|-------------|
| School Admin | Configures system, manages users |
| Teacher / Homeroom Teacher | Records grades, attendance, comments |
| Parent | Views child progress, communicates |
| Student | Accesses learning content |
| Ministry / Sở GD | Regulatory data consumer |

### Common Features & FR Patterns
- Student enrollment & profile management
- Attendance tracking (daily, per-period)
- Grade entry & report card (học bạ) generation
- Parent communication & notification
- Timetable / schedule management
- Fee collection & payment tracking
- Learning content delivery (LMS)

### Business Rule Patterns
- BR-x: Grade entry is locked after [N] days past assessment date
- BR-x: Report card is finalized only after homeroom teacher sign-off
- BR-x: Parent account must be linked to at least one enrolled student
- BR-x: Attendance must be recorded by [time] on the same school day

### Compliance Flags (Vietnam)
- Thông tư 27/2020/TT-BGDĐT — primary school assessment regulations
- Học bạ số mandate — digital school record requirements
- QĐ 4998 — education data standards
- MOET (Bộ GD&ĐT) data reporting formats

### NFR Defaults
- Report generation: < 30s for class of 40 students
- Data export: compatible with MOET import format (.xlsx, .xml)
- Availability: 99.9% during school hours (6:30–18:00 local time)

---

## 3. GENERAL SAAS / WEB APP

### Typical Actors
| Actor | Description |
|-------|-------------|
| End User | Primary product consumer |
| Admin | Manages workspace/org settings |
| Super Admin | Platform-level access |
| API Consumer | Third-party integration |

### Common Features & FR Patterns
- User registration, login, SSO (OAuth2 / SAML)
- Role-based access control (RBAC)
- Subscription & billing management
- Dashboard & analytics
- Notification system (email, push, in-app)
- Data export / import
- Audit log & activity history

### Business Rule Patterns
- BR-x: Free tier limited to [N] [resources] per workspace
- BR-x: Subscription downgrade takes effect at end of billing cycle
- BR-x: Deleted data is soft-deleted for 30 days before permanent removal
- BR-x: API rate limit: [N] requests/minute per token

### Compliance Flags
- PDPA / GDPR: data subject rights (access, deletion, portability)
- SOC 2 Type II considerations for B2B
- WCAG 2.1 AA accessibility (if public-facing)

### NFR Defaults
- API response: p95 < 300ms
- Availability: 99.9% monthly SLA
- Data backup: daily, 30-day retention

---

## 4. E-COMMERCE

### Typical Actors
| Actor | Description |
|-------|-------------|
| Shopper / Customer | Browses and purchases |
| Merchant / Seller | Lists products, fulfills orders |
| Platform Admin | Manages marketplace |
| Logistics Partner | Fulfillment & delivery |
| Payment Gateway | Transaction processing |

### Common Features & FR Patterns
- Product catalog & search
- Cart & checkout flow
- Payment processing (COD, card, e-wallet, BNPL)
- Order management & tracking
- Returns & refunds
- Reviews & ratings
- Promotions, vouchers, flash sales
- Inventory management

### Business Rule Patterns
- BR-x: Stock must be reserved at cart add, released after [N] minutes if unpurchased
- BR-x: Refund only permitted within [N] days of delivery confirmation
- BR-x: Voucher cannot be combined unless explicitly tagged as stackable
- BR-x: Order status transitions: Pending → Confirmed → Shipped → Delivered → [Returned]

### Compliance Flags (Vietnam)
- Nghị định 52/2013/NĐ-CP — e-commerce regulations
- Consumer protection (Luật Bảo vệ người tiêu dùng)
- E-invoice requirement (Thông tư 78/2021/TT-BTC)
- Payment: NAPAS / VNPAY / MoMo integration standards

### NFR Defaults
- Search response: < 500ms
- Checkout completion: < 3s end-to-end
- Payment callback timeout: handle within 30s

---

## 5. ENVIRONMENTAL / GREEN TECH

### Typical Actors
| Actor | Description |
|-------|-------------|
| Field Inspector | Records environmental data on-site |
| Data Analyst | Reviews and validates collected data |
| Regulatory Body | Audits compliance reports |
| Project Manager | Tracks mitigation activities |
| Public / Citizen | May access transparency portal |

### Common Features & FR Patterns
- Environmental data collection (emissions, water, waste)
- Sensor / IoT data ingestion & monitoring
- Compliance report generation
- Incident logging & escalation
- Carbon footprint calculation & offset tracking
- Map-based visualization of monitoring sites
- Alert system for threshold breaches

### Business Rule Patterns
- BR-x: Data readings outside [min–max] range must be flagged for manual review
- BR-x: Incident reports must be escalated within [N] hours of detection
- BR-x: Compliance reports are locked once submitted to regulatory body
- BR-x: Sensor data gaps > [N] minutes must trigger an alert

### Compliance Flags (Vietnam)
- Luật Bảo vệ môi trường 2020
- MONRE (Bộ TN&MT) reporting formats
- QCVN environmental standards (air, water, noise)
- Carbon credit registry standards (if applicable)

### NFR Defaults
- Sensor data ingestion: handle up to [N] events/second
- Alert delivery: < 60s from threshold breach detection
- Report export: PDF + Excel, compatible with MONRE templates

---

## 6. SPA & SELF-CARE / WELLNESS

### Typical Actors
| Actor | Description |
|-------|-------------|
| Client / Customer | Books and receives services |
| Therapist / Staff | Delivers services, manages schedule |
| Receptionist | Handles bookings and check-in |
| Spa Manager / Owner | Oversees operations and reports |

### Common Features & FR Patterns
- Online booking & appointment scheduling
- Service & package catalog
- Staff schedule & availability management
- Client profile & treatment history
- Point-of-sale & payment
- Loyalty program & membership management
- Inventory (products used per treatment)
- Review & feedback collection
- Automated reminders (SMS/Zalo/email)

### Business Rule Patterns
- BR-x: Booking requires [N] hours advance notice; same-day booking only via phone
- BR-x: Cancellation without penalty only if > [N] hours before appointment
- BR-x: Membership points expire after [N] months of inactivity
- BR-x: Staff cannot be double-booked in overlapping time slots
- BR-x: Packages must be consumed within [N] months of purchase

### Compliance Flags (Vietnam)
- Business license requirements for spa/beauty services
- Personal data handling: consent for client health/skin records
- Payment: e-invoice compliance if applicable

### NFR Defaults
- Booking confirmation: delivered within 30s via chosen channel
- Calendar view: load < 1s for weekly view
- Reminder: sent automatically 24h and 2h before appointment
