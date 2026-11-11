# 🎣 Hanoi Fishing World — 2D Pixel Art (prototype)

**Trạng thái:** Bản chơi đơn (frontend prototype), chưa phải game multiplayer production.

Dự án đã chuyển từ 50 landing page sang một web game câu cá **2D Pixel Art**. Lịch sử Git vẫn giữ được bản cũ. Đây là phiên bản đầu tiên để thử luồng chơi tại **Hồ Bảy Mẫu — Công viên Thống Nhất**.

## Chạy cục bộ

Yêu cầu Node.js >=20. Không cần cài dependency.

\`\`\`sh
npm run dev
# mở http://localhost:3000
npm test
\`\`\`

Có thể dùng bất kỳ static HTTP server nào; không mở bằng file:// vì dữ liệu hồ được nạp qua fetch.

## Đã chạy được (demo cục bộ)

- Màn hình **bản đồ Hà Nội dạng Pixel Art 2D** có pan/zoom, tìm kiếm và marker cho **28 hồ/địa danh** từ data/hanoi-lakes.json. Tọa độ marker là vị trí minh họa theo khu vực, **không phải tọa độ GIS đã xác minh**.
- Chọn Hồ Bảy Mẫu — Công viên Thống Nhất, mở scene 2D; di chuyển nhân vật bằng WASD/phím mũi tên, điều khiển chạm trên mobile, click trên scene để đi, click số 1–15 để đi tới vị trí câu quanh hồ.
- Có **15 spot** trên scene, chỉ avatar cục bộ giữ chỗ. Bảng trạng thái nêu giới hạn thiết kế **15 cần thủ + 30 khán giả**; **không** mô phỏng giả người online.
- Câu cá thử: chọn 3 loại cần, mồi, thả câu, nhận báo hiệu cá cắn, bấm giật và kéo cá; sổ sưu tầm 10 loài, tier độ hiếm và xu ảo demo.
- 5 phút giữ vị trí câu miễn phí trong phiên chạy, sau đó xuất hiện đề nghị thuê tiếp 5 phút. **20 xu** là mức giả lập để test thao tác, **chưa được chủ dự án phê duyệt** và không liên quan tiền thật.

## Chưa có, phải làm trước khi công bố game online

- Backend WebSocket authoritative; 45 tài khoản thật/phòng; chat; hàng chờ; khóa vị trí atomic; xác thực; reconnect; lưu hồ sơ/cá/xu/thuê bằng database.
- Bản đồ GIS chuẩn, kiểm tra nguồn/giấy phép cho hình nền, thêm scene độc lập cho những hồ khác; game đang chỉ có **một scene Bảy Mẫu**.
- Chống sửa dữ liệu client; mô phỏng hiện xử lý kết quả ở trình duyệt, không được phép dùng kinh tế hoặc xếp hạng thật.
- Session free timer và xu sẽ reset khi reload; chưa thể dùng để tính phí thật. Không có thanh toán tiền mặt và không liên kết thanh toán.
- Mobile gameplay cần test rộng trên máy thật và tối ưu thêm.

## Tài liệu

- [Master Plan 2D online](docs/HANOI_FISHING_2D_MASTER_PLAN.md)
- [Pixel Art Style Guide](docs/PIXEL_ART_STYLE_GUIDE.md)
- [Dữ liệu hồ](data/hanoi-lakes.json)

## Nguyên tắc dữ liệu

Các hồ có thật được dùng làm **bối cảnh trò chơi hư cấu**, không hàm ý được phép câu cá tại địa điểm thật. Danh sách 28 hồ chỉ là nguồn khởi tạo có ghi chú kiểm chứng, chưa phải đầy đủ toàn bộ hồ Hà Nội.

## Triển khai Vercel (cấu hình production)

`vercel.json` ở root cố định 3 thiết lập: Framework Preset **Other**, Build Command `npm run build`, Output Directory **dist**. Đây là website HTML/CSS/JS tĩnh, **không phải** Next.js hay Node server chạy trên Vercel.

Trong Vercel → Project Settings → Build and Deployment / General:
- **Root Directory:** để trống / `.` (gốc repo `ai_web`, **không** phải `sites/...` cũ).
- **Production Branch:** `main`.
- `vercel.json` sẽ ghi đè build command, framework và output directory; không cần `node server.mjs` trên Vercel.
- Sau commit mới, chạy **Redeploy** production. Nếu vẫn thấy 404, xem Vercel → Deployment → Build Logs & Source/Output và xác nhận `index.html`, `app.js`, `styles.css`, `data/hanoi-lakes.json` nằm ở root của output.
- Nếu giao diện hiện nhưng game không load, mở Developer Tools → Network/Console để kiểm tra `/app.js`, `/styles.css`, `/data/hanoi-lakes.json` phải trả 200 và đúng MIME; kiểm tra bảo vệ deployment, DNS hoặc root directory nếu báo 401/403/404.

GitHub Actions xác nhận **build tĩnh và HTTP smoke test**; không thay cho E2E trên trình duyệt hoặc thử trực tiếp domain Vercel.

## Cơ chế câu cá mới: phao phản xạ + thanh Space chạy qua lại

Sau khi đến một trong 15 vị trí câu, game chuyển sang giao diện **Fishing Station** riêng với góc nhìn cận cảnh phao trên mặt nước:
- Bấm **THẢ CÂU** hoặc **Space**. Phao chuyển động bởi sóng nước, cá rỉa mồi hoặc va dây; **không hiện bất kỳ chữ, âm thanh hay hiệu ứng nào báo cá cắn**.
- Hãy tự nhìn **cú chìm sâu / kéo ngang có hướng / nổi cao và nghiêng**, rồi nhấc cần bằng **Space**. Chỉ khi người chơi nhấc cần mới biết có mắc cá hay không. Bỏ lỡ cắn thật thì phao lặng lẽ ổn định và tiếp tục chờ, không có thông báo bí mật.
- Bản mô phỏng phân biệt sóng nhẹ, nhấp giả, va dây và ba kiểu cá lấy mồi bằng chuyển động phao; thời điểm xuất hiện được xáo ngẫu nhiên.
- Một **thanh lực lớn nổi chính giữa màn hình** xuất hiện; **kim tự chạy trái ↔ phải**. Người chơi **bấm Space từng nhịp** khi kim vào **vùng xanh** để lấy đủ số nhịp trong **5–10 giây** tùy loài. Bấm ngoài vùng xanh 4 lần sẽ mất cá; giữ Space liên tục không có tác dụng.
- Trên điện thoại, **chạm từng nhịp** nút CANH SPACE ở giữa màn hình; không cần giữ.
- Nút **RỜI GHẾ CÂU** quay về bờ hồ và không làm mới 5 phút miễn phí.

Tài liệu chi tiết, tham khảo thực tế và cân bằng game: [Float Fishing Mechanics](docs/FLOAT_FISHING_MECHANICS.md). Các thông số là gameplay thử nghiệm.

## Kết quả câu cá thành công

Khi hoàn tất minigame kim Space, game hiện **popup "🎉 CÂU THÀNH CÔNG!"** cố định giữa màn hình, với **hình pixel art đúng loài cá**, tên, nhãn độ hiếm, xu và điểm được cộng. Bộ ảnh có **10 SVG pixel-art khác nhau** tại `assets/fish/`. Ảnh là minh hoạ game được vẽ riêng, không phải ảnh chụp sinh vật ngoài đời.

- Thường: viền xanh lá. Hiếm: vàng. Cực hiếm: tím.
- Nút **CÂU TIẾP** đóng kết quả và tự thả câu lượt tiếp theo nếu vẫn còn thời gian; khi hết giờ hiển thị hướng dẫn gia hạn xu ảo.
- **Esc** đóng popup mà chưa thả câu; **Enter** kích hoạt nút CÂU TIẾP; khi popup đang mở thì Space không được phép vô tình khởi tạo lượt câu mới.
- Trình duyệt và Vercel phục vụ file SVG độc lập; `npm run build` kiểm tra đủ 10 hình ảnh, đúng MIME trên HTTP server.

Bản demo vẫn chưa có tài khoản, lưu lịch sử, multiplayer hay thanh toán tiền thật.

## Mồi câu ảnh hưởng đến loài cá xuất hiện

Trong **Fishing Station**, menu mồi có **7 loại**: giun, bột ngũ cốc, ngô ngọt, rau non/cỏ, tép, ốc và mồi giả. Chọn mồi sẽ hiện **những loài có khả năng hợp mồi** và mô tả ngắn:

- **Giun:** rô đồng, trê, diếc; **bột:** mè trắng, trôi, chép.
- **Ngô:** chép, trắm cỏ, trôi; **rau/cỏ:** thiên về trắm cỏ.
- **Tép:** trê, rô đồng, cá quả; **ốc:** thiên về trắm đen.
- **Mồi giả:** thiên về cá săn mồi như cá quả.

Mồi thay đổi **xác suất gặp cá theo loài và độ hiếm** (không bảo đảm sẽ câu được), kết hợp với cần và kỹ năng phản xạ. Khi đã thả câu, mồi/cần được khóa cho đến lượt sau, tránh đổi đồ giữa chừng. Bản demo **không trừ mồi và không dùng tiền thật**.

Tỷ lệ thiết kế, bảng 10 × 7 và nguồn hướng dẫn câu cá: [Bait Mechanics](docs/BAIT_MECHANICS.md). Game vẫn giữ nguyên **phao không báo cá cắn**, minigame canh Space ở giữa màn hình và popup hình cá sau khi câu thành công.
