# Pixel Art Style Guide — Hanoi Fishing World

**Đã duyệt hướng thẩm mỹ:** **Pixel Art hiện đại, sạch, sáng màu**. Đây là quyết định cuối cùng thay thế lựa chọn phong cách còn mở trong master plan. Toàn bộ **world map** và **lake scene** đều là 2D, không sử dụng 3D/Three.js cho gameplay.

## 1. Art direction

- Góc nhìn: **top-down 2D** (đường viền pixel vuông); không xoay camera hoặc giả lập 3D.
- Thế giới: pixel art thân thiện, màu tươi vừa phải, tương phản cao, dễ phân biệt đường đi, nước, ghế ngồi câu.
- UI: **modern UI + pixel world**: nút chữ dễ đọc, khung góc vuông/pixel shadow, bảng rõ trên desktop/mobile.
- Không dùng font bitmap quá nhỏ cho nội dung dài; font monospace cho counter/badge, font sans-serif cho menu và hướng dẫn.
- Sprite có **pixel edges**: không blur/linear scaling; bật image-rendering: pixelated cho canvas, sprites.
- Gợi ý lưới tiles 16×16 hoặc 32×32, nhân vật 24×32 hay 32×32, tính theo kích thước gốc; không trộn nhiều tỷ lệ vô tổ chức.

## 2. Palette khởi điểm

| Tên | Mã | Dùng cho |
|---|---|---|
| Midnight teal | #0d2530 | nền trang |
| Deep lake | #173942 | card, HUD |
| Mint | #b4e380 | CTA, nhấn |
| Cream | #f7ebc9 | chữ/nền pixel sáng |
| Lake blue | #4bafc1 | hồ nước |
| Grass green | #9bc57e | bờ cỏ |
| Sand | #e6cb8a | bờ câu |
| Gold | #ffd07a | điểm, giờ, tiền ảo |
| Coral | #ff8b78 | phao, cảnh báo |

Luôn kiểm contrast cho văn bản nhỏ và thông báo trạng thái.

## 3. Asset cần sản xuất

- **Nhân vật:** idle, walk bốn hướng, ngồi câu, giật, kéo cá, thắng/thua; biểu cảm tùy chọn.
- **Hồ mẫu Bảy Mẫu:** tileset bờ cỏ/bờ nước/lối đi, cây, ghế, quầy thuê cần, shop mồi, biển “Hồ Bảy Mẫu — Công viên Thống Nhất”, 15 chân đứng câu và khu chờ 30 khán giả.
- **10 cá:** rô phi, rô đồng, diếc, trôi, mè, chép, trắm cỏ, trê, trắm đen, cá quả; mỗi loài có idle/được câu lên/icon inventory; màu viền độ hiếm common/rare/epic.
- **Ba loại cần:** cần tay, cần máy, cần lure; icon kho đồ, trạng thái thả/thu.
- **Map Hà Nội:** icon hồ playable/vắng và chưa mở; labels theo địa danh, không đánh đồng game với quyền câu ngoài đời.

## 4. Sản phẩm online 15 + 30

- 15 fishing spot phải thấy rõ số và trạng thái occupied/free trong scene.
- 30 spectator phải có khu vực riêng để di chuyển, không chồng UI câu của người đang câu.
- Avatar người khác và chat chỉ hiển thị khi backend online thực sự đồng bộ. **Không vẽ người giả rồi ghi số online**.
- Nếu phòng đầy 45 người, cho chọn instance khác. Không có 2 người trên 1 spot.
- UI thời gian: 5 phút đầu miễn phí, sau đó hỏi xác nhận thuê bằng xu game. Giá chính thức chưa duyệt.

## 5. Áp dụng vào code hiện tại

- index.html + styles.css: HUD modern/pixel border và bản đồ Hà Nội minh hoạ.
- app.js: canvas 2D vẽ bằng các khối pixel, nhân vật top-down, 15 spot, 10 loài, ba cần, minigame và thời gian demo.
- Các sprite hiện vẽ procedural bằng Canvas, **chưa phải asset nghệ thuật cuối**.
- Bản demo local không có multiplayer. Master plan nằm tại docs/HANOI_FISHING_2D_MASTER_PLAN.md.
