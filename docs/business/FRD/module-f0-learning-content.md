# F0 Learning Path — Full Content Library

**Version:** 1.0
**Date:** 2026-05-27
**Author:** Business Analyst — Paave
**Linked FRD:** module-f0-learning.md (FR-LEARN-01 → FR-LEARN-16)
**Status:** Draft — Pending Content Review

> This document contains: (1) User Learning Level definitions, (2) Initial Placement Quiz, (3) Module Knowledge Checks (unlock gates), (4) Complete card-by-card content for all 20 lessons (L1.1–L4.5).
> Card format per lesson: Concept → Example → Myth-Buster → Quiz → CTA.

---

## Table of Contents

1. [User Learning Level System](#1-user-learning-level-system)
2. [Initial Placement Quiz (FR-LEARN-19)](#2-initial-placement-quiz)
3. [Module Knowledge Checks (FR-LEARN-18)](#3-module-knowledge-checks)
4. [Module 1 — The VN Stock Market](#4-module-1-the-vn-stock-market)
5. [Module 2 — Your First Trade](#5-module-2-your-first-trade)
6. [Module 3 — Thinking in Portfolios](#6-module-3-thinking-in-portfolios)
7. [Module 4 — Trader Psychology](#7-module-4-trader-psychology)

---

## 1. User Learning Level System

### 1.1 Design Rationale

The Trader Tier system (FR-GAME-02) measures **performance** (Trader Score, trading activity). The Learning Level system measures **knowledge progress**. The two systems are independent; a user can be Tier 4 but Learning Level 2 (experienced trader who skipped the learning path), or Tier 1 and Learning Level 5 (completed all modules but new to trading).

Both are displayed on the user profile:
- Trader Tier badge: bottom-left of avatar
- Learning Level badge: bottom-right of avatar

### 1.2 Level Definitions

| Level | ID | VN Name | EN Name | Unlock Condition |
|-------|----|---------|---------|-----------------|
| 0 | `LVL_F0_NEWCOMER` | Tân binh | Newcomer | Account created; M1 not yet started |
| 1 | `LVL_F0_EXPLORING` | Đang khám phá | Exploring | ≥1 lesson in M1 completed |
| 2 | `LVL_F1_BASICS` | Hiểu thị trường | Market Basics | M1 complete + Module 1 Knowledge Check passed (≥3/5) |
| 3 | `LVL_F1_TRADER` | Biết giao dịch | Can Trade | M2 complete + Module 2 Knowledge Check passed + ≥5 paper trades placed |
| 4 | `LVL_F2_PORTFOLIO` | Tư duy danh mục | Portfolio Thinker | M3 complete + Module 3 Knowledge Check passed |
| 5 | `LVL_F2_DISCIPLINED` | Trader có kỷ luật | Disciplined Trader | M4 complete + Module 4 Knowledge Check passed |

### 1.3 Rules

- Learning Level can only increase, never decrease.
- Level is re-evaluated after every module completion and every Knowledge Check result.
- Displayed as a pill badge: e.g., `F1 · Biết giao dịch` in `accent-secondary` color.
- Level 0 badge hidden (no label shown until Level 1 reached).
- Learning Level is public (visible on profile); Trader Tier is also public.
- Idempotency: level upgrade event uses key `{user_id}_{level_id}_LEVEL_UP` — granted once.
- XP on level-up: +15 XP per level advancement (granted via FR-GAME-01).

---

## 2. Initial Placement Quiz

> **FR-LEARN-19** — Optional 5-question quiz. Triggered when user taps "Tôi đã biết chứng khoán cơ bản" (I already know the basics) on the Welcome Modal (FR-LEARN-01). Pass threshold: 4/5 correct → skip M1. Fail: M1 required. One attempt per account; cannot be retried.

| # | Question | A | B | C | D | Correct | Hint |
|---|----------|---|---|---|---|---------|------|
| PQ-1 | Mã cổ phiếu VNM niêm yết tại sàn nào? | HNX | **HoSE** | UPCoM | NYSE | B | Vinamilk — công ty sữa lớn nhất VN — niêm yết tại sàn giao dịch lớn nhất. |
| PQ-2 | Biên độ dao động giá trên HoSE là bao nhiêu? | ±5% | ±10% | **±7%** | ±15% | C | HoSE ±7%, HNX ±10%, UPCoM ±15%. |
| PQ-3 | Lô giao dịch tối thiểu trên HoSE là bao nhiêu cổ phiếu? | 1 | 10 | 50 | **100** | D | VN standard = 100 cổ phiếu mỗi lô. |
| PQ-4 | T+2 trong giao dịch chứng khoán VN có nghĩa là gì? | Phải đặt lệnh trước 2 ngày | Phí giao dịch 2% | **Cổ phiếu/tiền về tài khoản sau 2 ngày làm việc** | Tối đa 2 lệnh/ngày | C | T = ngày giao dịch; +2 = 2 ngày KINH DOANH để thanh toán. |
| PQ-5 | Loại lệnh nào cho phép chỉ định giá mua cụ thể? | ATO | ATC | MP | **LO** | D | LO = Limit Order = lệnh giới hạn giá. |

**Pass (4–5/5):** Modal shows "Tuyệt! Bạn đã có kiến thức nền tảng. Module 1 được mở khóa để ôn tập, nhưng bạn có thể bắt đầu từ Module 2." → M1 set to `SKIPPED_VIA_PLACEMENT`; M2 unlocked. M1 still accessible in review mode.

**Fail (0–3/5):** Modal shows "Hãy bắt đầu từ Module 1 để xây nền vững chắc! Kiến thức cơ bản là chìa khóa." → M1 unlocked as normal.

---

## 3. Module Knowledge Checks

> **FR-LEARN-18** — A 5-question quiz unlocked after all 5 lessons in a module are complete. Must score ≥3/5 to advance the Learning Level and trigger next-module unlock evaluation. Unlimited retries; 60-second cooldown between attempts. Questions presented in random order each attempt. Each question is drawn from one lesson (one per lesson) to ensure broad coverage.

### 3.1 Module 1 Knowledge Check (MKC-1)

| # | Source | Question | A | B | C | D | Correct | Hint |
|---|--------|----------|---|---|---|---|---------|------|
| MKC1-1 | L1.1 | Khi mua cổ phiếu, bạn nhận được điều gì? | Lãi suất cố định | Khoản vay | **Quyền sở hữu một phần công ty** | Hợp đồng mua hàng | C | Cổ phiếu = ownership share. |
| MKC1-2 | L1.2 | HoSE đóng cửa phiên sáng lúc mấy giờ? | 11:00 | **11:30** | 12:00 | 12:30 | B | Phiên sáng HoSE: 9:00–11:30. |
| MKC1-3 | L1.3 | Cổ phiếu HoSE tham chiếu 50,000 VND. Giá trần là? | 53,000 | **53,500** | 55,000 | 57,000 | B | HoSE ±7%: 50,000 × 1.07 = 53,500. |
| MKC1-4 | L1.4 | Điều gì KHÔNG ảnh hưởng đến giá cổ phiếu? | Lãi suất ngân hàng | Kết quả kinh doanh | Tin tức vĩ mô | **Màu sắc logo công ty** | D | Giá phản ánh cung-cầu, kinh tế, và doanh nghiệp thực tế. |
| MKC1-5 | L1.5 | Điều gì xảy ra khi đặt lệnh mua cao hơn giá trần? | Khớp tại giá trần | Khớp bình thường | Chờ ngày mai | **Bị từ chối ngay lập tức** | D | Sàn giao dịch từ chối lệnh ngoài biên độ. |

### 3.2 Module 2 Knowledge Check (MKC-2)

| # | Source | Question | A | B | C | D | Correct | Hint |
|---|--------|----------|---|---|---|---|---------|------|
| MKC2-1 | L2.1 | Lệnh LO bảo đảm điều gì? | Khớp ngay lập tức | Khớp tại giá tham chiếu | **Khớp tại giá bạn đặt hoặc tốt hơn** | Không bao giờ bị từ chối | C | LO = Limit Order. Chỉ khớp ở giá ≤ giá mua đặt. |
| MKC2-2 | L2.2 | Số lượng đặt lệnh nào HỢP LỆ trên HoSE? | 50 | 150 | **200** | 250 | C | Bội số của 100: 200 = 100×2 ✓. |
| MKC2-3 | L2.3 | Mua 200 HPG tại 33,000 VND. Tổng giá trị? | 3,300,000 | 3,600,000 | **6,600,000** | 33,000,000 | C | 200 × 33,000 = 6,600,000 VND. |
| MKC2-4 | L2.4 | Mua cổ phiếu thứ Tư. Khi nào bán được? | Thứ Năm | **Thứ Sáu** | Thứ Bảy | Thứ Hai | B | T+2 ngày làm việc: Thứ Tư + 2 = Thứ Sáu. |
| MKC2-5 | L2.5 | P&L chưa thực hiện là gì? | Tiền đã rút | Phí đã trả | Số dư tiền mặt | **Lãi/lỗ trên vị thế đang nắm giữ** | D | "Chưa thực hiện" = chưa bán = chưa chốt lời/lỗ. |

### 3.3 Module 3 Knowledge Check (MKC-3)

| # | Source | Question | A | B | C | D | Correct | Hint |
|---|--------|----------|---|---|---|---|---------|------|
| MKC3-1 | L3.1 | Mục đích chính của đa dạng hóa danh mục? | Tối đa hóa lợi nhuận | Mua nhiều cổ phiếu hơn | **Giảm rủi ro tập trung vào một ngành/mã** | Tránh phải nghiên cứu kỹ | C | Đa dạng hóa = trải rủi ro. |
| MKC3-2 | L3.2 | Mã nào KHÔNG thuộc ngành Tài chính? | VCB | BID | TCB | **MWG** | D | MWG (Mobile World) = ngành Bán lẻ, không phải Tài chính. |
| MKC3-3 | L3.3 | Danh sách theo dõi cho phép bạn làm gì? | Tự động mua khi giá giảm | **Theo dõi biến động giá mà chưa mua** | Nhận cổ tức | Tạo danh mục ảo | B | Watchlist = theo dõi để chuẩn bị quyết định. |
| MKC3-4 | L3.4 | Cảnh báo giá hoạt động như thế nào? | Tự đặt lệnh mua | Chặn giao dịch trên mức giá | **Gửi thông báo khi cổ phiếu đạt ngưỡng giá** | Cập nhật danh mục tự động | C | Alert = thông báo, không tự giao dịch. |
| MKC3-5 | L3.5 | Điểm sức khỏe danh mục 78/100 có nghĩa là? | Lợi nhuận 78% | 78% cổ phiếu đang có lãi | **Quản lý rủi ro và đa dạng hóa tốt** | Tăng 78,000 VND | C | Health Score = chất lượng quản lý rủi ro, không phải lợi nhuận. |

### 3.4 Module 4 Knowledge Check (MKC-4)

| # | Source | Question | A | B | C | D | Correct | Hint |
|---|--------|----------|---|---|---|---|---------|------|
| MKC4-1 | L4.1 | FOMO thường khiến nhà đầu tư làm gì? | Nghiên cứu kỹ trước khi mua | **Mua ở gần đỉnh sau khi giá đã tăng mạnh** | Bán đúng thời điểm | Đa dạng hóa tốt hơn | B | FOMO = mua vì sợ bỏ lỡ, không vì phân tích. |
| MKC4-2 | L4.2 | Điều gì phân biệt bán có kế hoạch với bán hoảng loạn? | Thời gian bán | Giá bán | Số lượng bán | **Lý do bán: phân tích vs. cảm xúc** | D | Bán hoảng loạn = triggered by fear, not analysis. |
| MKC4-3 | L4.3 | 10 giao dịch (mua + bán) với phí 0.25%/lệnh. Tổng phí? | 0.25% | 2.5% | **5%** | 25% | C | 10 RT × 2 lệnh × 0.25% = 5%. |
| MKC4-4 | L4.4 | Nhà đầu tư: 30% thắng, mỗi lần +20%; 70% thua, mỗi lần -3%. Kết quả 10 giao dịch? | Lỗ nặng | **Có lãi** | Hòa vốn | Không tính được | B | 3×20% = +60%; 7×3% = -21%; net = +39%. |
| MKC4-5 | L4.5 | Quy tắc giao dịch giúp nhà đầu tư điều gì nhất? | Tự động hóa giao dịch | Đảm bảo không lỗ | **Loại bỏ cảm xúc khỏi quyết định** | Tối đa hóa lợi nhuận ngắn hạn | C | Rules prevent emotional override at critical moments. |

---

## 4. Module 1 — The VN Stock Market

> **Prerequisite:** None — auto-unlocked on account creation.
> **Completion reward:** +125 XP · "Market Foundations" badge (Common) · Learning Level → 2

---

### L1.1 — Cổ phiếu là gì? (What is a Stock?)

**Learning objectives:** Understand stock as ownership; distinguish from bonds/savings; name 2–3 real VN companies on HoSE.

---

**Card 1 — Concept**
> **Cổ phiếu = Quyền sở hữu một phần công ty**

Khi một công ty muốn huy động vốn, họ chia công ty thành hàng triệu **cổ phần** nhỏ và bán ra công chúng. Mỗi cổ phần bạn mua = bạn sở hữu một mảnh nhỏ của công ty đó.

**4 điều cần nhớ:**
1. **Cổ đông** (shareholder) = chủ sở hữu một phần công ty
2. **Lợi nhuận từ cổ phiếu** có 2 nguồn: giá tăng (capital gain) + cổ tức (dividend)
3. **Rủi ro:** giá có thể giảm — bạn có thể mất một phần vốn đầu tư
4. **HoSE** (sàn TP.HCM) liệt kê ~400 công ty VN; **HNX** (Hà Nội) ~300 công ty

---

**Card 2 — Example**
> **Vinamilk (VNM): Câu chuyện 20 năm tăng trưởng**

- Vinamilk niêm yết HoSE năm 2003 với giá khoảng 35,000 VND/cổ phiếu
- Năm 2022, VNM đạt đỉnh ~95,000 VND — tăng gần **3 lần** trong 19 năm
- Ngoài tăng giá, VNM trả **cổ tức 2,000–3,000 VND/cổ phiếu** mỗi năm
- Nhà đầu tư mua 1,000 cổ phiếu VNM năm 2003 (35 triệu VND) → đến 2022 có: 95 triệu VND (cổ phiếu) + ~40 triệu VND (cổ tức cộng dồn) = tổng ~135 triệu VND

**Khi bạn mua VNM** → bạn là đồng sở hữu công ty sản xuất 1.5 tỷ lít sữa mỗi năm.

---

**Card 3 — Myth-Buster**
> ❌ **"Mua cổ phiếu = đánh bạc"**

✅ **Sự thật:** Cờ bạc tạo ra tiền từ không có gì; đầu tư chứng khoán là mua quyền sở hữu **tài sản thực**.

Vinamilk sản xuất sữa, FPT viết phần mềm, Hòa Phát luyện thép. Những công ty này tạo ra giá trị thực mỗi ngày — và giá cổ phiếu của họ **phản ánh giá trị thực đó theo thời gian**.

Đầu tư có rủi ro (giá có thể giảm ngắn hạn), nhưng về dài hạn, giá trị doanh nghiệp tốt luôn tăng cùng nền kinh tế.

---

**Card 4 — Quiz**
> **Câu hỏi:** Khi bạn mua 100 cổ phiếu VNM, điều nào sau đây ĐÚNG?

| Lựa chọn | |
|----------|---|
| A. Bạn cho Vinamilk vay tiền | ✗ |
| B. Bạn sở hữu một phần nhỏ của Vinamilk | ✓ |
| C. Bạn nhận được lãi suất cố định hàng tháng | ✗ |
| D. Vinamilk phải hoàn trả tiền cho bạn | ✗ |

**Hint (after 3 wrong):** "Đọc lại thẻ Concept. Cổ phiếu ≠ trái phiếu ≠ gửi tiết kiệm. Cổ phiếu = quyền SỞ HỮU."

---

**Card 5 — CTA**
> **"Khám phá cổ phiếu thực tế ngay bây giờ"**

Mở màn hình danh sách cổ phiếu. Tìm VNM, VIC, FPT. Xem giá hiện tại và % thay đổi trong ngày.

*Mục tiêu: nhìn thấy bảng giá thực của cổ phiếu lần đầu tiên.*

---

### L1.2 — HoSE & HNX hoạt động như thế nào?

**Learning objectives:** Name Vietnam's 3 exchanges; recall trading hours; identify ATO/ATC sessions.

---

**Card 1 — Concept**
> **3 sàn chứng khoán Việt Nam**

| Sàn | Tên đầy đủ | Đặc điểm | Ví dụ mã |
|-----|-----------|----------|----------|
| **HoSE** | Sở GDCK TP. Hồ Chí Minh | Sàn lớn nhất; công ty blue-chip | VNM, VIC, FPT, HPG |
| **HNX** | Sở GDCK Hà Nội | Công ty vừa và nhỏ hơn | SHB, PVS, VCS |
| **UPCoM** | Unlisted Public Company Market | Công ty chưa niêm yết chính thức | Thanh khoản thấp hơn |

**Giờ giao dịch HoSE/HNX (ngày làm việc):**
- **9:00 – 9:15**: ATO (Khớp lệnh định kỳ mở cửa)
- **9:15 – 11:30**: Khớp lệnh liên tục (phiên sáng)
- **13:00 – 14:30**: Khớp lệnh liên tục (phiên chiều)
- **14:30 – 14:45**: ATC (Khớp lệnh định kỳ đóng cửa)
- Ngoài giờ: nhận lệnh nhưng không khớp

---

**Card 2 — Example**
> **Đặt lệnh mua VIC lúc 8:50 sáng — điều gì xảy ra?**

1. 8:50: Bạn đặt lệnh ATO mua 100 VIC → lệnh được nhận, **xếp hàng chờ**
2. 9:00: Phiên ATO mở → Sàn tính giá mở cửa từ tất cả lệnh ATO chờ
3. 9:01: Lệnh của bạn **khớp tại giá mở cửa** — đây là mức giá cân bằng cung-cầu lúc 9:00
4. 9:15: Sang phiên liên tục — mỗi lệnh khớp ngay khi có đối ứng

**ATO hữu ích cho ai?** Nhà đầu tư muốn mua/bán tại giá mở cửa, không cần xem màn hình lúc 9:00 sáng.

---

**Card 3 — Myth-Buster**
> ❌ **"Chứng khoán VN giao dịch 24/7 như Bitcoin"**

✅ **Sự thật:** VN stock exchange có **giờ giao dịch cố định**. Ngoài giờ, lệnh được nhận nhưng **không khớp**.

Điều này khác với crypto (24/7) hay forex (5.5 ngày/tuần). Sàn chứng khoán đóng cửa vào cuối tuần và ngày lễ theo lịch của HoSE/HNX. Đây là đặc điểm của **sàn giao dịch tập trung**, không phải giới hạn kỹ thuật.

---

**Card 4 — Quiz**
> **Câu hỏi:** HoSE bắt đầu phiên khớp lệnh liên tục lúc mấy giờ?

| | |
|--|--|
| A. 9:00 | ✗ |
| B. **9:15** | ✓ |
| C. 10:00 | ✗ |
| D. 8:30 | ✗ |

**Hint:** "9:00–9:15 là phiên ATO (khớp lệnh ĐỊNH KỲ). Khớp lệnh LIÊN TỤC bắt đầu sau đó."

---

**Card 5 — CTA**
> **"Kiểm tra phiên thị trường ngay bây giờ"**

Mở màn hình trạng thái thị trường trong app. Xem HoSE đang ở phiên nào (ATO / Liên tục / ATC / Đóng cửa) và đồng hồ đếm ngược đến phiên tiếp theo.

---

### L1.3 — Đọc bảng giá (Reading the Price Board)

**Learning objectives:** Calculate ceiling/floor price given reference; identify color coding; distinguish HoSE/HNX/UPCoM bands.

---

**Card 1 — Concept**
> **3 mức giá quan trọng mỗi ngày**

| Mức giá | Tên tiếng Anh | Màu sắc | Mô tả |
|---------|--------------|---------|-------|
| **Giá tham chiếu** | Reference price | Vàng (yellow) | Giá đóng cửa hôm qua |
| **Giá trần** | Ceiling price | Tím (purple/violet) | Mức cao nhất được phép hôm nay |
| **Giá sàn** | Floor price | Xanh lam nhạt (cyan) | Mức thấp nhất được phép hôm nay |

**Biên độ dao động (price bands):**
- **HoSE:** ±7% từ giá tham chiếu
- **HNX:** ±10% từ giá tham chiếu
- **UPCoM:** ±15% từ giá tham chiếu

**Màu giá trong ngày:**
- 🟢 **Xanh lá:** Giá > tham chiếu (đang tăng)
- 🔴 **Đỏ:** Giá < tham chiếu (đang giảm)
- 🟡 **Vàng:** Giá = tham chiếu (không đổi)
- 🟣 **Tím:** Giá = trần (tăng hết biên độ)
- 🔵 **Xanh lam:** Giá = sàn (giảm hết biên độ)

---

**Card 2 — Example**
> **VNM hôm nay — đọc bảng giá thực tế**

Giả sử VNM (HoSE) đóng cửa hôm qua tại **80,000 VND**:
- Giá tham chiếu hôm nay: **80,000 VND** (màu vàng)
- Giá trần: 80,000 × 1.07 = **85,600 VND** (màu tím)
- Giá sàn: 80,000 × 0.93 = **74,400 VND** (màu xanh lam)

Trong ngày, nếu VNM giao dịch tại 83,500 VND → hiển thị màu **xanh lá** (+4.4%)
Nếu VNM chạm 85,600 VND → hiển thị màu **tím** (đang trần — không thể mua cao hơn)

---

**Card 3 — Myth-Buster**
> ❌ **"Cổ phiếu giảm sàn nghĩa là công ty sắp phá sản"**

✅ **Sự thật:** "Giảm sàn" chỉ có nghĩa là cổ phiếu giảm **hết biên độ cho phép trong ngày đó**. Công ty vẫn hoạt động bình thường.

Ví dụ: HPG (Hòa Phát) từng giảm sàn nhiều phiên liên tiếp năm 2022 khi giá thép toàn cầu giảm. Nhưng Hòa Phát vẫn là nhà thép lớn nhất Việt Nam, vẫn sản xuất, vẫn bán hàng. Cổ phiếu sau đó phục hồi mạnh.

Giảm sàn = áp lực bán lớn trong ngày, không phải tín hiệu phá sản.

---

**Card 4 — Quiz**
> **Câu hỏi:** Cổ phiếu trên HoSE có giá tham chiếu 50,000 VND. Giá trần ngày hôm nay là bao nhiêu?

| | |
|--|--|
| A. **53,500 VND** | ✓ |
| B. 55,000 VND | ✗ |
| C. 52,000 VND | ✗ |
| D. 60,000 VND | ✗ |

**Hint:** "HoSE biên độ = ±7%. Giá trần = Tham chiếu × 1.07. Tính: 50,000 × 1.07 = ?"

---

**Card 5 — CTA**
> **"Đọc bảng giá thực"**

Mở màn hình bảng giá HoSE. Chọn 3 cổ phiếu bất kỳ. Với mỗi mã: xác định màu hiện tại, tính giá trần và sàn từ giá tham chiếu, kiểm tra xem giá hiện tại có gần trần/sàn không.

---

### L1.4 — Điều gì khiến giá cổ phiếu thay đổi?

**Learning objectives:** Name 4 drivers of stock price; understand short-term vs. long-term price behavior.

---

**Card 1 — Concept**
> **4 yếu tố chính khiến giá cổ phiếu biến động**

1. **Cung – Cầu:** Nhiều người muốn mua → giá tăng. Nhiều người muốn bán → giá giảm. Đây là cơ chế căn bản nhất.

2. **Kết quả kinh doanh** (Earnings): Doanh thu và lợi nhuận vượt kỳ vọng → nhà đầu tư sẵn trả giá cao hơn → giá tăng.

3. **Kinh tế vĩ mô** (Macro): Lãi suất, tỷ giá USD/VND, GDP, chính sách nhà nước ảnh hưởng đến toàn thị trường.

4. **Tâm lý thị trường** (Sentiment): Tin tức, mạng xã hội, kỳ vọng. Thường là yếu tố ngắn hạn — **cảm xúc** chứ không phải **dữ liệu**.

> **Nguyên tắc:** Ngắn hạn = tâm lý. Dài hạn = doanh nghiệp thực.

---

**Card 2 — Example**
> **VN-Index và COVID-19 (2020)**

**Tháng 3/2020:** VN-Index rơi từ 960 xuống 660 điểm (−31%) chỉ trong 3 tuần.
→ Nguyên nhân: tâm lý hoảng loạn toàn cầu, không phải doanh nghiệp VN thực sự xấu đi.

**Cuối 2020:** VN-Index phục hồi về 1,020 — **cao hơn trước dịch**.
→ Doanh nghiệp tốt vẫn hoạt động, kết quả kinh doanh thực tế trở lại.

**Bài học:** Trong ngắn hạn, cảm xúc chi phối. Trong dài hạn, **giá trị thực** thắng.

---

**Card 3 — Myth-Buster**
> ❌ **"Tin tốt luôn khiến giá cổ phiếu tăng"**

✅ **Sự thật:** Trong nhiều trường hợp, giá đã **tăng trước khi có tin tốt** (thị trường đã kỳ vọng). Khi tin tốt được công bố chính thức, nhà đầu tư "chốt lời" → giá giảm. Hiện tượng này gọi là **"mua tin đồn, bán sự kiện"** (buy the rumor, sell the news).

Ví dụ: HPG công bố lợi nhuận quý tốt hơn dự kiến, nhưng giá HPG đã tăng 20% trong tháng trước đó. Ngay sau công bố, giá giảm 5% vì nhà đầu tư chốt lời.

---

**Card 4 — Quiz**
> **Câu hỏi:** Ngân hàng Nhà nước tăng lãi suất đột ngột. Điều gì có khả năng xảy ra nhất với cổ phiếu ngân hàng trong ngắn hạn?

| | |
|--|--|
| A. Tăng mạnh vì ngân hàng kiếm được nhiều hơn | ✗ |
| B. **Giảm vì nhà đầu tư lo ngại kinh tế tăng trưởng chậm lại** | ✓ |
| C. Không thay đổi vì lãi suất không liên quan đến cổ phiếu | ✗ |
| D. Chạm trần ngay lập tức | ✗ |

**Hint:** "Tăng lãi suất = vay mắc hơn = tiêu dùng và đầu tư giảm = tâm lý thị trường xấu đi ngắn hạn."

---

**Card 5 — CTA**
> **"Đọc tin tức thị trường"**

Mở tab Tin tức. Đọc một bài viết về sự kiện thị trường hôm nay. Thử đoán: tin tức này ảnh hưởng đến cổ phiếu ngành nào, và theo hướng nào (tích cực/tiêu cực)?

---

### L1.5 — Biên độ giá tại Việt Nam (VN Price Bands)

**Learning objectives:** Recite band % for all 3 exchanges; understand why ceiling orders are rejected; calculate floor price.

---

**Card 1 — Concept**
> **Biên độ giá — "bức tường" bảo vệ thị trường**

Sàn chứng khoán VN áp dụng biên độ dao động để hạn chế biến động cực đoan trong một phiên:

| Sàn | Biên độ | Ví dụ (tham chiếu 100,000) | Trần | Sàn |
|-----|---------|---------------------------|------|-----|
| **HoSE** | ±7% | 100,000 | 107,000 | 93,000 |
| **HNX** | ±10% | 100,000 | 110,000 | 90,000 |
| **UPCoM** | ±15% | 100,000 | 115,000 | 85,000 |

**Quy tắc:** Đặt lệnh mua cao hơn giá trần → **bị từ chối ngay**. Đặt lệnh bán thấp hơn giá sàn → **bị từ chối ngay**. Đây là lỗi "Giá vượt biên độ", không phải lỗi kỹ thuật.

---

**Card 2 — Example**
> **Tại sao lệnh mua bị từ chối?**

Tình huống: VIC (HoSE) tham chiếu 60,000 VND → trần = 64,200 VND.

Nhà đầu tư A đặt lệnh mua 100 VIC tại **65,000 VND** (cao hơn trần 800 VND).
→ Kết quả: **Lệnh bị từ chối ngay lập tức.** Thông báo: *"Giá đặt lệnh vượt quá giá trần. Giá trần hiện tại: 64,200 VND."*

**Giải pháp:** Nhà đầu tư điều chỉnh lệnh xuống 64,200 VND (giá trần) hoặc thấp hơn. Lệnh được chấp nhận.

**Lý do quy tắc này tồn tại:** Ngăn chặn thao túng thị trường và biến động quá mức trong một phiên giao dịch.

---

**Card 3 — Myth-Buster**
> ❌ **"Lệnh bị từ chối vì tôi không có đủ tiền"**

✅ **Sự thật:** Có hai loại lỗi từ chối lệnh hoàn toàn khác nhau:

| Lỗi | Nguyên nhân | Thông báo |
|-----|-------------|-----------|
| **Không đủ tiền** | Số dư tài khoản < giá trị lệnh | "Số dư không đủ" |
| **Giá vượt biên độ** | Giá đặt > trần hoặc < sàn | "Giá vượt biên độ" |

Bạn có thể bị lỗi biên độ ngay cả khi có hàng tỷ đồng trong tài khoản. Luôn kiểm tra giá trần trước khi đặt lệnh.

---

**Card 4 — Quiz**
> **Câu hỏi:** Cổ phiếu HNX có giá tham chiếu 20,000 VND. Giá sàn ngày hôm nay là bao nhiêu?

| | |
|--|--|
| A. **18,000 VND** | ✓ |
| B. 19,000 VND | ✗ |
| C. 17,000 VND | ✗ |
| D. 18,600 VND | ✗ |

**Hint:** "HNX biên độ = ±10%. Giá sàn = Tham chiếu × (1 − 0.10). Tính: 20,000 × 0.90 = ?"

---

**Card 5 — CTA**
> **"Trải nghiệm lệnh bị từ chối vì giá"**

Đặt lệnh mua VIC (hoặc blue-chip được gợi ý) với giá = giá trần + 1%. Quan sát thông báo lỗi từ hệ thống giao dịch. Đây là cách học an toàn nhất về biên độ giá — không tốn tiền thật, không mất vốn.

---

## 5. Module 2 — Your First Trade

> **Prerequisite:** M1 complete + MKC-1 passed (≥3/5).
> **Completion reward:** +125 XP · "First Trader" badge (Common) · 50,000,000 VND bonus virtual cash (7-day TTL) · Learning Level → 3

---

### L2.1 — Lệnh Thị trường vs. Lệnh Giới hạn

**Learning objectives:** Distinguish ATO/ATC/MP from LO; choose correct order type for a given goal.

---

**Card 1 — Concept**
> **2 nhóm lệnh chính tại VN**

**Nhóm 1 — Lệnh thị trường (Market orders):** Khớp ngay tại giá tốt nhất hiện có.
- **ATO** (Khớp lệnh mở cửa): Chỉ dùng trong phiên 9:00–9:15. Khớp tại giá mở cửa.
- **ATC** (Khớp lệnh đóng cửa): Chỉ dùng trong phiên 14:30–14:45. Khớp tại giá đóng cửa.
- **MP** (Market Price): Dùng trong phiên liên tục. Khớp tại giá đối ứng tốt nhất ngay lúc đặt.

**Nhóm 2 — Lệnh giới hạn (LO — Limit Order):** Bạn chỉ định giá; chỉ khớp tại giá đó **hoặc tốt hơn**.
- BUY LO tại 80,000: Chỉ khớp khi có người bán ≤ 80,000
- SELL LO tại 85,000: Chỉ khớp khi có người mua ≥ 85,000
- Nếu giá không đạt: lệnh **chờ** cho đến hết ngày

---

**Card 2 — Example**
> **ATO vs. LO — Khi nào dùng loại nào?**

Tình huống: Bạn muốn mua **100 VNM** sáng sớm.

**Dùng ATO nếu:** Bạn chắc chắn muốn mua, chấp nhận bất kỳ giá mở cửa.
→ Đặt lệnh ATO lúc 8:45 → Khớp lúc 9:00 tại giá mở cửa (ví dụ 82,000 VND).

**Dùng LO nếu:** Bạn chỉ muốn mua tại giá 80,000 hoặc thấp hơn.
→ Đặt LO tại 80,000. Nếu VNM mở cửa tại 82,000 → lệnh **chưa khớp**, chờ giá giảm.
→ Nếu đến 14:45 VNM vẫn > 80,000 → lệnh **hủy tự động** cuối ngày.

---

**Card 3 — Myth-Buster**
> ❌ **"Lệnh thị trường (ATO/MP) luôn tốt hơn vì chắc chắn khớp"**

✅ **Sự thật:** Lệnh thị trường **đảm bảo khớp** nhưng **không đảm bảo giá**. Với cổ phiếu thanh khoản thấp (ít người mua/bán), lệnh MP có thể khớp ở mức giá tệ hơn nhiều so với bạn nghĩ — hiện tượng này gọi là **trượt giá (slippage)**.

Lệnh LO bảo vệ bạn khỏi trượt giá, nhưng có rủi ro không khớp nếu thị trường không đến giá bạn muốn.

**Quy tắc thực tế:** Blue-chip thanh khoản cao (VNM, VCB, HPG) → ATO/MP an toàn. Cổ phiếu nhỏ, ít giao dịch → dùng LO để kiểm soát giá.

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn muốn mua HPG với giá KHÔNG CAO HƠN 35,000 VND. Loại lệnh nào phù hợp nhất?

| | |
|--|--|
| A. Lệnh ATO | ✗ |
| B. Lệnh ATC | ✗ |
| C. **Lệnh LO tại 35,000 VND** | ✓ |
| D. Lệnh MP | ✗ |

**Hint:** "Khi muốn KIỂM SOÁT GIÁ mua, dùng lệnh giới hạn (LO). Lệnh chỉ khớp tại 35,000 hoặc thấp hơn."

---

**Card 5 — CTA**
> **"Đặt lệnh thị trường đầu tiên"**

Đặt lệnh ATO (hoặc MP nếu đang trong phiên) mua 100 cổ phiếu VNM trong tài khoản giao dịch ảo. Quan sát trạng thái lệnh thay đổi từ "Chờ khớp" → "Đã khớp".

---

### L2.2 — Lô cổ phiếu tại Việt Nam (Board Lots)

**Learning objectives:** State 100-share minimum lot rule; calculate valid order quantities.

---

**Card 1 — Concept**
> **Quy tắc lô giao dịch (Board Lot Rule)**

Sàn HoSE và HNX quy định: **Tất cả lệnh mua/bán phải là bội số của 100 cổ phiếu**.

| Số lượng | Hợp lệ? | Lý do |
|----------|---------|-------|
| 100 | ✅ Hợp lệ | 100 ÷ 100 = 1 lô |
| 200 | ✅ Hợp lệ | 200 ÷ 100 = 2 lô |
| 50 | ❌ Không hợp lệ | 50 ÷ 100 = 0.5 (không nguyên) |
| 150 | ❌ Không hợp lệ | 150 ÷ 100 = 1.5 (không nguyên) |
| 1,000 | ✅ Hợp lệ | 1,000 ÷ 100 = 10 lô |

**Ý nghĩa thực tế:** Để mua cổ phiếu FPT (giá ~90,000 VND), vốn tối thiểu một lô = 100 × 90,000 = **9,000,000 VND** (~$360).

---

**Card 2 — Example**
> **Nhà đầu tư mới muốn mua "1 ít" FPT**

Thanh, 22 tuổi, có 4,500,000 VND tiết kiệm. Muốn mua 50 cổ phiếu FPT (4,500,000 ÷ 90,000 = 50 cổ phiếu).

**Khi đặt lệnh:** App từ chối → *"Số lượng không hợp lệ. Vui lòng nhập bội số của 100."*

**Giải pháp của Thanh:**
1. Chờ tích lũy đủ 9,000,000 để mua 100 FPT
2. Hoặc chọn cổ phiếu rẻ hơn: VIC tại ~40,000 → 100 cổ phiếu = 4,000,000 VND ✅

---

**Card 3 — Myth-Buster**
> ❌ **"Tôi có thể mua bất kỳ số lượng nào như mua hàng online"**

✅ **Sự thật:** Thị trường chứng khoán VN không phải mua lẻ tự do. Quy tắc lô 100 cổ phiếu tồn tại để:
- Đảm bảo thanh khoản thị trường (mỗi giao dịch có giá trị đủ lớn)
- Đơn giản hóa hệ thống thanh toán (VSD — Trung tâm lưu ký)

**So sánh:** Ở Mỹ, bạn có thể mua 1 cổ phiếu Apple. Ở VN, minimum là 100 cổ phiếu. Đây là đặc thù của thị trường VN, không phải bất tiện tạm thời.

---

**Card 4 — Quiz**
> **Câu hỏi:** Nhà đầu tư muốn mua 250 cổ phiếu VIC trên HoSE. Lệnh này có hợp lệ không?

| | |
|--|--|
| A. Có — 250 là bội số của 50 | ✗ |
| B. **Không — 250 không phải bội số của 100** | ✓ |
| C. Có — HoSE cho phép mua lẻ | ✗ |
| D. Không — phải mua tối thiểu 1,000 | ✗ |

**Hint:** "Kiểm tra: 250 ÷ 100 = 2.5 → Không phải số nguyên → Không hợp lệ. Số gần nhất hợp lệ: 200 hoặc 300."

---

**Card 5 — CTA**
> **"Trải nghiệm lệnh lô lẻ bị từ chối"**

Đặt lệnh mua 50 cổ phiếu FPT trong tài khoản giao dịch ảo. Đọc thông báo lỗi của hệ thống. Sau đó, sửa lại thành 100 cổ phiếu và đặt lại thành công.

---

### L2.3 — Hướng dẫn Mua & Bán (Buy & Sell Walkthrough)

**Learning objectives:** Execute a complete buy order; read order confirmation; understand order states.

---

**Card 1 — Concept**
> **Quy trình đặt lệnh mua — 5 bước**

1. **Chọn mã cổ phiếu:** Tìm kiếm mã (ví dụ: HPG) và vào trang chi tiết
2. **Chọn loại lệnh:** LO / ATO / ATC / MP
3. **Nhập số lượng:** Bội số của 100
4. **Nhập giá:** Trong khoảng [sàn, trần]; hoặc bỏ trống nếu dùng ATO/ATC
5. **Xác nhận:** Kiểm tra lại tổng giá trị → Nhấn "Xác nhận đặt lệnh"

**Các trạng thái lệnh sau khi đặt:**

| Trạng thái | Ý nghĩa |
|-----------|---------|
| Chờ khớp | Lệnh đã vào sàn, đang chờ đối ứng |
| Đã khớp một phần | Một phần lệnh đã khớp, phần còn lại chờ |
| Đã khớp toàn bộ | Lệnh hoàn thành |
| Hủy | Lệnh bị hủy (do hết ngày hoặc người dùng hủy) |

---

**Card 2 — Example**
> **Đặt lệnh mua HPG — ví dụ đầy đủ**

Tình huống: Hôm nay HPG tham chiếu 33,500 VND. Bạn muốn mua 200 cổ phiếu.

| Bước | Hành động | Giá trị |
|------|-----------|---------|
| 1 | Chọn mã | HPG |
| 2 | Loại lệnh | LO |
| 3 | Số lượng | 200 cổ phiếu |
| 4 | Giá | 33,500 VND (giá tham chiếu) |
| 5 | Tổng giá trị | 200 × 33,500 = **6,700,000 VND** |

Sau khi khớp: Portfolio hiển thị "HPG: 200 cổ phiếu (T+2: ngày X)" — cổ phiếu về tài khoản sau 2 ngày làm việc.

---

**Card 3 — Myth-Buster**
> ❌ **"Sau khi lệnh khớp, tôi có thể bán ngay ngay lập tức"**

✅ **Sự thật:** Sau khi mua, cổ phiếu **thanh toán T+2** — bạn phải chờ 2 ngày làm việc trước khi bán số cổ phiếu vừa mua.

Portfolio sẽ hiển thị nhãn **"T+2"** trên vị thế đang chờ thanh toán. Đây là quy định của **Trung tâm Lưu ký Chứng khoán VN (VSD)**, không phải lỗi của app.

Nếu bạn cần linh hoạt hơn: Chỉ bán cổ phiếu đã thanh toán đầy đủ (không có nhãn T+2).

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn đặt lệnh mua 100 HPG tại 33,500 VND và lệnh khớp. Tổng chi phí (chưa tính phí giao dịch) là bao nhiêu?

| | |
|--|--|
| A. 335,000 VND | ✗ |
| B. 3,350,000 VND | ✗ |
| C. **3,350,000 VND** | → |

*Sửa lại câu hỏi cho rõ ràng hơn:*

> **Câu hỏi:** 100 cổ phiếu × 33,500 VND/cổ phiếu = ?

| | |
|--|--|
| A. 335,000 VND | ✗ |
| B. **3,350,000 VND** | ✓ |
| C. 6,700,000 VND | ✗ |
| D. 33,500,000 VND | ✗ |

**Hint:** "Tổng = Số lượng × Giá đặt. 100 × 33,500 = ?"

---

**Card 5 — CTA**
> **"Đặt lệnh mua giới hạn đầu tiên"**

Mở tài khoản giao dịch ảo. Đặt lệnh mua giới hạn (LO) 100 cổ phiếu HPG tại giá tham chiếu hiện tại. Theo dõi trạng thái lệnh thay đổi. Lệnh này sẽ tính vào điều kiện mở khóa Module 3.

---

### L2.4 — T+2 là gì? (What is T+2 Settlement?)

**Learning objectives:** Explain T+2 for buy and sell; calculate settlement date skipping weekends.

---

**Card 1 — Concept**
> **T+2: Thanh toán chứng khoán**

**T** = Trade date (ngày đặt lệnh khớp)
**T+2** = Settlement date = 2 ngày làm việc sau T

**Quy tắc thực tế:**

| Bạn MUA | Cổ phiếu về tài khoản | Có thể bán tiếp |
|---------|----------------------|-----------------|
| Thứ Hai | Thứ Tư | Từ Thứ Tư |
| Thứ Tư | Thứ Sáu | Từ Thứ Sáu |
| Thứ Năm | Thứ Hai tuần sau | Từ Thứ Hai |
| Thứ Sáu | Thứ Ba tuần sau | Từ Thứ Ba |

| Bạn BÁN | Tiền về tài khoản |
|---------|------------------|
| T | T+2 (mới dùng mua cổ phiếu khác được) |

**Chú ý:** Cuối tuần (Thứ 7, Chủ nhật) và ngày lễ KHÔNG tính là ngày làm việc.

---

**Card 2 — Example**
> **Hành trình của 100 cổ phiếu VNM bạn mua thứ Hai**

| Ngày | Sự kiện |
|------|---------|
| Thứ Hai (T) | Lệnh mua 100 VNM khớp tại 82,000. Tiền 8,200,000 VND bị trừ ngay. |
| Thứ Hai – Thứ Ba | Portfolio hiển thị "VNM 100cp (⏳ T+2: Thứ Tư)" |
| Thứ Tư (T+2) | Cổ phiếu thanh toán xong. Nhãn T+2 biến mất. Bạn có thể bán ngay. |

**Nếu thử bán trước T+2:** Hệ thống báo lỗi *"Cổ phiếu chưa về tài khoản — không thể bán"*.

---

**Card 3 — Myth-Buster**
> ❌ **"T+2 là lỗi kỹ thuật của app, nước khác giao dịch ngay được"**

✅ **Sự thật:** T+2 là **chuẩn quốc tế**. Mỹ cũng dùng T+2 (và đang chuyển sang T+1 năm 2024). Hầu hết sàn chứng khoán lớn trên thế giới đều có quy trình thanh toán tương tự.

Quy trình này cần thời gian để: xác minh quyền sở hữu, cập nhật sổ đăng ký cổ đông, và chuyển tiền qua hệ thống ngân hàng giữa các bên. Đây là nền tảng bảo mật của thị trường, không phải giới hạn kỹ thuật.

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn mua cổ phiếu vào thứ Năm. Ngày sớm nhất bạn có thể bán số cổ phiếu này là ngày nào?

| | |
|--|--|
| A. Thứ Sáu | ✗ |
| B. Thứ Bảy | ✗ |
| C. **Thứ Hai tuần sau** | ✓ |
| D. Thứ Năm tuần sau | ✗ |

**Hint:** "T+2 = 2 ngày LÀM VIỆC. Thứ 5 + 1 = Thứ 6, Thứ 5 + 2 = Thứ 2 (bỏ qua cuối tuần)."

---

**Card 5 — CTA**
> **"Xem nhãn T+2 trong danh mục"**

Vào tab Danh mục (Portfolio). Tìm vị thế có nhãn T+2 (từ lệnh đã đặt trong các bài trước). Xem ngày thanh toán dự kiến. Nếu chưa có vị thế, đặt lệnh mua bất kỳ và quay lại xem nhãn xuất hiện.

---

### L2.5 — Kiểm tra P&L (Checking Your P&L)

**Learning objectives:** Calculate unrealized P&L; distinguish realized vs. unrealized; read % return.

---

**Card 1 — Concept**
> **P&L — Thước đo kết quả đầu tư của bạn**

**P&L chưa thực hiện (Unrealized P&L):** Lãi/lỗ trên vị thế đang nắm giữ (chưa bán).
> Công thức: (Giá hiện tại − Giá mua) × Số lượng

**P&L đã thực hiện (Realized P&L):** Lãi/lỗ đã chốt bằng cách bán.
> Công thức: (Giá bán − Giá mua) × Số lượng đã bán

**Tỷ suất lợi nhuận (% Return):**
> (Giá hiện tại − Giá mua) ÷ Giá mua × 100

**Màu sắc trong app:**
- 🟢 Xanh = đang có lãi
- 🔴 Đỏ = đang có lỗ

---

**Card 2 — Example**
> **Danh mục 3 vị thế — đọc P&L thực tế**

| Mã | Mua | Hiện tại | Số lượng | Unrealized P&L | % |
|----|-----|----------|----------|----------------|---|
| VNM | 80,000 | 84,000 | 200 | +800,000 🟢 | +5% |
| HPG | 33,500 | 31,000 | 100 | −250,000 🔴 | −7.5% |
| FPT | 90,000 | 92,000 | 100 | +200,000 🟢 | +2.2% |
| **Tổng** | | | | **+750,000 🟢** | |

Bạn bán 100 VNM tại 84,000 → Realized P&L = (84,000 − 80,000) × 100 = **+400,000 VND**.
Remaining unrealized VNM: (84,000 − 80,000) × 100 = **+400,000 VND** (100cp còn lại).

---

**Card 3 — Myth-Buster**
> ❌ **"Lỗ chưa thực hiện không phải lỗ thực sự — chỉ cần chờ hồi là xong"**

✅ **Sự thật:** Lỗ chưa thực hiện là **lỗ thực** — bạn chỉ chưa xác nhận nó. Tiền đã mất khỏi tay bạn dưới dạng giá trị thị trường.

Nguy hiểm hơn: Giữ cổ phiếu lỗ quá lâu chỉ vì "chưa thực hiện" có thể biến lỗ nhỏ thành lỗ lớn. Một cổ phiếu xấu giảm -10% có thể giảm -50% nếu không được xem xét lại.

**Quyết định bán nên dựa trên:** Cơ bản doanh nghiệp còn tốt không? — không phải "tôi chưa thực sự lỗ vì chưa bán".

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn mua 100 cổ phiếu FPT tại 90,000 VND. Giá hiện tại là 85,500 VND. P&L chưa thực hiện là bao nhiêu?

| | |
|--|--|
| A. −4,500 VND | ✗ |
| B. +4,500 VND | ✗ |
| C. **−450,000 VND** | ✓ |
| D. +450,000 VND | ✗ |

**Hint:** "P&L = (Giá hiện tại − Giá mua) × Số lượng = (85,500 − 90,000) × 100 = −4,500 × 100 = ?"

---

**Card 5 — CTA**
> **"Mở tab P&L của danh mục"**

Vào Portfolio → tab P&L. Xem tổng P&L chưa thực hiện, P&L đã thực hiện, và % tổng. Nếu danh mục giao dịch ảo chưa có vị thế: đặt lệnh mua từ bài L2.3 và quay lại sau khi khớp.

---

## 6. Module 3 — Thinking in Portfolios

> **Prerequisite:** M2 complete + MKC-2 passed + ≥3 paper trades on main portfolio.
> **Completion reward:** +150 XP (125 lessons + 25 bonus) · "Portfolio Thinker" badge (Uncommon) · Learning Level → 4

---

### L3.1 — Đa dạng hóa cơ bản (Diversification Basics)

**Learning objectives:** Define diversification; explain why same-sector stocks don't diversify; state minimum 5-stock rule.

---

**Card 1 — Concept**
> **Đa dạng hóa: "Đừng bỏ tất cả trứng vào một giỏ"**

**Đa dạng hóa (Diversification)** = trải vốn đầu tư ra nhiều cổ phiếu, nhiều ngành để giảm rủi ro.

**Tại sao cần đa dạng hóa?**
- Khi một ngành chịu tác động xấu (ví dụ: chính sách siết tín dụng ngân hàng), cổ phiếu ngành khác vẫn ổn định
- Rủi ro không hệ thống (unsystematic risk) có thể giảm bằng đa dạng hóa
- Rủi ro hệ thống (VD: khủng hoảng toàn thị trường) thì không thể tránh dù đa dạng hóa

**Quy tắc thực hành:**
- Tối thiểu 5–7 cổ phiếu từ ít nhất 3 ngành khác nhau
- Không có cổ phiếu nào chiếm > 30% tổng danh mục
- Tối đa 20 cổ phiếu — quá nhiều sẽ khó theo dõi hiệu quả

---

**Card 2 — Example**
> **Danh mục A vs. Danh mục B — ai đa dạng hóa tốt hơn?**

| | Danh mục A | Danh mục B |
|-|-----------|-----------|
| Cổ phiếu | VCB 40% + BID 30% + TCB 30% | VCB 20% + VNM 20% + FPT 20% + HPG 20% + VHM 20% |
| Ngành | 100% Tài chính | Tài chính + Tiêu dùng + Công nghệ + Vật liệu + BĐS |
| Q1/2022 khi SBV siết tín dụng | **−25%** (tất cả cùng giảm) | **−8%** (VNM và FPT bù đắp) |

Danh mục A có 3 mã nhưng thực chất là **đặt cược vào 1 ngành**. Danh mục B mới là đa dạng hóa thực sự.

---

**Card 3 — Myth-Buster**
> ❌ **"Cứ mua nhiều mã cổ phiếu là đã đa dạng hóa"**

✅ **Sự thật:** 20 cổ phiếu ngân hàng không phải đa dạng hóa — đó là **tập trung theo ngành**. Khi chính sách tiền tệ thắt chặt, tất cả 20 mã đều giảm cùng nhau.

Đa dạng hóa thực sự yêu cầu **tương quan thấp** giữa các vị thế — tức là các ngành phản ứng khác nhau với cùng một sự kiện kinh tế.

---

**Card 4 — Quiz**
> **Câu hỏi:** Nhà đầu tư A có danh mục: VCB 40%, BID 35%, MBB 25%. Điểm yếu nghiêm trọng nhất là gì?

| | |
|--|--|
| A. Quá ít cổ phiếu | ✗ |
| B. **Tập trung 100% vào ngành ngân hàng — không có đa dạng hóa ngành** | ✓ |
| C. Giá cổ phiếu ngân hàng quá cao | ✗ |
| D. Không có cổ phiếu công nghệ | ✗ |

**Hint:** "Đa dạng hóa = khác NGÀNH, không chỉ khác mã. Cả 3 mã đều là ngân hàng."

---

**Card 5 — CTA**
> **"Xem phân bổ ngành của danh mục"**

Vào Portfolio → Phân tích danh mục → Biểu đồ ngành. Xem danh mục giao dịch ảo của bạn đang tập trung vào ngành nào. Nếu > 50% trong một ngành, đây là tín hiệu cần đa dạng hóa.

---

### L3.2 — Các ngành tại Việt Nam (VN Sectors Crash Course)

**Learning objectives:** Name 6 key VN sectors with example tickers; explain sector rotation.

---

**Card 1 — Concept**
> **11 ngành trên thị trường chứng khoán VN**

| # | Ngành | Tiếng Anh | Ví dụ mã tiêu biểu |
|---|-------|-----------|-------------------|
| 1 | Tài chính | Financials | VCB, BID, TCB, MBB, ACB |
| 2 | Bất động sản | Real Estate | VHM, VIC, NLG, DXG |
| 3 | Hàng tiêu dùng thiết yếu | Consumer Staples | VNM, MCH, MSN, SAB |
| 4 | Công nghệ thông tin | Information Technology | FPT, CMG |
| 5 | Năng lượng | Energy | GAS, POW, PVD, PVS |
| 6 | Vật liệu cơ bản | Materials | HPG, HSG, NKG |
| 7 | Công nghiệp | Industrials | HVN, GMD, HAH |
| 8 | Y tế | Healthcare | DHG, IMP, TNH |
| 9 | Tiện ích | Utilities | REE, BWE, PC1 |
| 10 | Hàng tiêu dùng tùy ý | Consumer Discretionary | MWG, PNJ, FRT |
| 11 | Viễn thông | Telecom | Cổ phần FPT Telecom |

---

**Card 2 — Example**
> **Luân chuyển ngành (Sector Rotation) — VN 2021–2023**

- **2021:** Chứng khoán + Bất động sản bùng nổ (lãi suất thấp, dòng tiền đổ vào thị trường)
  → SSI, VCI, VHM, NLG tăng 100–200%

- **2022:** Ngân hàng Nhà nước siết tín dụng BĐS → BĐS và Tài chính lao dốc
  → VHM −45%, VCB −30%
  → Trong khi đó: VNM (tiêu dùng) chỉ −12%; FPT (công nghệ) −18%

- **2023:** Chính phủ đẩy mạnh đầu tư công → Vật liệu xây dựng hồi phục
  → HPG +40%, HSG +55% từ đáy 2022

**Bài học:** Ngành nào dẫn đầu phụ thuộc vào chu kỳ kinh tế và chính sách. Đa dạng ngành giúp bạn luôn có phần "thắng" trong danh mục.

---

**Card 3 — Myth-Buster**
> ❌ **"Chỉ cần mua ngân hàng vì ngân hàng VN luôn có lợi nhuận"**

✅ **Sự thật:** Ngành ngân hàng VN chiếm ~30% vốn hóa HoSE và thường có lợi nhuận cao — nhưng cũng **nhạy cảm nhất với chính sách vĩ mô**. Một quyết định tăng lãi suất của SBV hay siết room tín dụng có thể khiến toàn ngành rơi 20–30% trong vài tuần.

Ngân hàng nên là **một phần** của danh mục đa dạng, không phải toàn bộ.

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn muốn đầu tư vào cổ phiếu hưởng lợi trực tiếp từ tăng trưởng tiêu dùng nội địa của người Việt. Ngành nào phù hợp nhất?

| | |
|--|--|
| A. Năng lượng (GAS, POW) | ✗ |
| B. **Hàng tiêu dùng thiết yếu (VNM, MCH, MSN)** | ✓ |
| C. Tài chính (VCB, BID) | ✗ |
| D. Vật liệu cơ bản (HPG, HSG) | ✗ |

**Hint:** "Hàng tiêu dùng thiết yếu = sản phẩm người dùng mua mỗi ngày. Khi thu nhập tăng → chi tiêu tăng → doanh thu tăng."

---

**Card 5 — CTA**
> **"Lọc theo ngành trong Discover"**

Vào Grow → Discover Feed → Nhấn icon bộ lọc → Chọn ngành "Hàng tiêu dùng thiết yếu". Xem các cổ phiếu trong ngành. Thử lọc một ngành khác để so sánh.

---

### L3.3 — Danh sách theo dõi là gì? (What is a Watchlist?)

**Learning objectives:** Explain watchlist purpose; distinguish from holding; add stocks strategically.

---

**Card 1 — Concept**
> **Watchlist — "Phòng chờ" trước khi đầu tư**

**Danh sách theo dõi (Watchlist)** = danh sách cổ phiếu bạn đang quan tâm nhưng chưa mua.

**3 mục đích chính:**
1. **Nghiên cứu:** Theo dõi biến động giá và tin tức trước khi ra quyết định
2. **Chuẩn bị mua:** Khi giá đạt ngưỡng mong muốn → hành động ngay
3. **So sánh:** Đặt nhiều cổ phiếu cùng ngành cạnh nhau để chọn mã tốt nhất

**Thực hành tốt:**
- Giữ watchlist 10–20 mã (không nhiều hơn — khó theo dõi hiệu quả)
- Review mỗi cuối tuần: xóa mã không còn phù hợp, thêm mã mới nghiên cứu
- Đặt cảnh báo giá cho mã quan trọng nhất (xem L3.4)

---

**Card 2 — Example**
> **Nhà đầu tư dùng watchlist để mua đúng giá**

Cuối 2022, Minh theo dõi MWG (Mobile World Group):
- Thêm MWG vào watchlist khi giá 45,000 VND
- Nhận xét: "Công ty bán lẻ tốt nhất VN nhưng đang bị bán quá mức vì lo ngại kinh tế"
- Đặt cảnh báo tại 25,000 VND (ngưỡng Minh cho là hấp dẫn)
- Tháng 3/2023: cảnh báo kích hoạt khi MWG về 23,000 → Minh nghiên cứu lại → mua 200 cổ phiếu
- Tháng 9/2023: MWG phục hồi về 47,000 VND → Minh lãi ~100% trong 6 tháng

**Không có watchlist:** Minh có thể đã bỏ qua cơ hội hoặc mua vội khi giá vẫn còn cao.

---

**Card 3 — Myth-Buster**
> ❌ **"Theo dõi cổ phiếu mà không mua là lãng phí thời gian"**

✅ **Sự thật:** Nhà đầu tư chuyên nghiệp theo dõi hàng chục cổ phiếu trong **nhiều tháng** trước khi mua. Watchlist giai đoạn là giai đoạn **nghiên cứu và kiên nhẫn** — hai yếu tố quan trọng nhất của đầu tư thành công.

Mua vội mà không có watchlist thường dẫn đến mua ở giá cao, không có luận điểm đầu tư rõ ràng — và bán hoảng loạn khi giá giảm.

---

**Card 4 — Quiz**
> **Câu hỏi:** Mục đích chính của danh sách theo dõi (watchlist) là gì?

| | |
|--|--|
| A. Tự động mua khi giá giảm | ✗ |
| B. Cho app biết cổ phiếu bạn thích | ✗ |
| C. **Theo dõi biến động giá và chuẩn bị cho quyết định mua** | ✓ |
| D. Nhận cổ tức từ cổ phiếu đang theo dõi | ✗ |

**Hint:** "Watchlist = phòng chờ. Bạn quan sát nhưng chưa cam kết."

---

**Card 5 — CTA**
> **"Xây watchlist đầu tiên — 5 cổ phiếu đa ngành"**

Thêm 5 cổ phiếu đa dạng vào watchlist: **VHM** (BĐS), **VIC** (Tập đoàn đa ngành), **VNM** (Tiêu dùng), **FPT** (Công nghệ), **HPG** (Vật liệu). Đây là bước đầu tiên xây dựng danh mục nghiên cứu có kỷ luật.

---

### L3.4 — Đặt cảnh báo giá (Setting a Price Alert)

**Learning objectives:** Create above/below price alert; articulate use cases for each type.

---

**Card 1 — Concept**
> **Cảnh báo giá — "Trợ lý theo dõi thị trường 24/7"**

**Cảnh báo giá (Price Alert)** = thông báo push khi cổ phiếu đạt ngưỡng giá bạn đặt.

**2 loại cảnh báo:**

| Loại | Khi nào kích hoạt | Dùng để làm gì |
|------|------------------|----------------|
| **Cảnh báo trên** (Above) | Giá ≥ mức đặt | Chốt lời, bán tại kháng cự |
| **Cảnh báo dưới** (Below) | Giá ≤ mức đặt | Mua thêm, cắt lỗ, mua tại hỗ trợ |

**3 use case thực tế:**
1. **Buy alert:** "Thông báo khi HPG về 30,000" → cơ hội mua rẻ
2. **Take-profit alert:** "Thông báo khi VNM lên 90,000" → chốt lời
3. **Stop-loss alert:** "Thông báo khi VIC xuống 45,000" → xem xét cắt lỗ

⚠️ **Quan trọng:** Cảnh báo chỉ THÔNG BÁO — không tự đặt lệnh. Bạn vẫn cần mở app và quyết định.

---

**Card 2 — Example**
> **Chiến lược cảnh báo có hệ thống cho HPG**

HPG hiện ở 35,000 VND. Qua phân tích kỹ thuật:
- Vùng kháng cự: 40,000 VND (giá thường bị bán ra tại đây)
- Vùng hỗ trợ: 30,000 VND (giá thường có người mua vào)

**Chiến lược cảnh báo:**
- ✅ Cảnh báo dưới tại 30,500 VND: "Giá tiếp cận vùng hỗ trợ — cơ hội mua tốt"
- ✅ Cảnh báo trên tại 39,500 VND: "Giá tiếp cận vùng kháng cự — cân nhắc chốt lời"

**Kết quả:** Không cần nhìn màn hình mỗi giờ. Cảnh báo sẽ thông báo đúng lúc cần hành động.

---

**Card 3 — Myth-Buster**
> ❌ **"Đặt cảnh báo giá = tự động mua/bán"**

✅ **Sự thật:** Cảnh báo giá chỉ gửi **thông báo**. Bạn phải mở app, xem xét tình hình, và đặt lệnh thủ công. Đây là thiết kế có chủ ý: để bảo vệ bạn khỏi các tín hiệu sai và đảm bảo quyết định đầu tư luôn có con người kiểm soát.

Auto-trading (giao dịch tự động) là tính năng hoàn toàn khác, đòi hỏi kiến thức nâng cao và rủi ro cao hơn nhiều.

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn mua VNM tại 82,000 và muốn được thông báo để chốt lời khi giá đạt 90,000. Loại cảnh báo nào cần đặt?

| | |
|--|--|
| A. Cảnh báo khi giá xuống dưới 90,000 | ✗ |
| B. **Cảnh báo khi giá lên trên 90,000** | ✓ |
| C. Cảnh báo khi giá bằng đúng 90,000 | ✗ |
| D. Không cần cảnh báo, tự theo dõi | ✗ |

**Hint:** "Chốt lời = bán khi giá ĐẠT MỨC CAO. Dùng cảnh báo TRÊN."

---

**Card 5 — CTA**
> **"Đặt cảnh báo giá đầu tiên"**

Chọn cổ phiếu đầu tiên trong watchlist vừa tạo (L3.3). Đặt một cảnh báo phía trên (giá tham chiếu + 5%) và một cảnh báo phía dưới (giá tham chiếu − 5%). Đây là bộ cảnh báo hai chiều cơ bản cho mọi vị thế.

---

### L3.5 — Kiểm tra sức khỏe danh mục (Portfolio Health Check)

**Learning objectives:** Interpret health score components; identify specific risks flagged.

---

**Card 1 — Concept**
> **Điểm sức khỏe danh mục — AI đánh giá rủi ro**

Điểm sức khỏe (0–100) được AI tính dựa trên 4 yếu tố:

| Yếu tố | Trọng số | Đánh giá gì |
|--------|---------|-------------|
| Đa dạng hóa ngành | 35% | Số ngành; cổ phiếu tập trung nhất < 30%? |
| Thanh khoản | 25% | KLGD trung bình ngày của các cổ phiếu nắm giữ |
| Biến động | 25% | Độ lệch chuẩn giá lịch sử của danh mục |
| Hành vi giao dịch | 15% | Tần suất FOMO, bán hoảng loạn, giao dịch quá mức |

**Thang điểm:**
- 75–100: 🟢 Tốt — danh mục được quản lý rủi ro tốt
- 50–74: 🟡 Cần chú ý — có một số điểm yếu cần cải thiện
- 0–49: 🔴 Rủi ro cao — cần xem xét tái cơ cấu

---

**Card 2 — Example**
> **So sánh 2 danh mục — điểm sức khỏe khác nhau như thế nào?**

**Danh mục Tập trung:**
> VCB 50% + BID 30% + TCB 20%
- Đa dạng hóa: 10/35 (100% ngành Tài chính)
- Thanh khoản: 25/25 (blue-chip)
- Biến động: 15/25 (ngân hàng biến động vừa)
- Hành vi: 12/15 (ít giao dịch)
- **Tổng: 62/100** 🟡

**Danh mục Cân bằng:**
> VCB 20% + VNM 20% + FPT 20% + HPG 20% + VHM 20%
- Đa dạng hóa: 32/35 (5 ngành khác nhau)
- Thanh khoản: 24/25 (tất cả blue-chip)
- Biến động: 20/25 (đa dạng giúp giảm biến động)
- Hành vi: 13/15
- **Tổng: 89/100** 🟢

---

**Card 3 — Myth-Buster**
> ❌ **"Điểm sức khỏe cao nghĩa là danh mục lời nhiều"**

✅ **Sự thật:** Điểm sức khỏe đo lường **quản lý rủi ro**, không phải lợi nhuận. Một danh mục tập trung có thể lời 50% trong bull market, nhưng cũng có thể lỗ 50% trong bear market.

Danh mục sức khỏe tốt thường cho **lợi nhuận điều chỉnh theo rủi ro** tốt hơn về dài hạn — nghĩa là lợi nhuận ổn định hơn, biến động ít hơn, và cú sụt giảm tối đa nhỏ hơn.

---

**Card 4 — Quiz**
> **Câu hỏi:** Điểm sức khỏe danh mục chủ yếu đo lường điều gì?

| | |
|--|--|
| A. Mức lợi nhuận kỳ vọng | ✗ |
| B. **Chất lượng quản lý rủi ro và đa dạng hóa** | ✓ |
| C. Số lượng giao dịch thực hiện | ✗ |
| D. Tổng giá trị tài khoản | ✗ |

**Hint:** "Health = khả năng chịu đựng biến động, không phải lợi nhuận."

---

**Card 5 — CTA**
> **"Xem AI Insights — điểm sức khỏe danh mục"**

Mở AI Insights → Portfolio Health. Đọc điểm tổng và từng yếu tố thành phần. Nếu có cờ cảnh báo (ví dụ "Tập trung ngành cao"), nhấn vào để đọc lời khuyên cụ thể từ AI.

---

## 7. Module 4 — Trader Psychology

> **Prerequisite:** M3 complete + MKC-3 passed + ≥1 trade on each of 5 distinct VN trading days.
> **Completion reward:** +200 XP (125 lessons + 75 bonus) · "Market Scholar" badge · Community posting eligibility · Learning Level → 5

---

### L4.1 — FOMO là gì? (What is FOMO?)

**Learning objectives:** Define FOMO; identify 4 warning signs; explain why FOMO entries typically fail.

---

**Card 1 — Concept**
> **FOMO — Kẻ thù thầm lặng của nhà đầu tư**

**FOMO = Fear Of Missing Out** (Sợ bỏ lỡ cơ hội)

Khi một cổ phiếu tăng mạnh và mọi người đều nói về nó → bạn cảm thấy phải mua ngay kẻo "trễ tàu". Đây là FOMO.

**4 dấu hiệu nhận biết lệnh FOMO:**
1. Cổ phiếu đã tăng **>15%** trước khi bạn mua
2. Bạn mua trong vòng **30 phút** sau khi thấy tin tức/mạng xã hội
3. **Chưa nghiên cứu** cơ bản công ty
4. Đặt lệnh **lớn hơn bình thường** vì sợ bỏ lỡ

**Tâm lý đằng sau:** Social proof (mọi người mua → mình phải mua) + Loss aversion (sợ lỗ vì không mua) = quyết định cảm xúc.

---

**Card 2 — Example**
> **VHM 2021: FOMO và hậu quả**

Tháng 6/2021: VHM (Vinhomes) tăng từ 85,000 → 115,000 VND trong 3 tuần (+35%).
- Mạng xã hội đầy tin "VHM đang sóng mạnh, mua ngay kẻo muộn"
- Nhà đầu tư FOMO mua vào ở mức 110,000–115,000 (gần đỉnh)

Kết quả sau 6 tuần: VHM điều chỉnh về 85,000 VND (−22% từ đỉnh).

**Nhà đầu tư FOMO mua ở 115,000:**
- Lỗ −22% sau 6 tuần
- Buộc phải chọn: chịu lỗ cắt ra, hoặc nắm giữ không biết bao giờ hồi phục

**Nhà đầu tư mua có kế hoạch từ 85,000–90,000 (trước khi sóng):**
- Đã lãi 20–30% trước khi "sóng FOMO" xảy ra
- Có thể chốt lời thoải mái khi mạng xã hội bắt đầu xôn xao

---

**Card 3 — Myth-Buster**
> ❌ **"Cổ phiếu đã tăng 30% thì sẽ còn tăng nữa"**

✅ **Sự thật:** Cổ phiếu đã tăng mạnh thường **thu hút người bán chốt lời nhiều hơn người mua mới**. Sau một đợt tăng lớn, xác suất điều chỉnh cao hơn xác suất tiếp tục tăng trong ngắn hạn.

Các nhà đầu tư chuyên nghiệp **mua khi không ai quan tâm** và **bán khi mọi người FOMO mua vào**. FOMO của bạn chính là lúc họ đang chốt lời.

---

**Card 4 — Quiz**
> **Câu hỏi:** Dấu hiệu nào thể hiện FOMO rõ nhất?

| | |
|--|--|
| A. Mua sau khi nghiên cứu kỹ 2 tuần | ✗ |
| B. **Mua cổ phiếu đã tăng 40% chỉ vì thấy mọi người đang mua** | ✓ |
| C. Đặt cảnh báo giá trước khi quyết định | ✗ |
| D. Mua theo cổ tức cao và P/E thấp | ✗ |

**Hint:** "FOMO = hành động vì SỢ BỎ LỠ, không phải vì phân tích. Câu nào mô tả quyết định cảm xúc?"

---

**Card 5 — CTA**
> **"Xem lịch sử lệnh và phát hiện mẫu FOMO"**

Vào Portfolio → Lịch sử giao dịch. AI sẽ đánh dấu các lệnh đặt trong vòng 30 phút sau khi cổ phiếu tăng >10% (mẫu FOMO tiềm năng). Xem xét các lệnh này: kết quả ra sao so với lệnh không có đặc điểm FOMO?

---

### L4.2 — Mô hình bán hoảng loạn (The Panic Sell Pattern)

**Learning objectives:** Define panic sell; calculate cost of panic selling; apply the "fundamentals check" before selling.

---

**Card 1 — Concept**
> **Bán hoảng loạn — Khoá lỗ tạm thời thành lỗ vĩnh viễn**

**Bán hoảng loạn (Panic sell)** = bán ra khi giá giảm nhanh vì sợ hãi — không phải vì cơ bản doanh nghiệp thay đổi.

**Quy trình điển hình:**
1. Cổ phiếu giảm 5–8% trong một phiên
2. Nhà đầu tư lo sợ mất thêm → bán ngay
3. Cổ phiếu hồi phục 3–5 ngày sau
4. Nhà đầu tư nhận ra đã bán đúng đáy → mua lại giá cao hơn

**Khi nào NÊN bán:**
- Cơ bản doanh nghiệp xấu đi (lợi nhuận giảm nhiều quý, ngành suy thoái)
- Đạt mức cắt lỗ đã định trước (-8% hoặc mức bạn chấp nhận)
- Cần tiền cho nhu cầu khác

**Khi nào KHÔNG nên bán:**
- Chỉ vì giá giảm mạnh trong ngày mà không có lý do cơ bản

---

**Card 2 — Example**
> **Tháng 3/2020: Ai bán hoảng loạn, ai kiên nhẫn?**

VN-Index rơi từ 950 → 660 điểm trong 3 tuần (−30%).
HPG giảm từ 22,000 → 15,000 VND.

**Nhà đầu tư A (bán hoảng loạn):**
- Bán HPG ở 15,500 VND (gần đáy), lỗ −30%
- Tháng 12/2020: HPG đạt 38,000 VND
- Chi phí của bán hoảng loạn: bỏ lỡ +145% từ đáy

**Nhà đầu tư B (kiên nhẫn):**
- Tự hỏi: "Hòa Phát có còn sản xuất thép không? Có." → Giữ nguyên
- Tháng 12/2020: lãi +73% tính từ giá mua ban đầu 22,000 VND

**Khác biệt duy nhất:** Phản ứng với biến động ngắn hạn.

---

**Card 3 — Myth-Buster**
> ❌ **"Bán khi thị trường giảm là khôn ngoan để bảo toàn vốn"**

✅ **Sự thật:** Nếu bạn bán vì **cơ bản doanh nghiệp thay đổi** → đó là quyết định thông minh. Nếu bạn bán vì **giá giảm nhanh và bạn hoảng sợ** → đó là bán hoảng loạn.

Cách kiểm tra: Trước khi bán, trả lời câu hỏi: *"Có điều gì thay đổi về kinh doanh của công ty này không?"* Nếu không → chờ, đừng bán vì sợ hãi.

---

**Card 4 — Quiz**
> **Câu hỏi:** HPG giảm 6% trong buổi sáng do lo ngại lãi suất vĩ mô. Không có tin tức xấu nào về kinh doanh của HPG. Hành động nào ĐÚNG nhất?

| | |
|--|--|
| A. Bán ngay để tránh lỗ thêm | ✗ |
| B. Mua thêm ngay lập tức | ✗ |
| C. **Xem lại luận điểm đầu tư ban đầu; giữ nếu cơ bản không đổi** | ✓ |
| D. Đợi giá về giá mua để hòa vốn rồi mới bán | ✗ |

**Hint:** "Bán nên dựa trên CƠ BẢN DOANH NGHIỆP, không phải biến động giá ngắn hạn."

---

**Card 5 — CTA**
> **"Xem AI phát hiện mẫu hành vi"**

Vào AI Insights → Behavioral Flags. Xem danh sách các giao dịch được đánh dấu là có dấu hiệu bán hoảng loạn (bán trong vòng 15 phút sau khi giá giảm >3% từ đỉnh 1 giờ). Nhìn lại các lệnh đó: cổ phiếu có phục hồi sau đó không?

---

### L4.3 — Giao dịch quá mức (Overtrading Explained)

**Learning objectives:** Calculate fee drag; recognize overtrading signs; design a personal trade frequency limit.

---

**Card 1 — Concept**
> **Chi phí ẩn của giao dịch quá nhiều**

**Phí giao dịch tại VN (điển hình):**
- Phí mỗi lệnh: 0.1% – 0.35% giá trị lệnh
- Một round-trip (mua + bán) = 2 lệnh = 0.2% – 0.7% phí tổng

**Tác động cộng dồn:**

| Số round-trips/tuần | Phí/round-trip | Phí/tuần | Phí/năm |
|--------------------|---------------|---------|---------|
| 1 | 0.5% | 0.5% | ~26% |
| 3 | 0.5% | 1.5% | ~78% |
| 10 | 0.5% | 5.0% | ~260% |

**Ý nghĩa:** Nếu giao dịch 10 lần/tuần với phí 0.5%/round-trip, bạn cần kiếm ít nhất **5%/tuần chỉ để hòa vốn sau phí** — tương đương hơn 1,000%/năm. Không ai làm được nhất quán.

**Dấu hiệu giao dịch quá mức:**
- Xem màn hình giá >5 lần/ngày
- Mua rồi bán cùng 1 mã trong 1 tuần
- P&L biến động nhưng không tăng theo thời gian

---

**Card 2 — Example**
> **Trader A vs. Trader B — cùng thị trường, khác kết quả**

**Trader A (giao dịch nhiều):**
- 10 round-trips/tuần, mỗi lần +0.5% trước phí
- Phí mỗi round-trip: 0.5%
- Net/round-trip: 0.5% − 0.5% = **0%**
- Kết quả sau 1 năm: ~0% (trước khi tính lần lỗ)

**Trader B (kiên nhẫn):**
- 1–2 round-trips/tháng, mỗi lần nhắm +5–10%
- Phí/round-trip: 0.5% (không đáng kể so với 5–10% target)
- Net/round-trip: ~4.5–9.5%
- Kết quả sau 1 năm: tiềm năng +60–100%

**Lợi thế của nhà đầu tư cá nhân:** Không bị áp lực giao dịch. Hãy dùng lợi thế này — **chờ cơ hội thực sự**.

---

**Card 3 — Myth-Buster**
> ❌ **"Giao dịch nhiều hơn = nhiều cơ hội kiếm tiền hơn"**

✅ **Sự thật:** Với nhà đầu tư cá nhân, **nhiều giao dịch hơn = nhiều phí hơn = ít lợi nhuận hơn**. Các quỹ HFT (High-Frequency Trading) giao dịch hàng triệu lần/ngày vì họ có phí gần 0 và thuật toán tinh vi. Bạn không thể cạnh tranh với họ về tốc độ — hãy cạnh tranh bằng **kiên nhẫn và nghiên cứu**.

---

**Card 4 — Quiz**
> **Câu hỏi:** Phí giao dịch mỗi lệnh là 0.25%. Bạn mua rồi bán VNM (2 lệnh). Tổng phí là bao nhiêu?

| | |
|--|--|
| A. 0.25% | ✗ |
| B. **0.5%** | ✓ |
| C. 0.1% | ✗ |
| D. 1.0% | ✗ |

**Hint:** "Mỗi lệnh (mua hoặc bán) tính phí riêng. Mua (0.25%) + Bán (0.25%) = ?"

---

**Card 5 — CTA**
> **"Xem tổng phí đã trả trong lịch sử giao dịch"**

Vào Portfolio → P&L → Dòng phí giao dịch. Xem tổng phí tích lũy từ khi bắt đầu. So sánh với tổng P&L đã thực hiện: phí chiếm bao nhiêu % lợi nhuận của bạn?

---

### L4.4 — Tỷ lệ thắng vs. Hệ số lợi nhuận (Win Rate vs. Profit Factor)

**Learning objectives:** Calculate net P&L from win rate alone; explain why profit factor matters more; define risk-reward ratio.

---

**Card 1 — Concept**
> **Tại sao tỷ lệ thắng một mình không có nghĩa gì**

**Tỷ lệ thắng (Win Rate):** % số lần giao dịch có lãi.
> Ví dụ: 6 lãi / 10 giao dịch = **60% win rate**

**Hệ số lợi nhuận (Profit Factor):** Tổng lãi ÷ Tổng lỗ.
> Ví dụ: 6,000,000 VND lãi ÷ 3,000,000 VND lỗ = **Profit Factor 2.0**

**Điều quan trọng hơn win rate: Kích thước thắng/thua**

| Nhà đầu tư | Win rate | Mỗi lần thắng | Mỗi lần thua | Net/10 giao dịch |
|-----------|---------|--------------|--------------|-----------------|
| X | 70% | +100,000 | −400,000 | 7×100K − 3×400K = **−500,000** 🔴 |
| Y | 40% | +500,000 | −100,000 | 4×500K − 6×100K = **+1,400,000** 🟢 |

**Kết luận:** Nhà đầu tư X thắng 70% nhưng thua lỗ. Nhà đầu tư Y thắng chỉ 40% nhưng kiếm tiền tốt.

---

**Card 2 — Example**
> **Tỷ lệ thắng 30% nhưng vẫn có lãi — có thể không?**

**Nhà đầu tư chuyên nghiệp với 30% win rate:**
- 3 lần thắng × +20% mỗi lần = +60%
- 7 lần thua × −3% mỗi lần = −21%
- **Net: +39%** cho 10 giao dịch ✅

**Chìa khóa:** Cắt lỗ nhỏ (−3%), để lãi chạy dài (+20%). Đây là kỷ luật "cut losses, let winners run."

**Nhà đầu tư mới điển hình — 60% win rate nhưng thua lỗ:**
- 6 lần thắng × +2% = +12%
- 4 lần thua × −10% = −40% (không chịu cắt lỗ, giữ mãi)
- **Net: −28%** ❌

---

**Card 3 — Myth-Buster**
> ❌ **"Tỷ lệ thắng cao là bí quyết thành công trong đầu tư"**

✅ **Sự thật:** Nhiều nhà đầu tư cố gắng tối đa hóa tỷ lệ thắng bằng cách **không chịu cắt lỗ** (để tránh "hiện thực hóa thua"). Kết quả: hàng chục lệnh thắng nhỏ và vài lệnh thua rất lớn — tổng âm.

**Bí quyết thực sự:** Tỷ lệ Lãi/Lỗ (Risk-Reward Ratio) > 2:1. Tức là mỗi lần thắng kiếm ít nhất gấp đôi mỗi lần thua.

---

**Card 4 — Quiz**
> **Câu hỏi:** Nhà đầu tư X: 60% tỷ lệ thắng. Mỗi lần thắng +100,000 VND. Mỗi lần thua −300,000 VND. Sau 10 giao dịch, kết quả là?

| | |
|--|--|
| A. Lãi 240,000 VND | ✗ |
| B. Hòa vốn | ✗ |
| C. **Lỗ 600,000 VND** | ✓ |
| D. Lãi 600,000 VND | ✗ |

**Hint:** "Tính: (6 × 100,000) − (4 × 300,000) = 600,000 − 1,200,000 = ?"

---

**Card 5 — CTA**
> **"Xem P&L thực hiện theo lệnh"**

Vào Portfolio → Lịch sử giao dịch đã đóng. Tính tay hoặc xem AI: tỷ lệ thắng của bạn là bao nhiêu %? Trung bình mỗi lần thắng là bao nhiêu VND? Mỗi lần thua? Profit Factor của bạn hiện tại > 1 không?

---

### L4.5 — Xây dựng quy tắc giao dịch (Building Your Trading Rules)

**Learning objectives:** Write 3 personal trading rules; commit to a stop-loss framework; share rules publicly.

---

**Card 1 — Concept**
> **Quy tắc giao dịch — Loại bỏ cảm xúc khỏi quyết định**

Quy tắc giao dịch là tập hợp các cam kết **được viết ra trước** để không bị cảm xúc chi phối trong lúc thị trường biến động mạnh.

**5 quy tắc nền tảng cho F0 trader:**

| # | Quy tắc | Lý do |
|---|---------|-------|
| 1 | Không có cổ phiếu nào > 25% tổng danh mục | Giới hạn tổn thất nếu một mã sụp đổ |
| 2 | Cắt lỗ tối đa −8% từ giá mua | Ngăn lỗ nhỏ thành lỗ lớn |
| 3 | Không mua cổ phiếu đã tăng >15% mà không có nghiên cứu trước | Chống FOMO |
| 4 | Tối đa 3 giao dịch mới mỗi tuần | Chống overtrading |
| 5 | Đợi 24 giờ trước khi bán khi thị trường điều chỉnh mạnh | Chống bán hoảng loạn |

**Quy tắc phải:** được viết ra → được đọc lại trước mỗi quyết định mua/bán quan trọng.

---

**Card 2 — Example**
> **"Sổ quy tắc" của một nhà đầu tư F0 sau Module 4**

> *Quy tắc giao dịch của tôi — [Tên], ngày [Date]:*
>
> 1. "Tôi không bao giờ đặt hơn 20% danh mục vào một mã duy nhất."
> 2. "Khi bất kỳ cổ phiếu nào lỗ −8% từ giá mua, tôi bán ra và xem xét lại luận điểm trước khi mua lại."
> 3. "Trước khi mua, tôi phải có thể giải thích tại sao tôi mua trong 2 câu đơn giản."
> 4. "Khi thị trường giảm >3% trong ngày, tôi không đặt lệnh bán ngay — chờ ít nhất 24 giờ."
> 5. "Tôi review danh mục mỗi Chủ nhật, không phải mỗi giờ."

---

**Card 3 — Myth-Buster**
> ❌ **"Quy tắc cứng nhắc, thực tế phải linh hoạt"**

✅ **Sự thật:** "Linh hoạt" không có quy tắc = quyết định theo cảm xúc. Các nhà đầu tư huyền thoại (Warren Buffett, Ray Dalio, Peter Lynch) đều có **hệ thống quy tắc nghiêm ngặt**. Buffett: "Quy tắc 1: Đừng mất tiền. Quy tắc 2: Đừng quên Quy tắc 1."

Linh hoạt **trong khung quy tắc** là kỹ năng. Linh hoạt **để phá vỡ quy tắc khi cần nhất** là tự sabotage.

---

**Card 4 — Quiz**
> **Câu hỏi:** Bạn đặt quy tắc cắt lỗ −8%. VNM đang lỗ −9% sau 5 ngày. Không có tin xấu về công ty. Hành động nào ĐÚNG với kỷ luật giao dịch?

| | |
|--|--|
| A. Giữ thêm vì VNM là công ty tốt | ✗ |
| B. Mua thêm để hạ giá vốn | ✗ |
| C. **Tuân thủ quy tắc: bán và xem xét lại luận điểm trước khi mua lại** | ✓ |
| D. Đợi hồi phục về giá mua rồi mới bán | ✗ |

**Hint:** "Quy tắc đặt ra để THỰC HIỆN khi khó nhất. Nếu chỉ tuân thủ khi dễ thì không cần quy tắc."

---

**Card 5 — CTA**
> **"Chia sẻ 3 quy tắc giao dịch của bạn với cộng đồng"**

Mở trình soạn thảo bài đăng cộng đồng (được mở khóa khi hoàn thành Module 4). Template đã được điền sẵn:

> *"3 quy tắc giao dịch của tôi:*
> *1. ___*
> *2. ___*
> *3. ___"*

Điền vào 3 quy tắc cá nhân của bạn. Đăng lên cộng đồng để giữ mình có trách nhiệm — và truyền cảm hứng cho F0 trader khác.

---

## Appendix A — Content Quality Checklist

Trước khi đưa bài học vào production, mỗi card phải qua checklist sau:

| # | Tiêu chí | Kiểm tra |
|---|----------|---------|
| 1 | Concept card ≤ 150 từ | ☐ |
| 2 | Example dùng tên công ty VN thực (VNM, HPG, FPT, VCB…) | ☐ |
| 3 | Myth-Buster có "❌ Myth" và "✅ Thực tế" rõ ràng | ☐ |
| 4 | Quiz có đúng 4 đáp án, 1 đúng | ☐ |
| 5 | Quiz không có "A và B", "Tất cả đều đúng" kiểu đáp án mơ hồ | ☐ |
| 6 | Hint text không tiết lộ đáp án, chỉ gợi ý hướng suy nghĩ | ☐ |
| 7 | CTA có thể thực hiện trong app trong <2 phút | ☐ |
| 8 | Số liệu (giá, ngày, %) dựa trên dữ liệu lịch sử thực | ☐ |
| 9 | Ngôn ngữ: tiếng Việt thân thiện F0 (không dùng jargon không giải thích) | ☐ |
| 10 | Không có "TBD" hay nội dung placeholder | ☐ |

---

## Appendix B — Learning Level Transition Summary

| Transition | Trigger | XP Bonus |
|-----------|---------|---------|
| L0 → L1 | Complete first lesson in M1 | +15 XP |
| L1 → L2 | M1 complete + MKC-1 pass (≥3/5) | +15 XP |
| L2 → L3 | M2 complete + MKC-2 pass + ≥5 trades | +15 XP |
| L3 → L4 | M3 complete + MKC-3 pass | +15 XP |
| L4 → L5 | M4 complete + MKC-4 pass | +15 XP |
| Total XP from level-ups | — | **+75 XP** |
