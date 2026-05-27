// ---------------------------------------------------------------------------
// F0 Learning Path — Complete Content Library
// Source: docs/business/FRD/module-f0-learning-content.md
// Modules M1 (full), M2–M4 (full content per FRD)
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
// MODULE 3 — Thinking in Portfolios (abbreviated — full content pending)
// ---------------------------------------------------------------------------

const L3_PLACEHOLDER = (id: string, index: number, titleVi: string, titleEn: string): Lesson => ({
  id,
  moduleId: "M3",
  index,
  titleVi,
  titleEn,
  cards: [
    { type: "CONCEPT", heading: titleVi, body: "Nội dung đang được cập nhật. Vui lòng quay lại sau." },
    { type: "EXAMPLE", heading: "Ví dụ thực tế", body: "Ví dụ từ thị trường VN sẽ được cập nhật." },
    { type: "MYTH_BUSTER", heading: "Sự thật vs. Lầm tưởng", body: "Phân tích quan niệm sai lầm phổ biến sẽ được cập nhật." },
    {
      type: "QUIZ", heading: "Câu hỏi kiểm tra", body: "",
      options: [
        { id: "A", text: "Đáp án A" }, { id: "B", text: "Đáp án B" },
        { id: "C", text: "Đáp án C" }, { id: "D", text: "Đáp án D" },
      ],
      correctOption: "A",
      hint: "Đọc lại thẻ Concept để tìm câu trả lời.",
    },
    { type: "CTA", heading: "Thực hành", body: "Áp dụng kiến thức vừa học vào paper trading.", ctaAction: "BROWSE_STOCK_LIST", ctaLabel: "Mở danh sách cổ phiếu" },
  ],
});

// ---------------------------------------------------------------------------
// MODULE 4 — Trader Psychology (abbreviated)
// ---------------------------------------------------------------------------

const L4_PLACEHOLDER = (id: string, index: number, titleVi: string, titleEn: string): Lesson => ({
  id,
  moduleId: "M4",
  index,
  titleVi,
  titleEn,
  cards: [
    { type: "CONCEPT", heading: titleVi, body: "Nội dung đang được cập nhật. Vui lòng quay lại sau." },
    { type: "EXAMPLE", heading: "Ví dụ thực tế", body: "Ví dụ từ thị trường VN sẽ được cập nhật." },
    { type: "MYTH_BUSTER", heading: "Sự thật vs. Lầm tưởng", body: "Phân tích quan niệm sai lầm phổ biến sẽ được cập nhật." },
    {
      type: "QUIZ", heading: "Câu hỏi kiểm tra", body: "",
      options: [
        { id: "A", text: "Đáp án A" }, { id: "B", text: "Đáp án B" },
        { id: "C", text: "Đáp án C" }, { id: "D", text: "Đáp án D" },
      ],
      correctOption: "A",
      hint: "Đọc lại thẻ Concept để tìm câu trả lời.",
    },
    { type: "CTA", heading: "Thực hành", body: "Áp dụng kiến thức vào danh mục của bạn.", ctaAction: "BROWSE_STOCK_LIST", ctaLabel: "Mở danh sách cổ phiếu" },
  ],
});

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
    lessons: [
      L3_PLACEHOLDER("L3.1", 1, "Đa dạng hóa cơ bản", "Diversification Basics"),
      L3_PLACEHOLDER("L3.2", 2, "Các ngành tại Việt Nam", "VN Sectors Crash Course"),
      L3_PLACEHOLDER("L3.3", 3, "Danh sách theo dõi là gì?", "What is a Watchlist?"),
      L3_PLACEHOLDER("L3.4", 4, "Đặt cảnh báo giá", "Setting a Price Alert"),
      L3_PLACEHOLDER("L3.5", 5, "Kiểm tra sức khỏe danh mục", "Portfolio Health Check"),
    ],
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
    lessons: [
      L4_PLACEHOLDER("L4.1", 1, "FOMO là gì?", "What is FOMO?"),
      L4_PLACEHOLDER("L4.2", 2, "Mô hình bán hoảng loạn", "The Panic Sell Pattern"),
      L4_PLACEHOLDER("L4.3", 3, "Giao dịch quá mức", "Overtrading Explained"),
      L4_PLACEHOLDER("L4.4", 4, "Tỷ lệ thắng vs. Hệ số lợi nhuận", "Win Rate vs. Profit Factor"),
      L4_PLACEHOLDER("L4.5", 5, "Xây dựng quy tắc giao dịch", "Building Your Trading Rules"),
    ],
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
