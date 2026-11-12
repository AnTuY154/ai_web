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
- Một **thanh lực lớn nổi chính giữa màn hình** xuất hiện; **kim tự chạy trái ↔ phải**. Người chơi **bấm Space từng nhịp** khi kim vào **vùng xanh**; **đủ nhịp là câu thành công ngay**, không phải chờ đồng hồ hết. Bỏ thanh tiến trình thời gian của màn kéo cá, giữ đồng hồ giới hạn **5–10 giây** tùy loài và đồng hồ 5 phút của phiên câu. Bấm ngoài vùng xanh 4 lần sẽ mất cá; giữ Space liên tục không có tác dụng.
- Trên điện thoại, **chạm từng nhịp** nút CANH SPACE ở giữa màn hình; không cần giữ.
- Nút **RỜI GHẾ CÂU** quay về bờ hồ và không làm mới 5 phút miễn phí.

Tài liệu chi tiết, tham khảo thực tế và cân bằng game: [Float Fishing Mechanics](docs/FLOAT_FISHING_MECHANICS.md). Các thông số là gameplay thử nghiệm.

## Kết quả câu cá thành công

Khi hoàn tất minigame kim Space, game hiện **popup "🎉 CÂU THÀNH CÔNG!"** cố định giữa màn hình, với **hình pixel art đúng loài cá**, tên, nhãn độ hiếm, **+1 cá vào kho** và điểm câu được cộng. Bộ ảnh có **10 SVG pixel-art khác nhau** tại `assets/fish/`. Ảnh là minh hoạ game được vẽ riêng, không phải ảnh chụp sinh vật ngoài đời.

- Thường: viền xanh lá. Hiếm: vàng. Cực hiếm: tím.
- Nút **CÂU TIẾP** đóng kết quả và tự thả câu lượt tiếp theo nếu vẫn còn thời gian; khi hết giờ hiển thị hướng dẫn gia hạn xu ảo.
- **Esc** đóng popup mà chưa thả câu; **Enter** kích hoạt nút CÂU TIẾP; khi popup đang mở thì Space không được phép vô tình khởi tạo lượt câu mới.
- Trình duyệt và Vercel phục vụ file SVG độc lập; `npm run build` kiểm tra đủ 10 hình ảnh, đúng MIME trên HTTP server.

Bản demo đã lưu kho cá và lịch sử bằng localStorage, nhưng chưa có tài khoản đăng nhập, multiplayer hay thanh toán tiền thật.

## Mồi câu ảnh hưởng đến loài cá xuất hiện

Trong **Fishing Station**, menu mồi có **7 loại**: giun, bột ngũ cốc, ngô ngọt, rau non/cỏ, tép, ốc và mồi giả. Chọn mồi sẽ hiện **những loài có khả năng hợp mồi** và mô tả ngắn:

- **Giun:** rô đồng, trê, diếc; **bột:** mè trắng, trôi, chép.
- **Ngô:** chép, trắm cỏ, trôi; **rau/cỏ:** thiên về trắm cỏ.
- **Tép:** trê, rô đồng, cá quả; **ốc:** thiên về trắm đen.
- **Mồi giả:** thiên về cá săn mồi như cá quả.

Mồi thay đổi **xác suất gặp cá theo loài và độ hiếm** (không bảo đảm sẽ câu được), kết hợp với cần và kỹ năng phản xạ. **Mỗi lần thả câu tốn 1 mồi**, kể cả khi thu phao hoặc giật hụt. Khi đang thả, mồi/cần bị khóa cho đến lượt sau. Có **cửa hàng dùng xu ảo**, không có thanh toán tiền thật.

Tỷ lệ thiết kế, bảng 10 × 7 và nguồn hướng dẫn câu cá: [Bait Mechanics](docs/BAIT_MECHANICS.md). Game vẫn giữ nguyên **phao không báo cá cắn**, minigame canh Space ở giữa màn hình và popup hình cá sau khi câu thành công.

## Đọc phao theo tín hiệu ngoài đời (bản nâng cấp)

Dựa trên bản tóm tắt reel câu phao mà người dùng cung cấp, mô phỏng phân biệt rõ **7 tình huống**: rung lăn tăn, nhấp nông liên tục do cá nhỏ, chìm rồi nổi lại (cắn giả), chìm hẳn, chạy ngang, trồi lên và nghiêng, hoặc im lâu.

- **Chỉ một phần nhỏ chóp đỏ lộ trên mặt nước**, thân phao chìm dưới nước nhờ kỹ thuật clipping trong Canvas, giống một phao cân chì đúng hơn.
- **Chìm rồi nổi lại là tín hiệu giả**, không được xem là cá đã ngậm chắc. Nhấp nông liên tục có thể xảy ra thường hơn với giun/bột/tép; mồi dạng to như ngô/ốc giảm những lần rỉa nhỏ.
- **Chìm rõ và duy trì / đi ngang / nổi cao nghiêng** mới là cửa sổ giật có thể mắc cá. Người chơi vẫn phải bấm Space bằng mắt; **không báo trước cá cắn**.
- Có nút **THU PHAO / ĐỔI MỒI** khi đang quan sát, để thử lại khi chờ quá lâu hoặc muốn dùng mồi khác mà không bị tính giật hụt.
- **SỔ TAY ĐỌC PHAO** là nội dung tĩnh mở theo ý người chơi, không phải tín hiệu thời gian thực.

Trò chơi **chưa cho điều chỉnh cỡ phao, chì hoặc độ sâu theo tay**; phao được cân sẵn cho chế độ demo. Chi tiết: [Float Fishing Mechanics](docs/FLOAT_FISHING_MECHANICS.md).

## 🎁 Quà khởi đầu và cửa hàng mồi

**Người chơi mới có 50 mồi sử dụng miễn phí**: 16 giun, 10 bột, 8 ngô, 6 rau, 5 tép, 3 ốc và 2 mồi giả. Đây là **tổng 50**, không phải 50 mồi mỗi loại. Số xu khởi đầu vẫn là **50 xu game**.

Trong màn Fishing Station, bạn có thể mở **🏪 CỬA HÀNG MỒI** để xem mỗi loại mồi đang có bao nhiêu, giá mua theo đơn vị, hai tỷ lệ gặp **cá hiếm/cực hiếm**, và mua nhanh 1 hoặc 5 mồi. Giá 1 lượt từ 1 xu (giun) tới 8 xu (mồi giả). Cá câu thành công được đưa vào **KHO CÁ**, bán cá để có xu dùng mua mồi.

**Không có mồi**: nút thả câu của loại đang chọn bị khóa; đổi sang mồi đang có hoặc mua thêm ở cửa hàng. **Đổi mồi sau khi thu phao không hoàn lại lượt mồi đã dùng.** Nếu phao đang chờ cá và có nhiều lần cá cắn thì đó vẫn chỉ là một lần thả nên không trừ thêm.

Kho mồi, xu và lịch sử bắt cá được **lưu trên trình duyệt**, tải lại trang không tự phát thêm 50 mồi. Bản demo **chưa có tài khoản máy chủ**: chưa thể kiểm soát quà tân thủ trên nhiều thiết bị hoặc khi người chơi xóa dữ liệu duyệt web. Các tỷ lệ là thông số thiết kế game, không phải tỷ lệ câu thật. Xem [Bait Mechanics](docs/BAIT_MECHANICS.md).

## 🐟 Kho cá cá nhân, bán cá và cửa hàng cần

Khi thắng minigame, mỗi con cá được đưa vào **🐟 KHO CÁ CỦA TÔI** thay vì cộng xu ngay. Kho hiển thị ảnh pixel-art, tên loài, số lượng còn trong kho và giá bán. Người chơi chọn **BÁN 1** hoặc **BÁN HẾT** từng loài để cộng xu vào ví; không thể bán lại cá đã bán. Điểm và số cá từng câu là thống kê lịch sử, không mất khi bán.

| Loài | Giá bán / con |
|---|---:|
| Rô phi, Rô đồng, Diếc, Trôi, Mè trắng | 6 / 7 / 8 / 9 / 10 xu |
| Chép, Trắm cỏ, Trê | 19 / 22 / 23 xu |
| Trắm đen, Cá quả | 48 / 55 xu |

**🎣 CỬA HÀNG CẦN CÂU**: có sẵn **cần tay** miễn phí; **cần máy giá 90 xu** (kim kéo cá chậm hơn), **cần lure giá 160 xu** (khó hơn nhưng có cộng hưởng với mồi giả). Mua cần một lần, sau đó **TRANG BỊ** giữa các lượt câu; loại chưa mua không thể sử dụng. Xu mua cần lấy từ việc bán cá (hoặc từ số xu đang có).

**Nâng cấp dữ liệu cũ:** tệp lưu v1 trước đây đã cộng xu ngay khi câu được cá. Khi tự nâng lên v2, game **giữ nguyên xu, mồi, tổng số cá, điểm và thời gian**, nhưng kho cá bán được bắt đầu từ 0; nếu đưa cá cũ vào kho thì sẽ trả xu **hai lần**. Các lượt bắt cá từ sau bản cập nhật mới đi vào kho đồ.

Mọi thông tin được lưu bằng **localStorage của trình duyệt hiện tại**, không có đồng bộ liên thiết bị hay bảo vệ chống sửa dữ liệu. Điều này đại diện cho **một người chơi trên một hồ sơ trình duyệt**, không phải nhiều tài khoản dùng chung một thiết bị. Xóa dữ liệu trình duyệt có thể làm mất tiến trình.

## Giao diện menu 4 ô không cần cuộn trang (mobile-first)

Màn hình câu cá có lưới **2×2** truy cập nhanh: **🏪 Cửa hàng mồi**, **🎣 Cửa hàng cần**, **🐟 Kho cá của tôi**, **🏆 Thành quả**. Mỗi ô hiển thị tổng mồi, số cần đã sở hữu, cá còn trong kho hoặc số cá/điểm từng câu, cập nhật tức thời theo dữ liệu `localStorage`.

- **Điện thoại / máy tính bảng (tới 850px):** 4 ô được **ghim ở cuối màn hình**, nên không phải kéo đến tận cuối cột đồ câu để tìm chức năng; hộp thông báo nhỏ bên dưới hiển thị cá vừa câu.
- **Màn hình rộng:** 4 ô nằm ở đầu cột đồ câu theo lưới 2×2 và bám ở đầu cột khi cuộn.
- Bấm một ô để mở **cửa sổ chi tiết** có chiều cao tối đa bằng màn hình; cửa hàng nhiều món và kho nhiều cá chỉ cuộn **bên trong cửa sổ**, không kéo dài trang câu.
- Chọn tiêu đề **ĐÓNG ×**, chạm ngoài cửa sổ hoặc nhấn **Esc** để đóng. Hỗ trợ Tab và không làm Space thả câu/giật cần khi đang mở menu.
- Thời gian câu và nhịp phao tạm dừng trong lúc mở menu để người chơi không vô tình bỏ lỡ một lần cắn khi đang mua đồ; tiếp tục sau khi đóng.

Bốn chức năng tổng quan luôn được nhìn thấy trong màn câu trên thiết bị di động thông thường. Với các điện thoại có chiều cao quá nhỏ, nội dung *chi tiết* của cửa hàng vẫn cần cuộn bên trong hộp thoại; đây là giới hạn hợp lý để nút bấm và chữ không bị thu quá bé.
