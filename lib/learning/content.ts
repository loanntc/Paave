// ---------------------------------------------------------------------------
// F0 Learning Path — Complete Content Library
// Source: docs/business/FRD/module-f0-learning-content.md
// All 4 modules with complete card content (20 lessons × 5 cards)
// ---------------------------------------------------------------------------

import type { LearningModule, Lesson } from "./types";

// ---------------------------------------------------------------------------
// MODULE 1 — The VN Stock Market
// ---------------------------------------------------------------------------

const L1_1: Lesson = {
  id: "L1.1",
  moduleId: "M1",
  index: 1,
  titleVi: "Cổ phiếu là gì?",
  titleEn: "What is a Stock?",
  cards: [
    {
      type: "CONCEPT",
      heading: "Cổ phiếu = Quyền sở hữu một phần công ty",
      body: "Khi một công ty muốn huy động vốn, họ chia công ty thành hàng triệu cổ phần nhỏ và bán ra công chúng. Mỗi cổ phần bạn mua = bạn sở hữu một mảnh nhỏ của công ty đó.\n\n**4 điều cần nhớ:**\n1. **Cổ đông** (shareholder) = chủ sở hữu một phần công ty\n2. **Lợi nhuận** có 2 nguồn: giá tăng (capital gain) + cổ tức (dividend)\n3. **Rủi ro:** giá có thể giảm — bạn có thể mất một phần vốn\n4. **HoSE** liệt kê ~400 công ty VN; **HNX** ~300 công ty",
    },
    {
      type: "EXAMPLE",
      heading: "Vinamilk (VNM): Câu chuyện 20 năm tăng trưởng",
      body: "- Vinamilk niêm yết HoSE năm 2003 với giá ~35,000 VND/cổ phiếu\n- Năm 2022, VNM đạt đỉnh ~95,000 VND — tăng gần **3 lần** trong 19 năm\n- VNM trả **cổ tức 2,000–3,000 VND/cổ phiếu** mỗi năm\n\nNhà đầu tư mua 1,000 cổ phiếu VNM năm 2003 (35 triệu VND) → đến 2022 có ~95 triệu VND + ~40 triệu VND cổ tức = **~135 triệu VND**.\n\nKhi bạn mua VNM → bạn là đồng sở hữu công ty sản xuất 1.5 tỷ lít sữa mỗi năm.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Mua cổ phiếu = đánh bạc\"",
      body: "✅ **Sự thật:** Cờ bạc tạo ra tiền từ không có gì; đầu tư chứng khoán là mua quyền sở hữu **tài sản thực**.\n\nVinamilk sản xuất sữa, FPT viết phần mềm, Hòa Phát luyện thép. Những công ty này tạo ra giá trị thực mỗi ngày — và giá cổ phiếu **phản ánh giá trị thực đó theo thời gian**.\n\nĐầu tư có rủi ro, nhưng về dài hạn, giá trị doanh nghiệp tốt luôn tăng cùng nền kinh tế.",
    },
    {
      type: "QUIZ",
      heading: "Khi bạn mua 100 cổ phiếu VNM, điều nào sau đây ĐÚNG?",
      body: "",
      options: [
        { id: "A", text: "Bạn cho Vinamilk vay tiền" },
        { id: "B", text: "Bạn sở hữu một phần nhỏ của Vinamilk" },
        { id: "C", text: "Bạn nhận được lãi suất cố định hàng tháng" },
        { id: "D", text: "Vinamilk phải hoàn trả tiền cho bạn" },
      ],
      correctOption: "B",
      hint: "Đọc lại thẻ Concept. Cổ phiếu ≠ trái phiếu ≠ gửi tiết kiệm. Cổ phiếu = quyền SỞ HỮU.",
    },
    {
      type: "CTA",
      heading: "Khám phá cổ phiếu thực tế ngay bây giờ",
      body: "Mở màn hình tìm kiếm. Tìm **VNM**, **VIC**, **FPT**. Xem giá hiện tại và % thay đổi trong ngày.",
      ctaAction: "BROWSE_STOCK_LIST",
      ctaLabel: "Mở danh sách cổ phiếu",
    },
  ],
};

const L1_2: Lesson = {
  id: "L1.2",
  moduleId: "M1",
  index: 2,
  titleVi: "HoSE & HNX hoạt động như thế nào?",
  titleEn: "How do HoSE & HNX work?",
  cards: [
    {
      type: "CONCEPT",
      heading: "3 sàn chứng khoán Việt Nam",
      body: "| Sàn | Đặc điểm | Ví dụ |\n|-----|----------|-------|\n| **HoSE** | Sàn lớn nhất; công ty blue-chip | VNM, VIC, FPT, HPG |\n| **HNX** | Công ty vừa và nhỏ hơn | SHB, PVS, VCS |\n| **UPCoM** | Công ty chưa niêm yết chính thức | Thanh khoản thấp |\n\n**Giờ giao dịch HoSE/HNX (ngày làm việc):**\n- **9:00–9:15**: ATO (khớp lệnh định kỳ mở cửa)\n- **9:15–11:30**: Khớp lệnh liên tục (phiên sáng)\n- **13:00–14:30**: Khớp lệnh liên tục (phiên chiều)\n- **14:30–14:45**: ATC (khớp lệnh định kỳ đóng cửa)",
    },
    {
      type: "EXAMPLE",
      heading: "Đặt lệnh mua VIC lúc 8:50 sáng — điều gì xảy ra?",
      body: "1. **8:50**: Bạn đặt lệnh ATO mua 100 VIC → lệnh được nhận, xếp hàng chờ\n2. **9:00**: Phiên ATO mở → Sàn tính giá mở cửa từ tất cả lệnh ATO\n3. **9:01**: Lệnh của bạn **khớp tại giá mở cửa** — giá cân bằng cung-cầu lúc 9:00\n4. **9:15**: Sang phiên liên tục — mỗi lệnh khớp ngay khi có đối ứng\n\n**ATO hữu ích cho ai?** Nhà đầu tư muốn mua/bán tại giá mở cửa, không cần xem màn hình lúc 9:00 sáng.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Chứng khoán VN giao dịch 24/7 như Bitcoin\"",
      body: "✅ **Sự thật:** VN stock exchange có **giờ giao dịch cố định**. Ngoài giờ, lệnh được nhận nhưng **không khớp**.\n\nĐiều này khác với crypto (24/7) hay forex (5.5 ngày/tuần). Sàn chứng khoán đóng cửa vào cuối tuần và ngày lễ theo lịch HoSE/HNX. Đây là đặc điểm của **sàn giao dịch tập trung**, không phải giới hạn kỹ thuật.",
    },
    {
      type: "QUIZ",
      heading: "HoSE bắt đầu phiên khớp lệnh liên tục lúc mấy giờ?",
      body: "",
      options: [
        { id: "A", text: "9:00" },
        { id: "B", text: "9:15" },
        { id: "C", text: "10:00" },
        { id: "D", text: "8:30" },
      ],
      correctOption: "B",
      hint: "9:00–9:15 là phiên ATO (khớp lệnh ĐỊNH KỲ). Khớp lệnh LIÊN TỤC bắt đầu sau đó.",
    },
    {
      type: "CTA",
      heading: "Kiểm tra phiên thị trường ngay bây giờ",
      body: "Mở màn hình trạng thái thị trường. Xem HoSE đang ở phiên nào (ATO / Liên tục / ATC / Đóng cửa).",
      ctaAction: "CHECK_MARKET_SESSION",
      ctaLabel: "Xem trạng thái thị trường",
    },
  ],
};

const L1_3: Lesson = {
  id: "L1.3",
  moduleId: "M1",
  index: 3,
  titleVi: "Đọc bảng giá",
  titleEn: "Reading the Price Board",
  cards: [
    {
      type: "CONCEPT",
      heading: "3 mức giá quan trọng mỗi ngày",
      body: "| Mức giá | Màu sắc | Mô tả |\n|---------|---------|-------|\n| **Giá tham chiếu** | Vàng | Giá đóng cửa hôm qua |\n| **Giá trần** | Tím | Mức cao nhất được phép hôm nay |\n| **Giá sàn** | Xanh lam | Mức thấp nhất được phép hôm nay |\n\n**Biên độ dao động:**\n- **HoSE:** ±7% từ giá tham chiếu\n- **HNX:** ±10% từ giá tham chiếu\n- **UPCoM:** ±15% từ giá tham chiếu",
    },
    {
      type: "EXAMPLE",
      heading: "VIC tham chiếu 45,000 VND — tính giá trần/sàn",
      body: "**HoSE (biên độ ±7%):**\n- Giá trần: 45,000 × 1.07 = **48,150 VND** (làm tròn theo quy tắc HoSE)\n- Giá sàn: 45,000 × 0.93 = **41,850 VND**\n\n**Ý nghĩa thực tế:**\n- Giá cổ phiếu KHÔNG thể tăng/giảm vượt quá biên độ này trong 1 ngày\n- Nếu thị trường muốn định giá cao hơn → giá \"dính trần\" (giá trần, màu tím) → phiên sau tiếp tục tăng\n- Đây là cơ chế bảo vệ nhà đầu tư của VN",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Cổ phiếu dính trần = nên mua ngay\"",
      body: "✅ **Sự thật:** Giá dính trần nghĩa là **cầu mua cao hơn cung bán** ở mức đó — chưa chắc đây là thời điểm tốt để mua.\n\nGiá có thể dính trần vì:\n- Tin tốt thực sự từ công ty → có thể tiếp tục tăng\n- Đầu cơ ngắn hạn → giá có thể đảo chiều nhanh\n- FOMO (sợ bỏ lỡ) → nguy hiểm nhất\n\n**Nguyên tắc:** Phân tích lý do tại sao giá tăng trước khi quyết định mua.",
    },
    {
      type: "QUIZ",
      heading: "Cổ phiếu HoSE có giá tham chiếu 50,000 VND. Giá trần là bao nhiêu?",
      body: "",
      options: [
        { id: "A", text: "53,000 VND" },
        { id: "B", text: "53,500 VND" },
        { id: "C", text: "55,000 VND" },
        { id: "D", text: "57,000 VND" },
      ],
      correctOption: "B",
      hint: "HoSE ±7%: 50,000 × 1.07 = 53,500 VND.",
    },
    {
      type: "CTA",
      heading: "Mở bảng giá thực tế",
      body: "Mở màn hình khám phá và tìm một cổ phiếu HoSE. Xác định giá tham chiếu (vàng), giá trần (tím), giá sàn (xanh lam).",
      ctaAction: "OPEN_PRICE_BOARD",
      ctaLabel: "Mở bảng giá HoSE",
    },
  ],
};

const L1_4: Lesson = {
  id: "L1.4",
  moduleId: "M1",
  index: 4,
  titleVi: "Điều gì khiến giá cổ phiếu thay đổi?",
  titleEn: "What moves stock prices?",
  cards: [
    {
      type: "CONCEPT",
      heading: "4 yếu tố chính tác động giá cổ phiếu",
      body: "**1. Kết quả kinh doanh (Earnings)**\nDoanh thu, lợi nhuận, tăng trưởng của công ty → ảnh hưởng trực tiếp nhất.\n\n**2. Lãi suất & Kinh tế vĩ mô**\nLãi suất tăng → chi phí vốn cao hơn → P/E giảm → cổ phiếu giảm.\n\n**3. Tin tức & Sự kiện**\nM&A, thay CEO, thắng thầu lớn, thiên tai, dịch bệnh.\n\n**4. Tâm lý thị trường (Sentiment)**\nFOMO, panic sell, tin đồn. Ngắn hạn nhất nhưng mạnh nhất.",
    },
    {
      type: "EXAMPLE",
      heading: "FPT — Giá tăng gấp 3 trong 3 năm (2020–2023)",
      body: "**Lý do FPT tăng từ ~40,000 → ~120,000 VND:**\n\n- **Earnings:** Lợi nhuận tăng trưởng ~25%/năm liên tiếp\n- **Macro:** Xuất khẩu phần mềm sang Nhật/Mỹ hưởng lợi tỷ giá\n- **Tin tức:** Ký hợp đồng với các tập đoàn Fortune 500\n- **Sentiment:** Nhà đầu tư nước ngoài mua vào mạnh\n\n**Bài học:** Giá tăng mạnh & bền vững thường có nền tảng từ **earnings thực sự** — không chỉ từ tâm lý.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Cổ phiếu giảm vì bị thao túng\"",
      body: "✅ **Sự thật:** Phần lớn biến động giá đến từ cung-cầu tự nhiên và kết quả kinh doanh.\n\nThao túng giá (market manipulation) là vi phạm pháp luật nghiêm trọng tại VN. UBCK kiểm tra giao dịch bất thường liên tục.\n\nKhi một cổ phiếu giảm, hãy hỏi:\n- Kết quả kinh doanh có xấu đi không?\n- Có tin tức tiêu cực từ ngành không?\n- Thị trường chung đang giảm không?\n\nTrả lời 3 câu đó trước khi nghĩ đến thao túng.",
    },
    {
      type: "QUIZ",
      heading: "Điều gì KHÔNG ảnh hưởng đến giá cổ phiếu?",
      body: "",
      options: [
        { id: "A", text: "Lãi suất ngân hàng tăng" },
        { id: "B", text: "Kết quả kinh doanh quý vừa công bố" },
        { id: "C", text: "Tin tức vĩ mô về GDP" },
        { id: "D", text: "Màu sắc logo của công ty" },
      ],
      correctOption: "D",
      hint: "Giá phản ánh cung-cầu, kinh tế, và doanh nghiệp thực tế — không phải hình thức bên ngoài.",
    },
    {
      type: "CTA",
      heading: "Đọc tin tức thị trường hôm nay",
      body: "Mở tab Tin tức. Đọc 1 bài về cổ phiếu hoặc thị trường VN. Xác định đây là loại tin gì: earnings, macro, hay sentiment?",
      ctaAction: "READ_NEWS_ARTICLE",
      ctaLabel: "Mở tin tức thị trường",
    },
  ],
};

const L1_5: Lesson = {
  id: "L1.5",
  moduleId: "M1",
  index: 5,
  titleVi: "Biên độ giá tại Việt Nam",
  titleEn: "Price Bands in Vietnam",
  cards: [
    {
      type: "CONCEPT",
      heading: "Tại sao VN có biên độ giá?",
      body: "Biên độ giá (price band / limit up-down) là quy định bắt buộc của UBCK nhằm:\n\n1. **Ngăn biến động quá mức** do tin đồn hoặc thao túng\n2. **Bảo vệ nhà đầu tư nhỏ lẻ** khỏi bị cuốn vào sóng FOMO/panic\n3. **Giữ ổn định** cho thị trường còn đang phát triển\n\n**Quy tắc vàng:**\n- Lệnh đặt giá > giá trần: **BỊ TỪ CHỐI ngay lập tức**\n- Lệnh đặt giá < giá sàn: **BỊ TỪ CHỐI ngay lập tức**\n- Điều này áp dụng cho CẢ lệnh mua và lệnh bán",
    },
    {
      type: "EXAMPLE",
      heading: "VIC tham chiếu 45,000. Nhà đầu tư đặt mua 50,000 — chuyện gì xảy ra?",
      body: "**HoSE:** Giá trần = 45,000 × 1.07 = 48,150 VND\n\n**Lệnh mua 50,000 VND > 48,150 (giá trần):**\n→ Hệ thống **TỪ CHỐI** lệnh\n→ Màn hình hiển thị: \"Giá vượt giá trần cho phép\"\n→ Không tiền nào bị trừ\n→ Nhà đầu tư cần đặt lại với giá ≤ 48,150\n\n**Lesson:** Luôn kiểm tra giá trần trước khi đặt lệnh mua cổ phiếu đang tăng mạnh.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"UPCoM không có biên độ giá\"",
      body: "✅ **Sự thật:** UPCoM có biên độ **±15%** — rộng nhất trong 3 sàn, nhưng vẫn có giới hạn.\n\n**So sánh 3 sàn:**\n| Sàn | Biên độ |\n|-----|---------|\n| HoSE | ±7% |\n| HNX | ±10% |\n| UPCoM | ±15% |\n\nBiên độ rộng hơn = rủi ro cao hơn và cơ hội lớn hơn. Đó là lý do cổ phiếu UPCoM thường có thanh khoản thấp và biến động mạnh hơn.",
    },
    {
      type: "QUIZ",
      heading: "Điều gì xảy ra khi đặt lệnh mua cao hơn giá trần?",
      body: "",
      options: [
        { id: "A", text: "Lệnh khớp tại giá trần" },
        { id: "B", text: "Lệnh khớp bình thường" },
        { id: "C", text: "Lệnh chờ đến ngày hôm sau" },
        { id: "D", text: "Lệnh bị từ chối ngay lập tức" },
      ],
      correctOption: "D",
      hint: "Sàn giao dịch từ chối tất cả lệnh đặt ngoài biên độ giá — không có ngoại lệ.",
    },
    {
      type: "CTA",
      heading: "Thử đặt lệnh vượt giá trần",
      body: "Tìm VIC trên ứng dụng. Mở paper trade. Nhập giá mua **cao hơn giá trần**. Xem hệ thống phản ứng thế nào.",
      ctaAction: "ATTEMPT_CEILING_ORDER",
      ctaLabel: "Thử đặt lệnh mua VIC",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULE 2 — Your First Trade
// ---------------------------------------------------------------------------

const L2_1: Lesson = {
  id: "L2.1",
  moduleId: "M2",
  index: 1,
  titleVi: "Lệnh Thị trường vs. Lệnh Giới hạn",
  titleEn: "Market vs. Limit Orders",
  cards: [
    {
      type: "CONCEPT",
      heading: "Các loại lệnh cơ bản tại VN",
      body: "| Loại lệnh | Ký hiệu | Đặc điểm |\n|-----------|---------|----------|\n| **Lệnh giới hạn** | LO | Chỉ khớp tại giá bạn đặt hoặc tốt hơn |\n| **Lệnh ATO** | ATO | Khớp tại giá mở cửa (chỉ dùng 9:00–9:15) |\n| **Lệnh ATC** | ATC | Khớp tại giá đóng cửa (chỉ dùng 14:30–14:45) |\n| **Lệnh thị trường** | MP | Khớp ngay tại giá tốt nhất hiện có |\n\n**Thực tế:** Nhà đầu tư VN chủ yếu dùng **LO (Limit Order)** vì kiểm soát được giá. ATO/ATC dùng khi muốn chắc chắn khớp lệnh.",
    },
    {
      type: "EXAMPLE",
      heading: "VNM đang giao dịch 66,500 VND. Bạn muốn mua 100 cổ phiếu.",
      body: "**Cách A — Lệnh LO tại 66,000 VND:**\n→ Lệnh được đặt, chờ người bán đồng ý bán ở 66,000\n→ Nếu giá không xuống → lệnh không khớp\n→ **Ưu điểm:** Kiểm soát giá. **Nhược điểm:** Có thể không mua được\n\n**Cách B — Lệnh MP:**\n→ Hệ thống khớp ngay với lệnh bán tốt nhất hiện có\n→ Bạn chắc chắn mua được nhưng giá có thể cao hơn dự kiến\n→ **Ưu điểm:** Chắc chắn khớp. **Nhược điểm:** Giá biến động",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Lệnh LO an toàn hơn vì luôn mua được giá tốt\"",
      body: "✅ **Sự thật:** LO cho bạn kiểm soát giá — nhưng **không đảm bảo sẽ khớp**.\n\nNếu bạn đặt LO mua VNM tại 65,000 nhưng giá đang ở 67,000 và đang tăng → lệnh sẽ không khớp. Bạn có thể \"bắt lỡ\" cổ phiếu trong khi chờ giá về mức bạn muốn.\n\n**Nguyên tắc:** Trong thị trường đang tăng mạnh, LO có thể không mua được. Trong thị trường bình thường, LO là lựa chọn tốt.",
    },
    {
      type: "QUIZ",
      heading: "Lệnh LO bảo đảm điều gì?",
      body: "",
      options: [
        { id: "A", text: "Khớp ngay lập tức" },
        { id: "B", text: "Khớp tại giá tham chiếu" },
        { id: "C", text: "Khớp tại giá bạn đặt hoặc tốt hơn" },
        { id: "D", text: "Không bao giờ bị từ chối" },
      ],
      correctOption: "C",
      hint: "LO = Limit Order. Chỉ khớp ở giá ≤ giá mua bạn đặt (đối với lệnh mua).",
    },
    {
      type: "CTA",
      heading: "Đặt lệnh mua thị trường đầu tiên",
      body: "Mở paper trade cho **VNM**. Đặt lệnh **MUA** với loại lệnh **MP**, số lượng **100 cổ phiếu**. Quan sát giá khớp.",
      ctaAction: "PLACE_MARKET_ORDER",
      ctaLabel: "Mua VNM (Paper Trade)",
    },
  ],
};

const L2_2: Lesson = {
  id: "L2.2",
  moduleId: "M2",
  index: 2,
  titleVi: "Lô cổ phiếu tại Việt Nam",
  titleEn: "Board Lots",
  cards: [
    {
      type: "CONCEPT",
      heading: "Lô giao dịch tối thiểu: 100 cổ phiếu",
      body: "Tại VN (HoSE và HNX), mọi lệnh giao dịch thông thường phải theo **bội số của 100**.\n\n**Các số lượng HỢP LỆ:** 100, 200, 300, 500, 1000, ...\n**Các số lượng KHÔNG HỢP LỆ:** 50, 150, 250, 99, 101, ...\n\n**Tại sao có quy định này?**\n- Đơn giản hóa hệ thống khớp lệnh\n- Giảm số lượng lệnh nhỏ lẻ (odd lot)\n- Tiêu chuẩn quốc tế của thị trường phát triển\n\n**Lưu ý:** Lệnh lô lẻ (odd lot) vẫn tồn tại nhưng giao dịch theo cơ chế riêng, thanh khoản kém hơn.",
    },
    {
      type: "EXAMPLE",
      heading: "Bạn muốn đầu tư 5 triệu VND vào FPT (đang giao dịch 95,000 VND)",
      body: "**Tính số cổ phiếu:**\n5,000,000 ÷ 95,000 = 52.6 cổ phiếu\n\n**Làm tròn xuống bội số 100:**\n→ Không thể mua 52 cổ phiếu (không phải bội số 100)\n→ **Chỉ có thể mua 0 cổ phiếu** nếu budget < 9,500,000 VND (100 × 95,000)\n\n**Giải pháp thực tế:**\n- Tăng ngân sách lên ≥ 9,500,000 VND để mua 100 cổ phiếu\n- Hoặc chọn cổ phiếu có giá thấp hơn\n- Hoặc tích lũy thêm tiền trước khi đầu tư vào FPT",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Mua ít cổ phiếu (< 100) là chiến lược an toàn để thử nghiệm\"",
      body: "✅ **Sự thật:** Không thể đặt lệnh lô lẻ trên bảng chính. Hệ thống sẽ từ chối.\n\nNếu bạn muốn \"thử nghiệm\" với số vốn nhỏ, các lựa chọn thực tế là:\n1. Chọn cổ phiếu có giá thấp (VD: HPG ~33,000 VND → 100 cổ = 3.3 triệu VND)\n2. Dùng **paper trading** (không mất tiền thật) để luyện tập\n3. Tích lũy đủ vốn cho 1 lô tối thiểu\n\nPaper trading trên Paave không có giới hạn lô lẻ — nhưng lệnh thật thì có.",
    },
    {
      type: "QUIZ",
      heading: "Số lượng đặt lệnh nào HỢP LỆ trên HoSE?",
      body: "",
      options: [
        { id: "A", text: "50 cổ phiếu" },
        { id: "B", text: "150 cổ phiếu" },
        { id: "C", text: "200 cổ phiếu" },
        { id: "D", text: "250 cổ phiếu" },
      ],
      correctOption: "C",
      hint: "Bội số của 100: 200 = 100 × 2 ✓. Các số còn lại không chia hết cho 100.",
    },
    {
      type: "CTA",
      heading: "Thử đặt lệnh lô lẻ",
      body: "Mở paper trade cho **FPT**. Đặt lệnh MUA **50 cổ phiếu** (lô lẻ). Quan sát thông báo lỗi của hệ thống.",
      ctaAction: "ATTEMPT_ODD_LOT_ORDER",
      ctaLabel: "Thử đặt 50 cổ phiếu FPT",
    },
  ],
};

const L2_3: Lesson = {
  id: "L2.3",
  moduleId: "M2",
  index: 3,
  titleVi: "Hướng dẫn Mua & Bán",
  titleEn: "Buy & Sell Walkthrough",
  cards: [
    {
      type: "CONCEPT",
      heading: "Quy trình đặt lệnh mua/bán — 5 bước",
      body: "1. **Chọn mã cổ phiếu** — tìm kiếm hoặc từ watchlist\n2. **Chọn loại lệnh** — LO (giới hạn giá) hoặc ATO/ATC\n3. **Nhập số lượng** — bội số của 100\n4. **Nhập giá** — trong biên độ trần/sàn\n5. **Xác nhận** — kiểm tra tổng giá trị + phí trước khi đặt\n\n**Phí giao dịch cần biết:**\n- Phí môi giới: ~0.15–0.30%/lệnh (tuỳ broker)\n- Thuế TNCN khi bán: 0.1% × tổng giá trị bán (T+2 settlement)\n- **Paper trade trên Paave:** phí giả lập để luyện tập thực tế",
    },
    {
      type: "EXAMPLE",
      heading: "Mua 100 HPG tại 33,000 VND — chi tiết lệnh",
      body: "| Thông số | Giá trị |\n|----------|--------|\n| Mã | HPG (Hòa Phát Group) |\n| Loại lệnh | LO |\n| Số lượng | 100 cổ phiếu |\n| Giá đặt | 33,000 VND |\n| **Giá trị lệnh** | **3,300,000 VND** |\n| Phí môi giới (~0.25%) | 8,250 VND |\n| **Tổng thanh toán** | **3,308,250 VND** |\n\nSau khi đặt: lệnh xuất hiện trong \"Lệnh chờ\" → khi khớp chuyển sang \"Đã khớp\" → vị thế xuất hiện trong Portfolio.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Đặt lệnh xong là mua được ngay\"",
      body: "✅ **Sự thật:** Lệnh LO chỉ khớp khi có **người bán đồng ý bán ở mức giá bạn đặt**.\n\nTrong thực tế:\n- Lệnh có thể chờ vài phút đến vài giờ hoặc không khớp trong ngày\n- Nếu lệnh chưa khớp trước 14:30, bạn có thể hủy và đặt lại\n- Lệnh chưa khớp sẽ **tự động hủy** vào cuối phiên (trừ lệnh ATC)\n\n**Bài học:** Theo dõi trạng thái lệnh sau khi đặt — đừng giả định lệnh đã khớp.",
    },
    {
      type: "QUIZ",
      heading: "Mua 200 HPG tại 33,000 VND. Tổng giá trị lệnh là bao nhiêu?",
      body: "",
      options: [
        { id: "A", text: "3,300,000 VND" },
        { id: "B", text: "3,600,000 VND" },
        { id: "C", text: "6,600,000 VND" },
        { id: "D", text: "33,000,000 VND" },
      ],
      correctOption: "C",
      hint: "200 × 33,000 = 6,600,000 VND.",
    },
    {
      type: "CTA",
      heading: "Đặt lệnh mua giới hạn đầu tiên",
      body: "Mở paper trade cho **HPG**. Đặt lệnh **MUA LIMIT**, **100 cổ phiếu**, giá = giá tham chiếu hiện tại. Xác nhận lệnh.",
      ctaAction: "PLACE_LIMIT_BUY",
      ctaLabel: "Mua HPG (Lệnh Limit)",
    },
  ],
};

const L2_4: Lesson = {
  id: "L2.4",
  moduleId: "M2",
  index: 4,
  titleVi: "T+2 là gì?",
  titleEn: "What is T+2 Settlement?",
  cards: [
    {
      type: "CONCEPT",
      heading: "T+2: Tiền và cổ phiếu về tài khoản sau 2 ngày làm việc",
      body: "**T** = Trade date (ngày giao dịch)\n**+2** = 2 ngày làm việc (không tính thứ 7, CN, ngày lễ)\n\n**Ý nghĩa thực tế:**\n- Mua thứ Hai → cổ phiếu về thứ Tư\n- Bán thứ Tư → tiền về thứ Sáu\n- Mua thứ Năm → cổ phiếu về thứ Hai tuần sau\n\n**Tại sao có T+2?**\nCần thời gian để 2 bên (mua/bán) xác nhận giao dịch, VSD (Trung tâm Lưu ký Chứng khoán) hoàn tất thanh toán bù trừ.",
    },
    {
      type: "EXAMPLE",
      heading: "Bạn mua VNM thứ Tư, muốn bán ngay thứ Năm — có được không?",
      body: "**Mua thứ Tư (T+0):**\n→ Vị thế xuất hiện trong portfolio → trạng thái: **\"Chờ thanh toán\"**\n→ Số cổ phiếu hiển thị nhưng **chưa bán được**\n\n**Thứ Năm (T+1):**\n→ Vẫn chờ → **không thể bán**\n\n**Thứ Sáu (T+2):**\n→ Cổ phiếu **về tài khoản chính thức**\n→ Bây giờ mới có thể **bán hoặc dùng làm tài sản thế chấp**\n\n**Lesson:** T+2 là lý do tại sao bạn cần tính thời gian khi muốn giao dịch lướt ngắn hạn.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Bán được ngay sau khi mua cổ phiếu\"",
      body: "✅ **Sự thật:** Tại VN, bạn phải chờ T+2 trước khi bán cổ phiếu vừa mua.\n\nNhiều thị trường phát triển (Mỹ) đang chuyển sang **T+1** (2024) và thậm chí **T+0** trong tương lai. VN đang trong lộ trình cải thiện hệ thống thanh toán.\n\n**Ngoại lệ:** Intraday bán trong ngày (sell today, buy earlier today) — hiện tại VN **KHÔNG cho phép** intraday trading trên HoSE/HNX. Mua ngày nào chỉ bán được từ T+2 ngày đó.",
    },
    {
      type: "QUIZ",
      heading: "Bạn mua cổ phiếu vào thứ Tư. Khi nào bán được?",
      body: "",
      options: [
        { id: "A", text: "Thứ Năm" },
        { id: "B", text: "Thứ Sáu" },
        { id: "C", text: "Thứ Bảy" },
        { id: "D", text: "Thứ Hai tuần sau" },
      ],
      correctOption: "B",
      hint: "T+2 ngày làm việc: Thứ Tư (T) + Thứ Năm (T+1) + Thứ Sáu (T+2) = có thể bán thứ Sáu.",
    },
    {
      type: "CTA",
      heading: "Xem nhãn T+2 trong danh mục",
      body: "Mở tab Danh mục. Tìm vị thế bạn vừa đặt lệnh mua. Xem nhãn trạng thái thanh toán T+2.",
      ctaAction: "VIEW_T2_LABEL",
      ctaLabel: "Xem danh mục",
    },
  ],
};

const L2_5: Lesson = {
  id: "L2.5",
  moduleId: "M2",
  index: 5,
  titleVi: "Kiểm tra P&L",
  titleEn: "Checking your P&L",
  cards: [
    {
      type: "CONCEPT",
      heading: "P&L: Lãi/lỗ chưa thực hiện vs. đã thực hiện",
      body: "**P&L chưa thực hiện (Unrealized P&L):**\n= (Giá hiện tại − Giá mua TB) × Số cổ phiếu đang nắm\n→ Con số này thay đổi mỗi ngày theo giá thị trường\n→ Chưa phải tiền thật cho đến khi bạn bán\n\n**P&L đã thực hiện (Realized P&L):**\n= Tiền thu được khi bán − Tổng giá mua − Phí\n→ Con số cố định sau khi bán\n→ Đây là tiền lãi/lỗ thực sự của bạn\n\n**Nguyên tắc quan trọng:** Unrealized P&L +50% không có nghĩa là bạn đã thắng 50% — cho đến khi bán, bạn vẫn có thể mất tất cả.",
    },
    {
      type: "EXAMPLE",
      heading: "Mua 100 VNM tại 65,000, giá hiện tại 68,000",
      body: "**Unrealized P&L:**\n= (68,000 − 65,000) × 100\n= 3,000 × 100\n= **+300,000 VND** (+4.6%)\n\n**Nếu bán ngay:**\n- Doanh thu: 68,000 × 100 = 6,800,000 VND\n- Giá mua: 65,000 × 100 = 6,500,000 VND\n- Phí bán (0.25%): 17,000 VND\n- Thuế TNCN (0.1%): 6,800 VND\n- **Realized P&L: +276,200 VND** (thấp hơn unrealized do phí)\n\n**Lesson:** Luôn tính cả phí khi lập kế hoạch bán.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"P&L màu xanh = tôi đang thắng\"",
      body: "✅ **Sự thật:** P&L xanh là tốt, nhưng **không có nghĩa là bạn đã kiếm được tiền**.\n\nVí dụ: Bạn mua 10 cổ phiếu khác nhau. 8 cổ phiếu đang xanh (+2% mỗi cổ), 2 cổ phiếu đang đỏ (−15% mỗi cổ).\n\nTổng P&L = 8×2% − 2×15% = +16% − 30% = **−14%** (lỗ ròng!)\n\n**Bài học:** Nhìn vào **tổng P&L của toàn danh mục** — không phải từng cổ phiếu riêng lẻ.",
    },
    {
      type: "QUIZ",
      heading: "P&L chưa thực hiện (Unrealized P&L) là gì?",
      body: "",
      options: [
        { id: "A", text: "Tiền đã rút về tài khoản ngân hàng" },
        { id: "B", text: "Phí giao dịch đã trả" },
        { id: "C", text: "Số dư tiền mặt trong tài khoản" },
        { id: "D", text: "Lãi/lỗ trên vị thế đang nắm giữ (chưa bán)" },
      ],
      correctOption: "D",
      hint: "\"Chưa thực hiện\" = chưa bán = chưa chốt lời/lỗ. Giá trị thay đổi theo giá thị trường.",
    },
    {
      type: "CTA",
      heading: "Xem tab P&L của bạn",
      body: "Mở tab Danh mục → tab \"Lãi/Lỗ\". Xem P&L chưa thực hiện của tất cả vị thế. Tính tổng P&L của danh mục.",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem tab P&L",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULE 3 — Thinking in Portfolios
// ---------------------------------------------------------------------------

const L3_1: Lesson = {
  id: "L3.1",
  moduleId: "M3",
  index: 1,
  titleVi: "Đa dạng hóa cơ bản",
  titleEn: "Diversification Basics",
  cards: [
    {
      type: "CONCEPT",
      heading: "Đa dạng hóa: \"Đừng bỏ tất cả trứng vào một giỏ\"",
      body: "**Đa dạng hóa (Diversification)** = trải vốn đầu tư ra nhiều cổ phiếu, nhiều ngành để giảm rủi ro.\n\n**Tại sao cần đa dạng hóa?**\n- Khi một ngành chịu tác động xấu, cổ phiếu ngành khác vẫn ổn định\n- Rủi ro không hệ thống (unsystematic risk) có thể giảm bằng đa dạng hóa\n- Rủi ro hệ thống (khủng hoảng toàn thị trường) thì không thể tránh dù đa dạng hóa\n\n**Quy tắc thực hành:**\n- Tối thiểu 5–7 cổ phiếu từ ít nhất 3 ngành khác nhau\n- Không có cổ phiếu nào chiếm > 30% tổng danh mục\n- Tối đa 20 cổ phiếu — quá nhiều sẽ khó theo dõi hiệu quả",
    },
    {
      type: "EXAMPLE",
      heading: "Danh mục A vs. Danh mục B — ai đa dạng hóa tốt hơn?",
      body: "**Danh mục A:** VCB 40% + BID 30% + TCB 30% → 100% ngành Tài chính\n**Danh mục B:** VCB 20% + VNM 20% + FPT 20% + HPG 20% + VHM 20% → 5 ngành\n\nKhi SBV siết tín dụng Q1/2022:\n- Danh mục A: **−25%** (tất cả cùng giảm)\n- Danh mục B: **−8%** (VNM và FPT bù đắp)\n\nDanh mục A có 3 mã nhưng thực chất là **đặt cược vào 1 ngành**. Danh mục B mới là đa dạng hóa thực sự.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Cứ mua nhiều mã cổ phiếu là đã đa dạng hóa\"",
      body: "✅ **Sự thật:** 20 cổ phiếu ngân hàng không phải đa dạng hóa — đó là **tập trung theo ngành**. Khi chính sách tiền tệ thắt chặt, tất cả 20 mã đều giảm cùng nhau.\n\nĐa dạng hóa thực sự yêu cầu **tương quan thấp** giữa các vị thế — tức là các ngành phản ứng khác nhau với cùng một sự kiện kinh tế.",
    },
    {
      type: "QUIZ",
      heading: "Nhà đầu tư A có danh mục: VCB 40%, BID 35%, MBB 25%. Điểm yếu nghiêm trọng nhất là gì?",
      body: "",
      options: [
        { id: "A", text: "Quá ít cổ phiếu" },
        { id: "B", text: "Tập trung 100% vào ngành ngân hàng — không có đa dạng hóa ngành" },
        { id: "C", text: "Giá cổ phiếu ngân hàng quá cao" },
        { id: "D", text: "Không có cổ phiếu công nghệ" },
      ],
      correctOption: "B",
      hint: "Đa dạng hóa = khác NGÀNH, không chỉ khác mã. Cả 3 mã đều là ngân hàng.",
    },
    {
      type: "CTA",
      heading: "Xem phân bổ ngành của danh mục",
      body: "Vào Portfolio → Phân tích danh mục → Biểu đồ ngành. Xem danh mục giao dịch ảo đang tập trung vào ngành nào. Nếu > 50% trong một ngành, đây là tín hiệu cần đa dạng hóa.",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem phân tích danh mục",
    },
  ],
};

const L3_2: Lesson = {
  id: "L3.2",
  moduleId: "M3",
  index: 2,
  titleVi: "Các ngành tại Việt Nam",
  titleEn: "VN Sectors Crash Course",
  cards: [
    {
      type: "CONCEPT",
      heading: "11 ngành trên thị trường chứng khoán VN",
      body: "| # | Ngành | Ví dụ mã tiêu biểu |\n|---|-------|-------------------|\n| 1 | Tài chính | VCB, BID, TCB, MBB |\n| 2 | Bất động sản | VHM, VIC, NLG, DXG |\n| 3 | Tiêu dùng thiết yếu | VNM, MCH, MSN, SAB |\n| 4 | Công nghệ thông tin | FPT, CMG |\n| 5 | Năng lượng | GAS, POW, PVD |\n| 6 | Vật liệu cơ bản | HPG, HSG, NKG |\n| 7 | Công nghiệp | HVN, GMD, HAH |\n| 8 | Y tế | DHG, IMP, TNH |\n| 9 | Tiện ích | REE, BWE, PC1 |\n| 10 | Tiêu dùng tùy ý | MWG, PNJ, FRT |\n| 11 | Viễn thông | FPT Telecom |",
    },
    {
      type: "EXAMPLE",
      heading: "Luân chuyển ngành (Sector Rotation) — VN 2021–2023",
      body: "**2021:** Chứng khoán + BĐS bùng nổ (lãi suất thấp)\n→ SSI, VCI, VHM, NLG tăng 100–200%\n\n**2022:** SBV siết tín dụng BĐS → BĐS và Tài chính lao dốc\n→ VHM −45%, VCB −30%\n→ Trong khi đó: VNM (tiêu dùng) −12%; FPT (công nghệ) −18%\n\n**2023:** Chính phủ đẩy mạnh đầu tư công → Vật liệu hồi phục\n→ HPG +40%, HSG +55% từ đáy 2022\n\n**Bài học:** Đa dạng ngành giúp bạn luôn có phần \"thắng\" trong danh mục.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Chỉ cần mua ngân hàng vì ngân hàng VN luôn có lợi nhuận\"",
      body: "✅ **Sự thật:** Ngành ngân hàng VN chiếm ~30% vốn hóa HoSE và thường có lợi nhuận cao — nhưng cũng **nhạy cảm nhất với chính sách vĩ mô**. Một quyết định tăng lãi suất của SBV hay siết room tín dụng có thể khiến toàn ngành rơi 20–30% trong vài tuần.\n\nNgân hàng nên là **một phần** của danh mục đa dạng, không phải toàn bộ.",
    },
    {
      type: "QUIZ",
      heading: "Bạn muốn đầu tư vào cổ phiếu hưởng lợi trực tiếp từ tăng trưởng tiêu dùng nội địa. Ngành nào phù hợp nhất?",
      body: "",
      options: [
        { id: "A", text: "Năng lượng (GAS, POW)" },
        { id: "B", text: "Hàng tiêu dùng thiết yếu (VNM, MCH, MSN)" },
        { id: "C", text: "Tài chính (VCB, BID)" },
        { id: "D", text: "Vật liệu cơ bản (HPG, HSG)" },
      ],
      correctOption: "B",
      hint: "Hàng tiêu dùng thiết yếu = sản phẩm người dùng mua mỗi ngày. Khi thu nhập tăng → chi tiêu tăng → doanh thu tăng.",
    },
    {
      type: "CTA",
      heading: "Lọc theo ngành trong Discover",
      body: "Vào Discover → nhấn icon bộ lọc → Chọn ngành \"Hàng tiêu dùng thiết yếu\". Xem các cổ phiếu trong ngành. Thử lọc một ngành khác để so sánh.",
      ctaAction: "BROWSE_STOCK_LIST",
      ctaLabel: "Mở Discover",
    },
  ],
};

const L3_3: Lesson = {
  id: "L3.3",
  moduleId: "M3",
  index: 3,
  titleVi: "Danh sách theo dõi là gì?",
  titleEn: "What is a Watchlist?",
  cards: [
    {
      type: "CONCEPT",
      heading: "Watchlist — \"Phòng chờ\" trước khi đầu tư",
      body: "**Danh sách theo dõi (Watchlist)** = danh sách cổ phiếu bạn đang quan tâm nhưng chưa mua.\n\n**3 mục đích chính:**\n1. **Nghiên cứu:** Theo dõi biến động giá và tin tức trước khi ra quyết định\n2. **Chuẩn bị mua:** Khi giá đạt ngưỡng mong muốn → hành động ngay\n3. **So sánh:** Đặt nhiều cổ phiếu cùng ngành cạnh nhau để chọn mã tốt nhất\n\n**Thực hành tốt:**\n- Giữ watchlist 10–20 mã (không nhiều hơn — khó theo dõi hiệu quả)\n- Review mỗi cuối tuần: xóa mã không còn phù hợp, thêm mã mới\n- Đặt cảnh báo giá cho mã quan trọng nhất",
    },
    {
      type: "EXAMPLE",
      heading: "Nhà đầu tư dùng watchlist để mua đúng giá",
      body: "Cuối 2022, Minh theo dõi MWG (Mobile World Group):\n- Thêm MWG vào watchlist khi giá 45,000 VND\n- Nhận xét: \"Công ty bán lẻ tốt nhất VN nhưng đang bị bán quá mức\"\n- Đặt cảnh báo tại 25,000 VND\n- Tháng 3/2023: cảnh báo kích hoạt khi MWG về 23,000 → Minh nghiên cứu lại → mua 200 cổ phiếu\n- Tháng 9/2023: MWG phục hồi về 47,000 VND → Minh lãi ~100% trong 6 tháng\n\n**Không có watchlist:** Minh có thể đã bỏ qua cơ hội hoặc mua vội khi giá vẫn còn cao.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Theo dõi cổ phiếu mà không mua là lãng phí thời gian\"",
      body: "✅ **Sự thật:** Nhà đầu tư chuyên nghiệp theo dõi hàng chục cổ phiếu trong **nhiều tháng** trước khi mua. Watchlist là giai đoạn **nghiên cứu và kiên nhẫn** — hai yếu tố quan trọng nhất của đầu tư thành công.\n\nMua vội mà không có watchlist thường dẫn đến mua ở giá cao, không có luận điểm đầu tư rõ ràng — và bán hoảng loạn khi giá giảm.",
    },
    {
      type: "QUIZ",
      heading: "Mục đích chính của danh sách theo dõi (watchlist) là gì?",
      body: "",
      options: [
        { id: "A", text: "Tự động mua khi giá giảm" },
        { id: "B", text: "Cho app biết cổ phiếu bạn thích" },
        { id: "C", text: "Theo dõi biến động giá và chuẩn bị cho quyết định mua" },
        { id: "D", text: "Nhận cổ tức từ cổ phiếu đang theo dõi" },
      ],
      correctOption: "C",
      hint: "Watchlist = phòng chờ. Bạn quan sát nhưng chưa cam kết.",
    },
    {
      type: "CTA",
      heading: "Xây watchlist đầu tiên — 5 cổ phiếu đa ngành",
      body: "Thêm 5 cổ phiếu đa dạng vào watchlist: **VHM** (BĐS), **VIC** (Tập đoàn đa ngành), **VNM** (Tiêu dùng), **FPT** (Công nghệ), **HPG** (Vật liệu). Đây là bước đầu tiên xây dựng danh mục nghiên cứu có kỷ luật.",
      ctaAction: "BROWSE_STOCK_LIST",
      ctaLabel: "Mở danh sách cổ phiếu",
    },
  ],
};

const L3_4: Lesson = {
  id: "L3.4",
  moduleId: "M3",
  index: 4,
  titleVi: "Đặt cảnh báo giá",
  titleEn: "Setting a Price Alert",
  cards: [
    {
      type: "CONCEPT",
      heading: "Cảnh báo giá — \"Trợ lý theo dõi thị trường 24/7\"",
      body: "**Cảnh báo giá (Price Alert)** = thông báo push khi cổ phiếu đạt ngưỡng giá bạn đặt.\n\n**2 loại cảnh báo:**\n\n| Loại | Khi nào kích hoạt | Dùng để làm gì |\n|------|------------------|----------------|\n| **Cảnh báo trên** | Giá ≥ mức đặt | Chốt lời, bán tại kháng cự |\n| **Cảnh báo dưới** | Giá ≤ mức đặt | Mua thêm, cắt lỗ, mua tại hỗ trợ |\n\n**3 use case thực tế:**\n1. **Buy alert:** \"Thông báo khi HPG về 30,000\" → cơ hội mua rẻ\n2. **Take-profit alert:** \"Thông báo khi VNM lên 90,000\" → chốt lời\n3. **Stop-loss alert:** \"Thông báo khi VIC xuống 45,000\" → xem xét cắt lỗ\n\n⚠️ **Quan trọng:** Cảnh báo chỉ THÔNG BÁO — không tự đặt lệnh.",
    },
    {
      type: "EXAMPLE",
      heading: "Chiến lược cảnh báo có hệ thống cho HPG",
      body: "HPG hiện ở 35,000 VND:\n- Vùng kháng cự: 40,000 VND (giá thường bị bán ra tại đây)\n- Vùng hỗ trợ: 30,000 VND (giá thường có người mua vào)\n\n**Chiến lược cảnh báo:**\n- ✅ Cảnh báo dưới tại 30,500 VND: \"Giá tiếp cận vùng hỗ trợ — cơ hội mua tốt\"\n- ✅ Cảnh báo trên tại 39,500 VND: \"Giá tiếp cận vùng kháng cự — cân nhắc chốt lời\"\n\n**Kết quả:** Không cần nhìn màn hình mỗi giờ. Cảnh báo thông báo đúng lúc cần hành động.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Đặt cảnh báo giá = tự động mua/bán\"",
      body: "✅ **Sự thật:** Cảnh báo giá chỉ gửi **thông báo**. Bạn phải mở app, xem xét tình hình, và đặt lệnh thủ công. Đây là thiết kế có chủ ý: để bảo vệ bạn khỏi các tín hiệu sai và đảm bảo quyết định đầu tư luôn có con người kiểm soát.\n\nAuto-trading (giao dịch tự động) là tính năng hoàn toàn khác, đòi hỏi kiến thức nâng cao và rủi ro cao hơn nhiều.",
    },
    {
      type: "QUIZ",
      heading: "Bạn mua VNM tại 82,000 và muốn được thông báo để chốt lời khi giá đạt 90,000. Loại cảnh báo nào cần đặt?",
      body: "",
      options: [
        { id: "A", text: "Cảnh báo khi giá xuống dưới 90,000" },
        { id: "B", text: "Cảnh báo khi giá lên trên 90,000" },
        { id: "C", text: "Cảnh báo khi giá bằng đúng 90,000" },
        { id: "D", text: "Không cần cảnh báo, tự theo dõi" },
      ],
      correctOption: "B",
      hint: "Chốt lời = bán khi giá ĐẠT MỨC CAO. Dùng cảnh báo TRÊN.",
    },
    {
      type: "CTA",
      heading: "Đặt cảnh báo giá đầu tiên",
      body: "Chọn cổ phiếu đầu tiên trong watchlist vừa tạo. Đặt một cảnh báo phía trên (giá tham chiếu + 5%) và một cảnh báo phía dưới (giá tham chiếu − 5%). Đây là bộ cảnh báo hai chiều cơ bản cho mọi vị thế.",
      ctaAction: "OPEN_PRICE_BOARD",
      ctaLabel: "Mở bảng giá",
    },
  ],
};

const L3_5: Lesson = {
  id: "L3.5",
  moduleId: "M3",
  index: 5,
  titleVi: "Kiểm tra sức khỏe danh mục",
  titleEn: "Portfolio Health Check",
  cards: [
    {
      type: "CONCEPT",
      heading: "Điểm sức khỏe danh mục — AI đánh giá rủi ro",
      body: "Điểm sức khỏe (0–100) được AI tính dựa trên 4 yếu tố:\n\n| Yếu tố | Trọng số | Đánh giá gì |\n|--------|---------|-------------|\n| Đa dạng hóa ngành | 35% | Số ngành; cổ phiếu tập trung nhất < 30%? |\n| Thanh khoản | 25% | KLGD trung bình ngày của các cổ phiếu nắm giữ |\n| Biến động | 25% | Độ lệch chuẩn giá lịch sử của danh mục |\n| Hành vi giao dịch | 15% | Tần suất FOMO, bán hoảng loạn, giao dịch quá mức |\n\n**Thang điểm:**\n- 75–100: 🟢 Tốt — danh mục được quản lý rủi ro tốt\n- 50–74: 🟡 Cần chú ý — có một số điểm yếu\n- 0–49: 🔴 Rủi ro cao — cần xem xét tái cơ cấu",
    },
    {
      type: "EXAMPLE",
      heading: "So sánh 2 danh mục — điểm sức khỏe khác nhau như thế nào?",
      body: "**Danh mục Tập trung** (VCB 50% + BID 30% + TCB 20%):\n- Đa dạng hóa: 10/35 (100% ngành Tài chính)\n- Thanh khoản: 25/25 (blue-chip)\n- Biến động: 15/25\n- Hành vi: 12/15\n- **Tổng: 62/100** 🟡\n\n**Danh mục Cân bằng** (VCB 20% + VNM 20% + FPT 20% + HPG 20% + VHM 20%):\n- Đa dạng hóa: 32/35 (5 ngành khác nhau)\n- Thanh khoản: 24/25\n- Biến động: 20/25 (đa dạng giúp giảm biến động)\n- Hành vi: 13/15\n- **Tổng: 89/100** 🟢",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Điểm sức khỏe cao nghĩa là danh mục lời nhiều\"",
      body: "✅ **Sự thật:** Điểm sức khỏe đo lường **quản lý rủi ro**, không phải lợi nhuận. Một danh mục tập trung có thể lời 50% trong bull market, nhưng cũng có thể lỗ 50% trong bear market.\n\nDanh mục sức khỏe tốt thường cho **lợi nhuận điều chỉnh theo rủi ro** tốt hơn về dài hạn — nghĩa là lợi nhuận ổn định hơn, biến động ít hơn.",
    },
    {
      type: "QUIZ",
      heading: "Điểm sức khỏe danh mục chủ yếu đo lường điều gì?",
      body: "",
      options: [
        { id: "A", text: "Mức lợi nhuận kỳ vọng" },
        { id: "B", text: "Chất lượng quản lý rủi ro và đa dạng hóa" },
        { id: "C", text: "Số lượng giao dịch thực hiện" },
        { id: "D", text: "Tổng giá trị tài khoản" },
      ],
      correctOption: "B",
      hint: "Health = khả năng chịu đựng biến động, không phải lợi nhuận.",
    },
    {
      type: "CTA",
      heading: "Xem AI Insights — điểm sức khỏe danh mục",
      body: "Mở AI Insights → Portfolio Health. Đọc điểm tổng và từng yếu tố thành phần. Nếu có cờ cảnh báo (ví dụ \"Tập trung ngành cao\"), nhấn vào để đọc lời khuyên cụ thể từ AI.",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem danh mục",
    },
  ],
};

// ---------------------------------------------------------------------------
// MODULE 4 — Trader Psychology
// ---------------------------------------------------------------------------

const L4_1: Lesson = {
  id: "L4.1",
  moduleId: "M4",
  index: 1,
  titleVi: "FOMO là gì?",
  titleEn: "What is FOMO?",
  cards: [
    {
      type: "CONCEPT",
      heading: "FOMO — Kẻ thù thầm lặng của nhà đầu tư",
      body: "**FOMO = Fear Of Missing Out** (Sợ bỏ lỡ cơ hội)\n\nKhi một cổ phiếu tăng mạnh và mọi người đều nói về nó → bạn cảm thấy phải mua ngay kẻo \"trễ tàu\". Đây là FOMO.\n\n**4 dấu hiệu nhận biết lệnh FOMO:**\n1. Cổ phiếu đã tăng **>15%** trước khi bạn mua\n2. Bạn mua trong vòng **30 phút** sau khi thấy tin tức/mạng xã hội\n3. **Chưa nghiên cứu** cơ bản công ty\n4. Đặt lệnh **lớn hơn bình thường** vì sợ bỏ lỡ\n\n**Tâm lý đằng sau:** Social proof (mọi người mua → mình phải mua) + Loss aversion (sợ lỗ vì không mua) = quyết định cảm xúc.",
    },
    {
      type: "EXAMPLE",
      heading: "VHM 2021: FOMO và hậu quả",
      body: "Tháng 6/2021: VHM (Vinhomes) tăng từ 85,000 → 115,000 VND trong 3 tuần (+35%).\n- Mạng xã hội đầy tin \"VHM đang sóng mạnh, mua ngay kẻo muộn\"\n- Nhà đầu tư FOMO mua vào ở mức 110,000–115,000 (gần đỉnh)\n\nKết quả sau 6 tuần: VHM điều chỉnh về 85,000 VND (−22% từ đỉnh).\n\n**Nhà đầu tư FOMO mua ở 115,000:** lỗ −22% sau 6 tuần.\n\n**Nhà đầu tư mua có kế hoạch từ 85,000–90,000:** đã lãi 20–30% trước khi sóng FOMO xảy ra, có thể chốt lời thoải mái.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Cổ phiếu đã tăng 30% thì sẽ còn tăng nữa\"",
      body: "✅ **Sự thật:** Cổ phiếu đã tăng mạnh thường **thu hút người bán chốt lời nhiều hơn người mua mới**. Sau một đợt tăng lớn, xác suất điều chỉnh cao hơn xác suất tiếp tục tăng trong ngắn hạn.\n\nCác nhà đầu tư chuyên nghiệp **mua khi không ai quan tâm** và **bán khi mọi người FOMO mua vào**. FOMO của bạn chính là lúc họ đang chốt lời.",
    },
    {
      type: "QUIZ",
      heading: "Dấu hiệu nào thể hiện FOMO rõ nhất?",
      body: "",
      options: [
        { id: "A", text: "Mua sau khi nghiên cứu kỹ 2 tuần" },
        { id: "B", text: "Mua cổ phiếu đã tăng 40% chỉ vì thấy mọi người đang mua" },
        { id: "C", text: "Đặt cảnh báo giá trước khi quyết định" },
        { id: "D", text: "Mua theo cổ tức cao và P/E thấp" },
      ],
      correctOption: "B",
      hint: "FOMO = hành động vì SỢ BỎ LỠ, không phải vì phân tích. Câu nào mô tả quyết định cảm xúc?",
    },
    {
      type: "CTA",
      heading: "Xem lịch sử lệnh và phát hiện mẫu FOMO",
      body: "Vào Portfolio → Lịch sử giao dịch. AI sẽ đánh dấu các lệnh đặt trong vòng 30 phút sau khi cổ phiếu tăng >10% (mẫu FOMO tiềm năng). Xem xét các lệnh này: kết quả ra sao so với lệnh không có đặc điểm FOMO?",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem lịch sử giao dịch",
    },
  ],
};

const L4_2: Lesson = {
  id: "L4.2",
  moduleId: "M4",
  index: 2,
  titleVi: "Mô hình bán hoảng loạn",
  titleEn: "The Panic Sell Pattern",
  cards: [
    {
      type: "CONCEPT",
      heading: "Bán hoảng loạn — Khoá lỗ tạm thời thành lỗ vĩnh viễn",
      body: "**Bán hoảng loạn (Panic sell)** = bán ra khi giá giảm nhanh vì sợ hãi — không phải vì cơ bản doanh nghiệp thay đổi.\n\n**Quy trình điển hình:**\n1. Cổ phiếu giảm 5–8% trong một phiên\n2. Nhà đầu tư lo sợ mất thêm → bán ngay\n3. Cổ phiếu hồi phục 3–5 ngày sau\n4. Nhà đầu tư nhận ra đã bán đúng đáy → mua lại giá cao hơn\n\n**Khi nào NÊN bán:** Cơ bản doanh nghiệp xấu đi; đạt mức cắt lỗ đã định (−8%); cần tiền.\n\n**Khi nào KHÔNG nên bán:** Chỉ vì giá giảm mạnh trong ngày mà không có lý do cơ bản.",
    },
    {
      type: "EXAMPLE",
      heading: "Tháng 3/2020: Ai bán hoảng loạn, ai kiên nhẫn?",
      body: "VN-Index rơi từ 950 → 660 điểm trong 3 tuần (−30%). HPG giảm từ 22,000 → 15,000 VND.\n\n**Nhà đầu tư A (bán hoảng loạn):**\n- Bán HPG ở 15,500 VND (gần đáy), lỗ −30%\n- Tháng 12/2020: HPG đạt 38,000 VND\n- Chi phí của bán hoảng loạn: bỏ lỡ +145% từ đáy\n\n**Nhà đầu tư B (kiên nhẫn):**\n- Tự hỏi: \"Hòa Phát có còn sản xuất thép không? Có.\" → Giữ nguyên\n- Tháng 12/2020: lãi +73% tính từ giá mua ban đầu 22,000 VND\n\n**Khác biệt duy nhất:** Phản ứng với biến động ngắn hạn.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Bán khi thị trường giảm là khôn ngoan để bảo toàn vốn\"",
      body: "✅ **Sự thật:** Nếu bạn bán vì **cơ bản doanh nghiệp thay đổi** → đó là quyết định thông minh. Nếu bạn bán vì **giá giảm nhanh và bạn hoảng sợ** → đó là bán hoảng loạn.\n\nCách kiểm tra: Trước khi bán, trả lời câu hỏi: *\"Có điều gì thay đổi về kinh doanh của công ty này không?\"* Nếu không → chờ, đừng bán vì sợ hãi.",
    },
    {
      type: "QUIZ",
      heading: "HPG giảm 6% trong buổi sáng do lo ngại lãi suất vĩ mô. Không có tin xấu về kinh doanh của HPG. Hành động nào ĐÚNG nhất?",
      body: "",
      options: [
        { id: "A", text: "Bán ngay để tránh lỗ thêm" },
        { id: "B", text: "Mua thêm ngay lập tức" },
        { id: "C", text: "Xem lại luận điểm đầu tư ban đầu; giữ nếu cơ bản không đổi" },
        { id: "D", text: "Đợi giá về giá mua để hòa vốn rồi mới bán" },
      ],
      correctOption: "C",
      hint: "Bán nên dựa trên CƠ BẢN DOANH NGHIỆP, không phải biến động giá ngắn hạn.",
    },
    {
      type: "CTA",
      heading: "Xem AI phát hiện mẫu hành vi",
      body: "Vào AI Insights → Behavioral Flags. Xem danh sách các giao dịch được đánh dấu là có dấu hiệu bán hoảng loạn (bán trong vòng 15 phút sau khi giá giảm >3% từ đỉnh 1 giờ). Nhìn lại các lệnh đó: cổ phiếu có phục hồi sau đó không?",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem lịch sử giao dịch",
    },
  ],
};

const L4_3: Lesson = {
  id: "L4.3",
  moduleId: "M4",
  index: 3,
  titleVi: "Giao dịch quá mức",
  titleEn: "Overtrading Explained",
  cards: [
    {
      type: "CONCEPT",
      heading: "Chi phí ẩn của giao dịch quá nhiều",
      body: "**Phí giao dịch tại VN (điển hình):** 0.1% – 0.35% giá trị lệnh. Một round-trip (mua + bán) = 0.2% – 0.7% phí tổng.\n\n**Tác động cộng dồn:**\n\n| Round-trips/tuần | Phí/tuần | Phí/năm |\n|-----------------|---------|--------|\n| 1 | 0.5% | ~26% |\n| 3 | 1.5% | ~78% |\n| 10 | 5.0% | ~260% |\n\nNếu giao dịch 10 lần/tuần với phí 0.5%/round-trip, bạn cần kiếm ít nhất **5%/tuần chỉ để hòa vốn sau phí**.\n\n**Dấu hiệu giao dịch quá mức:**\n- Xem màn hình giá >5 lần/ngày\n- Mua rồi bán cùng 1 mã trong 1 tuần\n- P&L biến động nhưng không tăng theo thời gian",
    },
    {
      type: "EXAMPLE",
      heading: "Trader A vs. Trader B — cùng thị trường, khác kết quả",
      body: "**Trader A (giao dịch nhiều):**\n- 10 round-trips/tuần, mỗi lần +0.5% trước phí\n- Phí/round-trip: 0.5%\n- Net/round-trip: 0.5% − 0.5% = **0%**\n- Kết quả sau 1 năm: ~0% (trước khi tính lần lỗ)\n\n**Trader B (kiên nhẫn):**\n- 1–2 round-trips/tháng, mỗi lần nhắm +5–10%\n- Phí/round-trip: 0.5% (không đáng kể so với target)\n- Net/round-trip: ~4.5–9.5%\n- Kết quả sau 1 năm: tiềm năng +60–100%\n\n**Lợi thế của nhà đầu tư cá nhân:** Không bị áp lực giao dịch. Hãy dùng lợi thế này — **chờ cơ hội thực sự**.",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Giao dịch nhiều hơn = nhiều cơ hội kiếm tiền hơn\"",
      body: "✅ **Sự thật:** Với nhà đầu tư cá nhân, **nhiều giao dịch hơn = nhiều phí hơn = ít lợi nhuận hơn**. Các quỹ HFT (High-Frequency Trading) giao dịch hàng triệu lần/ngày vì họ có phí gần 0 và thuật toán tinh vi. Bạn không thể cạnh tranh với họ về tốc độ — hãy cạnh tranh bằng **kiên nhẫn và nghiên cứu**.",
    },
    {
      type: "QUIZ",
      heading: "Phí giao dịch mỗi lệnh là 0.25%. Bạn mua rồi bán VNM (2 lệnh). Tổng phí là bao nhiêu?",
      body: "",
      options: [
        { id: "A", text: "0.25%" },
        { id: "B", text: "0.5%" },
        { id: "C", text: "0.1%" },
        { id: "D", text: "1.0%" },
      ],
      correctOption: "B",
      hint: "Mỗi lệnh (mua hoặc bán) tính phí riêng. Mua (0.25%) + Bán (0.25%) = ?",
    },
    {
      type: "CTA",
      heading: "Xem tổng phí đã trả trong lịch sử giao dịch",
      body: "Vào Portfolio → P&L → Dòng phí giao dịch. Xem tổng phí tích lũy từ khi bắt đầu. So sánh với tổng P&L đã thực hiện: phí chiếm bao nhiêu % lợi nhuận của bạn?",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem tab P&L",
    },
  ],
};

const L4_4: Lesson = {
  id: "L4.4",
  moduleId: "M4",
  index: 4,
  titleVi: "Tỷ lệ thắng vs. Hệ số lợi nhuận",
  titleEn: "Win Rate vs. Profit Factor",
  cards: [
    {
      type: "CONCEPT",
      heading: "Tại sao tỷ lệ thắng một mình không có nghĩa gì",
      body: "**Tỷ lệ thắng (Win Rate):** % số lần giao dịch có lãi.\n> Ví dụ: 6 lãi / 10 giao dịch = **60% win rate**\n\n**Hệ số lợi nhuận (Profit Factor):** Tổng lãi ÷ Tổng lỗ.\n> Ví dụ: 6,000,000 VND lãi ÷ 3,000,000 VND lỗ = **Profit Factor 2.0**\n\n**Kích thước thắng/thua quan trọng hơn win rate:**\n\n| Nhà đầu tư | Win rate | Mỗi lần thắng | Mỗi lần thua | Net/10 giao dịch |\n|-----------|---------|--------------|--------------|------------------|\n| X | 70% | +100,000 | −400,000 | 7×100K − 3×400K = **−500,000** 🔴 |\n| Y | 40% | +500,000 | −100,000 | 4×500K − 6×100K = **+1,400,000** 🟢 |",
    },
    {
      type: "EXAMPLE",
      heading: "Tỷ lệ thắng 30% nhưng vẫn có lãi — có thể không?",
      body: "**Nhà đầu tư chuyên nghiệp với 30% win rate:**\n- 3 lần thắng × +20% mỗi lần = +60%\n- 7 lần thua × −3% mỗi lần = −21%\n- **Net: +39%** cho 10 giao dịch ✅\n\nChìa khóa: Cắt lỗ nhỏ (−3%), để lãi chạy dài (+20%). Đây là kỷ luật \"cut losses, let winners run.\"\n\n**Nhà đầu tư mới điển hình — 60% win rate nhưng thua lỗ:**\n- 6 lần thắng × +2% = +12%\n- 4 lần thua × −10% = −40% (không chịu cắt lỗ, giữ mãi)\n- **Net: −28%** ❌",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Tỷ lệ thắng cao là bí quyết thành công trong đầu tư\"",
      body: "✅ **Sự thật:** Nhiều nhà đầu tư cố gắng tối đa hóa tỷ lệ thắng bằng cách **không chịu cắt lỗ** (để tránh \"hiện thực hóa thua\"). Kết quả: hàng chục lệnh thắng nhỏ và vài lệnh thua rất lớn — tổng âm.\n\n**Bí quyết thực sự:** Tỷ lệ Lãi/Lỗ (Risk-Reward Ratio) > 2:1. Tức là mỗi lần thắng kiếm ít nhất gấp đôi mỗi lần thua.",
    },
    {
      type: "QUIZ",
      heading: "Nhà đầu tư X: 60% tỷ lệ thắng. Mỗi lần thắng +100,000 VND. Mỗi lần thua −300,000 VND. Sau 10 giao dịch, kết quả là?",
      body: "",
      options: [
        { id: "A", text: "Lãi 240,000 VND" },
        { id: "B", text: "Hòa vốn" },
        { id: "C", text: "Lỗ 600,000 VND" },
        { id: "D", text: "Lãi 600,000 VND" },
      ],
      correctOption: "C",
      hint: "Tính: (6 × 100,000) − (4 × 300,000) = 600,000 − 1,200,000 = ?",
    },
    {
      type: "CTA",
      heading: "Xem P&L thực hiện theo lệnh",
      body: "Vào Portfolio → Lịch sử giao dịch đã đóng. Tính tay hoặc xem AI: tỷ lệ thắng của bạn là bao nhiêu %? Trung bình mỗi lần thắng là bao nhiêu VND? Mỗi lần thua? Profit Factor của bạn hiện tại > 1 không?",
      ctaAction: "OPEN_PNL_TAB",
      ctaLabel: "Xem lịch sử P&L",
    },
  ],
};

const L4_5: Lesson = {
  id: "L4.5",
  moduleId: "M4",
  index: 5,
  titleVi: "Xây dựng quy tắc giao dịch",
  titleEn: "Building Your Trading Rules",
  cards: [
    {
      type: "CONCEPT",
      heading: "Quy tắc giao dịch — Loại bỏ cảm xúc khỏi quyết định",
      body: "Quy tắc giao dịch là tập hợp các cam kết **được viết ra trước** để không bị cảm xúc chi phối khi thị trường biến động mạnh.\n\n**5 quy tắc nền tảng cho F0 trader:**\n\n| # | Quy tắc | Lý do |\n|---|---------|-------|\n| 1 | Không có cổ phiếu nào > 25% tổng danh mục | Giới hạn tổn thất nếu một mã sụp đổ |\n| 2 | Cắt lỗ tối đa −8% từ giá mua | Ngăn lỗ nhỏ thành lỗ lớn |\n| 3 | Không mua cổ phiếu đã tăng >15% mà không nghiên cứu trước | Chống FOMO |\n| 4 | Tối đa 3 giao dịch mới mỗi tuần | Chống overtrading |\n| 5 | Đợi 24 giờ trước khi bán khi thị trường điều chỉnh mạnh | Chống bán hoảng loạn |",
    },
    {
      type: "EXAMPLE",
      heading: "\"Sổ quy tắc\" của một nhà đầu tư F0 sau Module 4",
      body: "*Quy tắc giao dịch của tôi:*\n\n1. \"Tôi không bao giờ đặt hơn 20% danh mục vào một mã duy nhất.\"\n2. \"Khi bất kỳ cổ phiếu nào lỗ −8% từ giá mua, tôi bán ra và xem xét lại luận điểm trước khi mua lại.\"\n3. \"Trước khi mua, tôi phải có thể giải thích tại sao tôi mua trong 2 câu đơn giản.\"\n4. \"Khi thị trường giảm >3% trong ngày, tôi không đặt lệnh bán ngay — chờ ít nhất 24 giờ.\"\n5. \"Tôi review danh mục mỗi Chủ nhật, không phải mỗi giờ.\"",
    },
    {
      type: "MYTH_BUSTER",
      heading: "❌ \"Quy tắc cứng nhắc, thực tế phải linh hoạt\"",
      body: "✅ **Sự thật:** \"Linh hoạt\" không có quy tắc = quyết định theo cảm xúc. Các nhà đầu tư huyền thoại (Warren Buffett, Ray Dalio, Peter Lynch) đều có **hệ thống quy tắc nghiêm ngặt**. Buffett: \"Quy tắc 1: Đừng mất tiền. Quy tắc 2: Đừng quên Quy tắc 1.\"\n\nLinh hoạt **trong khung quy tắc** là kỹ năng. Linh hoạt **để phá vỡ quy tắc khi cần nhất** là tự sabotage.",
    },
    {
      type: "QUIZ",
      heading: "Bạn đặt quy tắc cắt lỗ −8%. VNM đang lỗ −9% sau 5 ngày. Không có tin xấu về công ty. Hành động nào ĐÚNG với kỷ luật giao dịch?",
      body: "",
      options: [
        { id: "A", text: "Giữ thêm vì VNM là công ty tốt" },
        { id: "B", text: "Mua thêm để hạ giá vốn" },
        { id: "C", text: "Tuân thủ quy tắc: bán và xem xét lại luận điểm trước khi mua lại" },
        { id: "D", text: "Đợi hồi phục về giá mua rồi mới bán" },
      ],
      correctOption: "C",
      hint: "Quy tắc đặt ra để THỰC HIỆN khi khó nhất. Nếu chỉ tuân thủ khi dễ thì không cần quy tắc.",
    },
    {
      type: "CTA",
      heading: "Chia sẻ 3 quy tắc giao dịch của bạn với cộng đồng",
      body: "Mở trình soạn thảo bài đăng cộng đồng. Template đã được điền sẵn:\n\n*\"3 quy tắc giao dịch của tôi:*\n*1. ___*\n*2. ___*\n*3. ___\"*\n\nĐiền vào 3 quy tắc cá nhân của bạn. Đăng lên cộng đồng để giữ mình có trách nhiệm — và truyền cảm hứng cho F0 trader khác.",
      ctaAction: "BROWSE_STOCK_LIST",
      ctaLabel: "Chia sẻ quy tắc",
    },
  ],
};

// ---------------------------------------------------------------------------
// Module registry
// ---------------------------------------------------------------------------

export const MODULES: readonly LearningModule[] = [
  {
    id: "M1",
    titleVi: "Thị trường Cổ phiếu VN",
    titleEn: "The VN Stock Market",
    description: "Hiểu cổ phiếu là gì, sàn giao dịch HoSE & HNX, bảng giá và biên độ dao động.",
    lessons: [L1_1, L1_2, L1_3, L1_4, L1_5],
    lessonXP: 125,
    bonusXP: 0,
    badgeName: "Market Foundations",
    badgeRarity: "COMMON",
    prerequisites: [],
  },
  {
    id: "M2",
    titleVi: "Lệnh Giao dịch Đầu tiên",
    titleEn: "Your First Trade",
    description: "Học cách đặt lệnh mua/bán, lô giao dịch, T+2 settlement và đọc P&L.",
    lessons: [L2_1, L2_2, L2_3, L2_4, L2_5],
    lessonXP: 125,
    bonusXP: 0,
    badgeName: "First Trader",
    badgeRarity: "COMMON",
    prerequisites: ["M1"],
    prerequisiteHint: "Hoàn thành Module 1 để mở khóa",
  },
  {
    id: "M3",
    titleVi: "Tư duy Danh mục",
    titleEn: "Thinking in Portfolios",
    description: "Đa dạng hóa, ngành kinh tế VN, watchlist và sức khỏe danh mục AI.",
    lessons: [L3_1, L3_2, L3_3, L3_4, L3_5],
    lessonXP: 125,
    bonusXP: 25,
    badgeName: "Portfolio Thinker",
    badgeRarity: "UNCOMMON",
    prerequisites: ["M2"],
    prerequisiteHint: "Hoàn thành Module 2 và đặt ≥3 lệnh để mở khóa",
  },
  {
    id: "M4",
    titleVi: "Tâm lý Giao dịch",
    titleEn: "Trader Psychology",
    description: "FOMO, bán hoảng loạn, overtrading và xây dựng quy tắc giao dịch cá nhân.",
    lessons: [L4_1, L4_2, L4_3, L4_4, L4_5],
    lessonXP: 125,
    bonusXP: 75,
    badgeName: "Market Scholar",
    badgeRarity: "COMMON",
    prerequisites: ["M3"],
    prerequisiteHint: "Hoàn thành Module 3 và giao dịch ≥5 ngày khác nhau để mở khóa",
  },
] as const;

/** All lessons flat — for O(1) lookup by id */
export const LESSONS_BY_ID: Readonly<Record<string, Lesson>> = Object.fromEntries(
  MODULES.flatMap((m) => m.lessons).map((l) => [l.id, l]),
);

/** Module by id */
export const MODULES_BY_ID: Readonly<Record<string, LearningModule>> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
);
