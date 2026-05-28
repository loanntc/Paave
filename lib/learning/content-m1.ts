// Module 1 — The VN Stock Market (Thị trường Cổ phiếu VN)
// 5 lessons covering: what a stock is, HoSE/HNX mechanics, price boards, price drivers, price bands.
// Source: docs/business/FRD/module-f0-learning-content.md

import type { Lesson } from "./types";

export const L1_1: Lesson = {
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

export const L1_2: Lesson = {
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

export const L1_3: Lesson = {
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

export const L1_4: Lesson = {
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

export const L1_5: Lesson = {
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
