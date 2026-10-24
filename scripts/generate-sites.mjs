import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const stores = JSON.parse(await readFile(path.join(root, "data/stores.json"), "utf8"));
const page = await readFile(path.join(root, "templates/page.tsx"), "utf8");
const layout = await readFile(path.join(root, "templates/layout.tsx"), "utf8");
const cssBase = await readFile(path.join(root, "templates/globals.css"), "utf8");

const sources = {
  ecommerce: ["Bộ Công Thương ghi nhận quy mô thương mại điện tử Việt Nam năm 2025 khoảng 31 tỷ USD, tăng 25,5%; hành vi tìm hiểu trực tuyến trước mua tiếp tục mở rộng.", "https://moit.gov.vn/tin-tuc/bo-cong-thuong-thuc-day-ket-noi-ba-nha-phat-trien-thuong-mai-dien-tu.html"],
  retail: ["Báo cáo thị trường nội địa 2025 ước bán lẻ trực tuyến đạt khoảng 32 tỷ USD, xấp xỉ 12% tổng bán lẻ, với mức thâm nhập internet trên 80%.", "https://dms.gov.vn/documents/d/guest/bc-ttnd-2025-song-ngu-pdf"],
  vcci: ["VCCI dẫn báo cáo doanh số trên bốn sàn lớn đạt 429,7 nghìn tỷ đồng năm 2025; nhà cửa và đời sống đạt 56,66 nghìn tỷ đồng, thời trang nữ đạt 54,52 nghìn tỷ đồng.", "https://en.vcci.com.vn/vcci-news/online-retail-sales-in-vietnam-jump-35-to-over-16-bln-in-2025-report-114817"],
  pets: ["Việt Nam có khoảng 13,1 triệu thú cưng năm 2025; cửa hàng khu phố vẫn giữ vai trò quan trọng nhờ tư vấn và quan hệ khách hàng.", "https://agriculture.canada.ca/en/international-trade/reports-and-guides/sector-trend-analysis-pet-food-vietnam"],
  petsGrowth: ["Thị trường thú cưng Việt Nam được ghi nhận tăng khoảng 10–11% mỗi năm; thức ăn thú cưng đạt khoảng 156 triệu USD năm 2025.", "https://vietnamnews.vn/economy/1781804/rapid-growth-in-viet-nam-s-pet-market-exposes-domestic-gap.html"],
  furniture: ["Thị trường nội thất gia đình Việt Nam được ước tính 474,3 triệu USD năm 2025 và có thể đạt 780,53 triệu USD vào 2031.", "https://www.mordorintelligence.com/industry-reports/vietnam-home-furniture-market"],
  fashion: ["Kênh trực tuyến được ước tính chiếm khoảng 25–30% thị trường thời trang Việt Nam năm 2025.", "https://ecdb.com/resources/sample-data/market/vn/fashion"],
  gifts: ["Phân khúc hoa và quà tặng trực tuyến Việt Nam được ước tính đạt 148 triệu USD năm 2025, với tỷ trọng online khoảng 10–15%.", "https://ecdb.com/resources/sample-data/market/vn/flowers-gifts"],
  flowers: ["Nghiên cứu ngành hoa Việt Nam cho biết khoảng 90% sản lượng phục vụ tiêu dùng nội địa và nhu cầu từng tăng xấp xỉ 15% mỗi năm trong giai đoạn được khảo sát.", "https://www.agroberichtenbuitenland.nl/binaries/agroberichtenbuitenland/documenten/rapporten/2024/03/06/study-on-flowers-and-ornamental-plants-sector-in-vietnam/Study%2BFlowers%2Band%2BOrnamental%2BPlants%2Bsector%2Bin%2BVietnam%2B-%2Bfinal%2Bupdate%2Bversion%2B8%2BApril%2B2024.pdf"],
  toys: ["Thị trường đồ chơi Việt Nam được ước tính đạt 570 triệu USD năm 2024 và có thể đạt 1 tỷ USD năm 2033, với nhu cầu tăng cho đồ chơi giáo dục và có thương hiệu.", "https://www.imarcgroup.com/report/vi/vietnam-toys-market"],
  music: ["Một báo cáo ngành ước tính thị trường nhạc cụ Việt Nam đạt 748 triệu USD năm 2024; bài học, sửa chữa và hỗ trợ mua hàng là các dịch vụ bổ trợ quan trọng.", "https://www.kenresearch.com/industry-reports/vietnam-musical-instruments-market"],
  ebike: ["Pin lithium-ion chiếm khoảng 88% thị trường xe đạp điện Việt Nam năm 2025; thị trường được dự báo tăng trưởng kép 6,86%.", "https://www.mordorintelligence.com/industry-reports/vietnam-e-bike-market"],
  ev: ["AP ghi nhận thị trường xe máy xăng Việt Nam khoảng 3,5 triệu xe mỗi năm, trong khi xe điện tăng nhanh nhưng người mua vẫn quan tâm quãng đường, sạc và giá.", "https://apnews.com/article/4ab76826787a806392655b843c374f3a"],
};

const profile = {
  phone: {
    theme: "tech", title: "Thiết bị phù hợp, tư vấn gần bạn.", lead: "Một điểm chạm rõ ràng để xem thông tin cửa hàng, hỏi nhanh về mẫu máy và tìm đường.", kicker: "Công nghệ địa phương, kết nối trực tiếp",
    section: "Bắt đầu từ nhu cầu sử dụng",
    offers: [["Thiết bị & phụ kiện", "Hỏi nhanh về dòng máy, phụ kiện tương thích và lựa chọn theo ngân sách."], ["Kiểm tra & tư vấn", "Trao đổi nhu cầu sử dụng trước khi đến để tiết kiệm thời gian."], ["Hỗ trợ sau mua", "Xác nhận bảo hành, cài đặt hoặc sửa chữa trực tiếp với cửa hàng."]],
    audiences: ["Người cần đổi thiết bị trong khu vực", "Học sinh, sinh viên mua theo ngân sách", "Khách cần sửa chữa hoặc phụ kiện nhanh"],
    intents: ["cửa hàng điện thoại", "điện thoại", "sửa điện thoại", "phụ kiện điện thoại"], facts: [sources.retail, sources.ecommerce],
  },
  fashion: {
    theme: "fashion", title: "Phong cách gần bạn, dễ hỏi – dễ ghé.", lead: "Khám phá định hướng sản phẩm, liên hệ hỏi size hoặc mẫu và mở chỉ đường trong một chạm.", kicker: "Phong cách địa phương, trải nghiệm liền mạch",
    section: "Gợi ý hành trình chọn đồ",
    offers: [["Phong cách thường ngày", "Gợi ý lựa chọn dễ phối cho đi học, đi làm hoặc dạo phố."], ["Size & độ vừa vặn", "Hỏi cửa hàng về size, phom và cách thử phù hợp trước khi ghé."], ["Phụ kiện hoàn thiện", "Khám phá lựa chọn có thể kết hợp; xác nhận mẫu trực tiếp."]],
    audiences: ["Người mua thời trang trong bán kính gần", "Khách ưu tiên thử trực tiếp", "Người cần tư vấn size hoặc phối đồ"],
    intents: ["shop thời trang", "giày dép", "cửa hàng quần áo", "shop nam"], facts: [sources.fashion, sources.vcci],
  },
  home: {
    theme: "home", title: "Chọn đồ cho không gian sống, bắt đầu thật gần.", lead: "Một trang giới thiệu mạch lạc để khách hiểu nhóm sản phẩm, trao đổi nhu cầu và tìm đến cửa hàng.", kicker: "Không gian sống, lựa chọn có chủ đích",
    section: "Từ nhu cầu đến lựa chọn phù hợp",
    offers: [["Giải pháp theo không gian", "Trao đổi phòng, diện tích và mục đích để định hướng lựa chọn."], ["Mẫu mã & vật liệu", "Hỏi trước về mẫu, màu, chất liệu hoặc thông số đang có."], ["Giao nhận & lắp đặt", "Xác nhận phạm vi giao hàng, lắp đặt và thời gian dự kiến."]],
    audiences: ["Gia đình đang hoàn thiện nhà", "Người thuê nhà cần nâng cấp không gian", "Khách mua theo kích thước cụ thể"],
    intents: ["nội thất", "rèm cửa", "chăn ga gối đệm", "đồ gia dụng"], facts: [sources.furniture, sources.vcci],
  },
  art: {
    theme: "creative", title: "Khơi nguồn sáng tạo ngay trong khu phố.", lead: "Tìm dụng cụ phù hợp, hỏi nhanh về dòng sản phẩm và mở chỉ đường đến cửa hàng.", kicker: "Chất liệu đúng, ý tưởng đi xa",
    section: "Gợi ý theo cách bạn sáng tạo",
    offers: [["Học tập & luyện tập", "Tìm lựa chọn cơ bản cho người mới, học sinh hoặc người luyện kỹ năng."], ["Sáng tác & dự án", "Trao đổi chất liệu, khổ, màu hoặc phụ kiện cho dự án cụ thể."], ["Quà tặng sáng tạo", "Gợi ý bộ dụng cụ theo sở thích; hỏi cửa hàng để kiểm tra mẫu."]],
    audiences: ["Học sinh, sinh viên mỹ thuật", "Người vẽ và làm thủ công", "Phụ huynh mua dụng cụ học tập"],
    intents: ["họa phẩm", "họa cụ", "dụng cụ vẽ", "shop mỹ thuật"], facts: [sources.retail, sources.vcci],
  },
  music: {
    theme: "creative", title: "Nhạc cụ phù hợp cho từng chặng luyện tập.", lead: "Từ người mới đến người chơi lâu năm: liên hệ hỏi mẫu, dịch vụ và chỉ đường.", kicker: "Âm thanh bắt đầu từ lựa chọn đúng",
    section: "Gợi ý trước khi chọn nhạc cụ",
    offers: [["Nhạc cụ cho người mới", "Hỏi về lựa chọn dễ làm quen và phù hợp ngân sách bắt đầu."], ["Nâng cấp trải nghiệm", "Trao đổi nhu cầu biểu diễn, luyện tập hoặc thu âm."], ["Phụ kiện & chăm sóc", "Xác nhận phụ kiện, bảo dưỡng, sửa chữa hoặc dịch vụ liên quan."]],
    audiences: ["Người mới học nhạc", "Phụ huynh tìm nhạc cụ cho con", "Người chơi cần nâng cấp hoặc bảo dưỡng"],
    intents: ["cửa hàng nhạc cụ", "guitar", "piano", "nhạc cụ gần đây"], facts: [sources.music, sources.ecommerce],
  },
  toys: {
    theme: "lifestyle", title: "Niềm vui nhỏ, lựa chọn đúng độ tuổi.", lead: "Giúp phụ huynh định hướng nhanh, hỏi cửa hàng về mẫu phù hợp và tìm đường thuận tiện.", kicker: "Chơi vui, chọn có cân nhắc",
    section: "Gợi ý chọn đồ chơi dễ hiểu",
    offers: [["Theo độ tuổi", "Hỏi cửa hàng về lựa chọn phù hợp giai đoạn phát triển và cách dùng."], ["Học qua chơi", "Khám phá nhóm sản phẩm khuyến khích vận động, tư duy hoặc sáng tạo."], ["Quà tặng cho bé", "Định hướng theo dịp và ngân sách; xác nhận mẫu trực tiếp."]],
    audiences: ["Phụ huynh có con nhỏ", "Người mua quà sinh nhật cho bé", "Khách tìm đồ chơi giáo dục"],
    intents: ["đồ chơi trẻ em", "shop đồ chơi", "đồ chơi giáo dục", "quà cho bé"], facts: [sources.toys, sources.retail],
  },
  pet: {
    theme: "lifestyle", title: "Chăm thú cưng chu đáo, ngay gần nhà.", lead: "Tìm thông tin cửa hàng, hỏi nhu cầu theo thú cưng và mở chỉ đường trong một chạm.", kicker: "Mỗi người bạn nhỏ, một nhu cầu riêng",
    section: "Bắt đầu từ nhu cầu của thú cưng",
    offers: [["Dinh dưỡng hằng ngày", "Hỏi theo loài, độ tuổi và khẩu phần; tuân theo tư vấn chuyên môn khi cần."], ["Chăm sóc & vệ sinh", "Tìm nhóm sản phẩm hỗ trợ vệ sinh và sinh hoạt."], ["Phụ kiện tiện ích", "Khám phá đồ dùng cho ăn, đi dạo, nghỉ ngơi hoặc vận chuyển."]],
    audiences: ["Người mới nuôi chó mèo", "Chủ nuôi cần mua định kỳ", "Khách cần tư vấn sản phẩm phù hợp"],
    intents: ["pet shop", "cửa hàng thú cưng", "đồ dùng chó mèo", "thức ăn thú cưng"], facts: [sources.pets, sources.petsGrowth],
  },
  flower: {
    theme: "lifestyle", title: "Gửi đúng lời bằng một lựa chọn tinh tế.", lead: "Tìm ý tưởng theo dịp, liên hệ đặt trước và mở chỉ đường đến tiệm hoa.", kicker: "Mỗi dịp đặc biệt, một thông điệp riêng",
    section: "Chọn theo dịp và cảm xúc",
    offers: [["Hoa tặng theo dịp", "Gợi ý cho sinh nhật, chúc mừng, kỷ niệm hoặc lời cảm ơn."], ["Tông màu & thông điệp", "Trao đổi phong cách, màu chủ đạo và lời nhắn mong muốn."], ["Đặt trước & giao nhận", "Xác nhận thời gian hoàn thiện, giao hàng và phạm vi phục vụ."]],
    audiences: ["Khách cần hoa trong ngày", "Người mua quà cho dịp cá nhân", "Doanh nghiệp đặt hoa chúc mừng"],
    intents: ["tiệm hoa", "hoa tươi", "đặt hoa", "hoa sinh nhật"], facts: [sources.flowers, sources.gifts],
  },
  gift: {
    theme: "creative", title: "Món quà vừa ý, thông điệp trọn vẹn.", lead: "Khám phá hướng quà tặng, hỏi dịch vụ gói quà và đến cửa hàng thuận tiện.", kicker: "Quà tặng có câu chuyện",
    section: "Bắt đầu từ người nhận và dịp tặng",
    offers: [["Quà theo dịp", "Định hướng cho sinh nhật, kỷ niệm, cảm ơn hoặc chúc mừng."], ["Gói quà & cá nhân hóa", "Hỏi về phong cách gói, thiệp hoặc chi tiết cá nhân hóa."], ["Ngân sách linh hoạt", "Trao đổi mức chi dự kiến để cửa hàng gợi ý phù hợp."]],
    audiences: ["Người cần quà tặng nhanh", "Khách muốn gói quà chỉn chu", "Doanh nghiệp cần quà theo dịp"],
    intents: ["shop quà tặng", "gói quà", "quà sinh nhật", "quà tặng nghệ thuật"], facts: [sources.gifts, sources.retail],
  },
  bike: {
    theme: "tech", title: "Chọn phương tiện hợp hành trình mỗi ngày.", lead: "Tìm hiểu nhóm nhu cầu, liên hệ hỏi mẫu và mở chỉ đường đến cửa hàng.", kicker: "Di chuyển chủ động, lựa chọn rõ ràng",
    section: "Gợi ý trước khi chọn xe",
    offers: [["Đi học & đi làm", "Hỏi lựa chọn phù hợp quãng đường và tần suất sử dụng."], ["Trải nghiệm & thông số", "Xác nhận mẫu, kích thước, pin hoặc cấu hình trực tiếp."], ["Bảo dưỡng & phụ kiện", "Trao đổi về bảo dưỡng, linh kiện và hỗ trợ sau mua."]],
    audiences: ["Học sinh và phụ huynh", "Người đi làm quãng đường ngắn", "Khách cần thay thế phương tiện xăng"],
    intents: ["xe đạp", "xe điện", "cửa hàng xe đạp", "xe điện học sinh"], facts: [sources.ebike, sources.ev],
  },
};

const palettes = {
  tech: [
    ["#1d4ed8","#172554","#f59e0b","#fef3c7","#eff6ff","#ffffff","#0f172a","#526079","#bfdbfe"],
    ["#0f766e","#134e4a","#f97316","#ffedd5","#f0fdfa","#ffffff","#102a2a","#526562","#99f6e4"],
    ["#4338ca","#312e81","#22c55e","#dcfce7","#eef2ff","#ffffff","#171733","#5b5b73","#c7d2fe"],
    ["#0369a1","#082f49","#facc15","#fef9c3","#f0f9ff","#ffffff","#0c2230","#536773","#bae6fd"],
    ["#334155","#0f172a","#38bdf8","#e0f2fe","#f8fafc","#ffffff","#0f172a","#596579","#cbd5e1"],
  ],
  fashion: [
    ["#047857","#064e3b","#fb923c","#ffedd5","#ecfdf5","#ffffff","#073b2d","#536b62","#a7f3d0"],
    ["#be123c","#881337","#fbbf24","#fef3c7","#fff1f2","#ffffff","#3b0a18","#745561","#fecdd3"],
    ["#7c3aed","#4c1d95","#2dd4bf","#ccfbf1","#f5f3ff","#ffffff","#241136","#675a73","#ddd6fe"],
    ["#b45309","#78350f","#10b981","#d1fae5","#fffbeb","#ffffff","#38210b","#74624d","#fde68a"],
    ["#c026d3","#701a75","#a3e635","#ecfccb","#fdf4ff","#ffffff","#321037","#6e5570","#f5d0fe"],
  ],
  home: [
    ["#78716c","#44403c","#d97706","#fef3c7","#faf5f2","#ffffff","#1c1917","#655f5b","#e7e5e4"],
    ["#4d7c0f","#365314","#ca8a04","#fef9c3","#f7fee7","#ffffff","#1e290c","#5d6853","#d9f99d"],
    ["#9a3412","#7c2d12","#0f766e","#ccfbf1","#fff7ed","#ffffff","#3b1b0e","#725c50","#fed7aa"],
    ["#57534e","#292524","#e11d48","#ffe4e6","#fafaf9","#ffffff","#1c1917","#69645f","#d6d3d1"],
    ["#0369a1","#0c4a6e","#c2410c","#ffedd5","#f0f9ff","#ffffff","#122934","#536670","#bae6fd"],
  ],
  creative: [
    ["#18181b","#09090b","#ec4899","#fce7f3","#fafafa","#ffffff","#09090b","#5c5c66","#e4e4e7"],
    ["#7e22ce","#581c87","#f97316","#ffedd5","#faf5ff","#ffffff","#2f123e","#6b5971","#e9d5ff"],
    ["#0f766e","#134e4a","#eab308","#fef9c3","#f0fdfa","#ffffff","#112f2c","#5b6d6a","#99f6e4"],
    ["#1d4ed8","#1e3a8a","#e11d48","#ffe4e6","#eff6ff","#ffffff","#101e40","#58647b","#bfdbfe"],
    ["#9f1239","#4c0519","#8b5cf6","#ede9fe","#fff1f2","#ffffff","#370c19","#765661","#fecdd3"],
  ],
  lifestyle: [
    ["#c2410c","#7c2d12","#2563eb","#dbeafe","#fff7ed","#ffffff","#34170c","#725c52","#fed7aa"],
    ["#15803d","#14532d","#f59e0b","#fef3c7","#f0fdf4","#ffffff","#123020","#587064","#bbf7d0"],
    ["#be185d","#831843","#0d9488","#ccfbf1","#fdf2f8","#ffffff","#3c1027","#755866","#fbcfe8"],
    ["#0369a1","#164e63","#f97316","#ffedd5","#f0f9ff","#ffffff","#102b37","#536a74","#bae6fd"],
    ["#6d28d9","#4c1d95","#84cc16","#ecfccb","#f5f3ff","#ffffff","#261442","#655b75","#ddd6fe"],
  ],
};

const fonts = {
  tech: ["https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap", "\"Space Grotesk\"", "\"Manrope\"", "18px", "0 24px 60px rgba(15,23,42,.15)"],
  fashion: ["https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&family=Rubik:wght@500;600;700;800&display=swap", "\"Rubik\"", "\"Nunito Sans\"", "22px", "0 24px 60px rgba(57,28,46,.15)"],
  home: ["https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Josefin+Sans:wght@400;500;600;700&display=swap", "\"Cinzel\"", "\"Josefin Sans\"", "12px", "0 24px 60px rgba(68,64,60,.16)"],
  creative: ["https://fonts.googleapis.com/css2?family=Didact+Gothic&family=Poiret+One&display=swap", "\"Poiret One\"", "\"Didact Gothic\"", "8px", "0 24px 60px rgba(24,24,27,.14)"],
  lifestyle: ["https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Varela+Round&display=swap", "\"Varela Round\"", "\"Nunito\"", "28px", "0 24px 60px rgba(67,34,18,.14)"],
};

function classify(value) {
  const c = value.toLocaleLowerCase("vi");
  if (c.includes("thú cưng")) return "pet";
  if (c.includes("hoa tươi")) return "flower";
  if (c.includes("quà tặng")) return "gift";
  if (c.includes("nhạc cụ")) return "music";
  if (c.includes("họa")) return "art";
  if (c.includes("đồ chơi")) return "toys";
  if (c.includes("xe đạp") || c.includes("xe điện")) return "bike";
  if (c.includes("điện thoại") || c.includes("máy tính") || c.includes("điện tử") || c.includes("âm thanh")) return "phone";
  if (c.includes("giày") || c.includes("thời trang") || c.includes("thể thao")) return "fashion";
  return "home";
}

function slug(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52);
}

function cleanName(value) {
  return value.replace(/^Cửa Hàng\s+/i, "").replace(/^Cửa hàng\s+/i, "").replace(/^Công ty TNHH\s+/i, "").slice(0, 42);
}

function tel(value) {
  if (!value || value.toLocaleLowerCase("vi").includes("không")) return "";
  const clean = value.replace(/[^\d+]/g, "");
  return "tel:" + (clean.startsWith("+84") ? clean : clean.startsWith("0") ? "+84" + clean.slice(1) : clean);
}

function siteCss(theme, index) {
  const p = palettes[theme][index % 5];
  const f = fonts[theme];
  const tokens = {
    FONT_URL: f[0], HEADING_FONT: f[1], BODY_FONT: f[2], RADIUS: f[3], SHADOW: f[4],
    PRIMARY: p[0], PRIMARY_DEEP: p[1], ACCENT: p[2], ACCENT_SOFT: p[3],
    BACKGROUND: p[4], SURFACE: p[5], FOREGROUND: p[6], MUTED: p[7], BORDER: p[8],
  };
  return Object.entries(tokens).reduce((value, item) => value.replaceAll(item[0], item[1]), cssBase);
}

function research(store, p, folder, data) {
  const facts = p.facts.map((item) => "- " + item[0] + " [Nguồn](" + item[1] + ")").join("\n");
  const audiences = p.audiences.map((item) => "- " + item).join("\n");
  const keywords = p.intents.map((item) => "- " + item + " " + store.area).join("\n");
  const channel = store.existingLink ? "[Mở kênh](" + store.existingLink + ")" : "Chưa ghi nhận";
  return [
    "# Nghiên cứu thị trường — " + store.name, "",
    "## Hồ sơ đã kiểm chứng", "",
    "| Thuộc tính | Giá trị |", "|---|---|",
    "| Ngành | " + store.category + " |",
    "| Khu vực | " + store.area + " |",
    "| Địa chỉ | " + store.address + " |",
    "| Điện thoại công khai | " + (data.phoneHref ? store.phone : "Không công khai") + " |",
    "| Google Maps | [Mở bản đồ](" + store.mapUrl + ") |",
    "| Kênh hiện có | " + channel + " |",
    "| Đánh giá gần nhất khi kiểm tra | " + store.latestReview + " |",
    "| Ngày kiểm tra | " + store.checkedAt + " |", "",
    "## Cơ hội thị trường", "", facts, "",
    "Hàm ý: landing page không thay thế Facebook, Shopee hay Google Maps. Nó làm điểm thông tin do cửa hàng kiểm soát, gom CTA gọi điện/chỉ đường/kênh hiện có và tạo nội dung có cấu trúc cho tìm kiếm địa phương.", "",
    "## Nhóm khách mục tiêu", "", audiences, "",
    "## Định vị đề xuất", "",
    "Thông tin rõ, liên hệ nhanh và thuận tiện cho khách ở " + store.area + ". Không dùng tuyên bố giá rẻ nhất hoặc tốt nhất khi chưa có dữ liệu chứng minh; ưu tiên sự gần gũi, khả năng xác nhận trực tiếp và chỉ đường.", "",
    "## Ý định tìm kiếm & SEO địa phương", "", keywords, "- " + store.name, "",
    "Meta title: " + data.seo.title, "", "Meta description: " + data.seo.description, "",
    "## Kiến trúc landing page", "",
    "1. Hero: tên cửa hàng, ngành, khu vực và CTA chính.",
    "2. Bằng chứng hoạt động: thời điểm đánh giá gần nhất và ngày kiểm tra.",
    "3. Ba nhóm nhu cầu để khách tự định hướng.",
    "4. Giá trị mua sắm địa phương và địa chỉ đầy đủ.",
    "5. Quy trình liên hệ ba bước.",
    "6. FAQ không suy diễn chính sách.",
    "7. Khối điện thoại, Google Maps và kênh hiện có.", "",
    "## Chỉ số nên đo khi triển khai", "",
    "- Lượt bấm gọi điện và mở Google Maps.",
    "- Lượt chuyển sang Facebook, Shopee hoặc kênh hiện có.",
    "- Từ khóa địa phương tạo phiên truy cập.",
    "- Tỷ lệ khách quay lại và nguồn giới thiệu.", "",
    "## Rủi ro và nguyên tắc nội dung", "",
    "- Không công bố giá, tồn kho, thương hiệu phân phối hoặc dịch vụ khi chưa xác nhận.",
    "- Không tự tạo đánh giá, số năm hoạt động, chứng nhận hoặc cam kết bảo hành.",
    "- Kiểm tra lại số điện thoại, địa chỉ, giờ mở cửa và quyền sử dụng hình ảnh trước khi xuất bản.",
    "- Cập nhật liên kết và nội dung theo mùa ít nhất mỗi quý.", "",
    "Mã thư mục: " + folder + ". Số liệu ngành chỉ là bối cảnh thị trường, không phải doanh thu của cửa hàng.", "",
  ].join("\n");
}

const layouts = ["layout-editorial", "layout-bold", "layout-soft", "layout-precise", "layout-classic"];
const manifest = [];
const rows = [];

for (const [index, store] of stores.entries()) {
  const p = profile[classify(store.category)];
  const name = cleanName(store.name);
  const folder = String(index + 1).padStart(2, "0") + "-" + slug(name + "-" + store.area.split(" ")[0]);
  const dir = path.join(root, "sites", folder);
  const phoneHref = tel(store.phone);
  const palette = palettes[p.theme][index % 5];
  const keywords = p.intents.map((item) => item + " " + store.area).concat([store.name, store.category]);
  const data = {
    indexLabel: String(index + 1).padStart(2, "0") + " / 50",
    name: store.name, shortName: name, category: store.category, address: store.address, area: store.area,
    phone: store.phone, phoneHref, existingLink: store.existingLink, latestReview: store.latestReview,
    checkedAt: store.checkedAt, mapUrl: store.mapUrl, theme: "theme-" + p.theme, layout: layouts[index % 5],
    palette: { primary: palette[0], accent: palette[2] },
    hero: { title: p.title, lead: p.lead, kicker: p.kicker },
    sections: {
      offerTitle: p.section,
      offerLead: "Các nhóm dưới đây giúp khách đặt câu hỏi đúng; mẫu, giá và tình trạng hàng cần được cửa hàng xác nhận.",
      valueTitle: "Một điểm chạm số cho khách ở " + store.area,
      valueLead: "Trang tập trung vào điều khách cần trước khi ghé: cửa hàng bán gì, liên hệ bằng cách nào và đi đến đâu.",
    },
    offerings: p.offers.map((item) => ({ title: item[0], text: item[1] })),
    benefits: [
      { title: "Thông tin tập trung", text: "Tên, địa chỉ, điện thoại và đường đi trong cùng một trải nghiệm." },
      { title: "Liên hệ không vòng vo", text: phoneHref ? "Gọi trực tiếp để hỏi mẫu, giá và tình trạng còn hàng." : "Mở Google Maps hoặc kênh hiện có để hỏi trực tiếp." },
      { title: "Ưu tiên khách địa phương", text: "Nội dung hướng đến nhu cầu tìm kiếm tại " + store.area + " và khu vực lân cận." },
    ],
    steps: [
      { title: "Xác định nhu cầu", text: "Ghi lại mục đích, ngân sách và điều bạn cần được tư vấn." },
      { title: "Liên hệ cửa hàng", text: phoneHref ? "Gọi để xác nhận thông tin trước khi di chuyển." : "Dùng Google Maps hoặc kênh hiện có để hỏi thông tin." },
      { title: "Ghé và trải nghiệm", text: "Mở chỉ đường, xem thực tế và quyết định sau khi được xác nhận." },
    ],
    faqs: [
      { question: "Cửa hàng có đúng mẫu tôi cần không?", answer: "Trang không hiển thị tồn kho theo thời gian thực. Bạn nên liên hệ trực tiếp và mô tả rõ nhu cầu trước khi ghé." },
      { question: "Giá trên trang này ở đâu?", answer: "Giá có thể thay đổi theo mẫu, thời điểm hoặc dịch vụ đi kèm. Vui lòng hỏi cửa hàng để nhận thông tin hiện hành." },
      { question: "Làm sao tìm đường nhanh nhất?", answer: "Chọn nút Mở Google Maps hoặc Chỉ đường để dùng vị trí công khai của cửa hàng." },
    ],
    seo: {
      title: name + " | " + store.category + " tại " + store.area,
      description: "Thông tin " + store.name + " tại " + store.area + ": địa chỉ, liên hệ, Google Maps và gợi ý trước khi ghé.",
      keywords,
    },
  };

  await mkdir(path.join(dir, "app"), { recursive: true });
  await mkdir(path.join(dir, "data"), { recursive: true });
  const pkg = {
    name: "store-" + folder, version: "1.0.0", private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start", lint: "tsc --noEmit" },
    dependencies: { next: "^16.4.0", react: "^19.3.0", "react-dom": "^19.3.0" },
    devDependencies: { "@types/node": "^24.10.0", "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0", typescript: "^5.9.0" },
  };
  const tsconfig = {
    compilerOptions: { target: "ES2017", lib: ["dom","dom.iterable","esnext"], allowJs: false, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "react-jsx", incremental: true, plugins: [{ name: "next" }] },
    include: ["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts",".next/dev/types/**/*.ts"], exclude: ["node_modules"],
  };
  await writeFile(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  await writeFile(path.join(dir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n");
  await writeFile(path.join(dir, "next-env.d.ts"), "/// <reference types=\"next\" />\n/// <reference types=\"next/image-types/global\" />\n");
  await writeFile(path.join(dir, "next.config.mjs"), "const nextConfig = { output: \"export\", trailingSlash: true, images: { unoptimized: true } };\n\nexport default nextConfig;\n");
  await writeFile(path.join(dir, "app/layout.tsx"), layout);
  await writeFile(path.join(dir, "app/page.tsx"), page);
  await writeFile(path.join(dir, "app/globals.css"), siteCss(p.theme, index));
  await writeFile(path.join(dir, "data/site.ts"), "export const site = " + JSON.stringify(data, null, 2) + " as const;\n");
  await writeFile(path.join(dir, "MARKET_RESEARCH.md"), research(store, p, folder, data));
  await writeFile(path.join(dir, "README.md"), "# " + store.name + "\n\nProject Next.js độc lập cho cửa hàng " + store.category + " tại " + store.area + ".\n\nChạy từ thư mục gốc:\n\n    npm run dev --workspace sites/" + folder + "\n\nBuild tĩnh:\n\n    npm run build --workspace sites/" + folder + "\n\nXem MARKET_RESEARCH.md để đọc nghiên cứu và giả định nội dung.\n");
  manifest.push({ index: index + 1, folder, name: store.name, category: store.category, area: store.area, theme: p.theme, mapUrl: store.mapUrl });
  rows.push("| " + String(index + 1).padStart(2, "0") + " | [" + store.name + "](./sites/" + folder + ") | " + store.category + " | " + store.area + " | " + p.theme + " |");
}

await writeFile(path.join(root, "sites", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(path.join(root, "README.md"), [
  "# 50 landing page Next.js cho cửa hàng địa phương", "",
  "Repository gồm 50 project Next.js độc lập, mỗi cửa hàng nằm trong một thư mục riêng dưới sites/. Các site dùng dữ liệu liên hệ công khai đã kiểm tra trên Google Maps và liên kết về điện thoại, bản đồ hoặc kênh hiện có.", "",
  "## Cấu trúc", "",
  "- sites/01-... đến sites/50-...: 50 ứng dụng Next.js độc lập.",
  "- data/stores.json: dữ liệu nguồn.",
  "- design-system/: năm hệ thiết kế theo nhóm ngành.",
  "- templates/: mẫu mã nguồn dùng để tái tạo.",
  "- scripts/generate-sites.mjs: sinh lại toàn bộ project.",
  "- docs/: phương pháp và nguồn nghiên cứu.", "",
  "## Cài đặt và kiểm tra", "",
  "    pnpm install", "    pnpm run validate", "    pnpm run build:all", "",
  "Chạy một site:", "", "    npm run dev --workspace sites/01-luxury-mobile-vinh-phuc", "",
  "Mỗi project xuất bản tĩnh vào thư mục out/ tương ứng.", "",
  "## Danh sách project", "", "| # | Cửa hàng | Ngành | Khu vực | Hệ thiết kế |", "|---:|---|---|---|---|", ...rows, "",
  "## Nguyên tắc dữ liệu", "",
  "Không tự tạo giá, tồn kho, đánh giá, chứng nhận hoặc chính sách. Nội dung yêu cầu khách xác nhận trực tiếp trước khi mua. Nghiên cứu riêng nằm trong MARKET_RESEARCH.md của từng project.", "",
].join("\n"));
console.log("Generated " + manifest.length + " independent Next.js projects.");
