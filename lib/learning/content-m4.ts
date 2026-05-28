// F0 Learning Path — Module 4: Trader Psychology
// Lessons: L4.1 – L4.5
import type { Lesson } from "./types";

export const L4_1: Lesson = {
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

export const L4_2: Lesson = {
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

export const L4_3: Lesson = {
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

export const L4_4: Lesson = {
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

export const L4_5: Lesson = {
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
