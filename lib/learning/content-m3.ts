// F0 Learning Path — Module 3: Thinking in Portfolios
// Lessons: L3.1 – L3.5
import type { Lesson } from "./types";

export const L3_1: Lesson = {
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

export const L3_2: Lesson = {
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

export const L3_3: Lesson = {
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

export const L3_4: Lesson = {
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

export const L3_5: Lesson = {
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
