// F0 Learning Path — Module 2: Your First Trade
// Lessons: L2.1 – L2.5
import type { Lesson } from "./types";

export const L2_1: Lesson = {
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

export const L2_2: Lesson = {
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

export const L2_3: Lesson = {
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

export const L2_4: Lesson = {
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

export const L2_5: Lesson = {
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
