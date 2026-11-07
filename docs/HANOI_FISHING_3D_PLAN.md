# HANOI FISHING WORLD — KẾ HOẠCH GAME 2D ONLINE (v2)

Ngày cập nhật: 2026-11-07. Tài liệu này thay thế định hướng 3D trước đó. Sản phẩm cuối cùng thay thế hoàn toàn hệ landing page cũ; không giữ 50 site trong giao diện/code sản phẩm mới. Giữ lịch sử Git để có khả năng phục hồi.

## 1. Tầm nhìn
Game câu cá multiplayer 2D trên trình duyệt. Màn hình chính là bản đồ 2D toàn Hà Nội, đánh dấu các hồ/đầm/công viên có hồ. Mỗi địa điểm có nhãn rõ ràng, ví dụ 'Hồ Bảy Mẫu — Công viên Thống Nhất'. Chọn địa điểm mở cảnh câu cá 2D riêng, có nhân vật di chuyển và 15 chỗ câu cố định.

## 2. Trải nghiệm người dùng
1. Vào trang chủ, tạo nhân vật/đăng nhập khách, nhìn thấy bản đồ Hà Nội 2D có pan/zoom, tìm kiếm và bộ lọc theo quận/huyện.
2. Chạm marker hồ để xem tên, hình minh họa, trạng thái trực tuyến, số slot trống (ví dụ 8/15), nút 'Vào hồ'.
3. Vào cảnh 2D top-down/isometric (ưu tiên top-down để dễ làm MVP); nhân vật xuất hiện ở cổng/lối vào, di chuyển bằng WASD/phím mũi tên hoặc joystick cảm ứng.
4. Đi đến 1 trong 15 điểm câu quanh bờ; chọn 'Ngồi câu' để giữ slot. Nếu hết chỗ, xem trạng thái đầy và chọn hồ khác hoặc chờ.
5. Chọn cần, mồi, nhấn quăng câu, chờ cá cắn, minigame kéo cá, nhận cá và XP. Rời slot để đi lại; rời hồ thì giải phóng slot.

## 3. Phạm vi bản đồ Hà Nội
Nguồn khởi tạo: data/hanoi-lakes.json (28 địa danh từ bản kế hoạch cũ), cần rà soát địa danh, tọa độ, loại hồ và quyền sử dụng. Mục tiêu là mở rộng danh mục các hồ ở Hà Nội theo nguồn địa lý đáng tin cậy, không tuyên bố đã có đầy đủ tất cả hồ. Cần gắn label tên hồ + tên công viên/khu vực (ví dụ Bảy Mẫu/Thống Nhất), tọa độ, polygon nếu có, ảnh, nguồn, verification_status, map_enabled, game_enabled. Mọi hồ đều có thể là bối cảnh ảo; tuyệt đối không suy diễn hồ ngoài đời được phép câu cá.

## 4. Quy tắc 15 slot
- Mỗi instance/phòng hồ có đúng 15 fishing spots cố định (spot_id 1..15), mỗi spot tối đa một người.
- Server là nguồn chân lý: chiếm slot bằng thao tác atomic/transaction; không cho 2 người chiếm cùng spot.
- Người chơi có thể đứng/di chuyển trong cảnh mà không chiếm slot; câu cá chỉ khi đã chiếm spot.
- Ngắt kết nối: grace period 30 giây để reconnect, sau đó tự nhả slot; rời hồ hoặc đổi spot nhả ngay.
- MVP: một phòng tối đa 15 người đang câu, có thể có người xem nếu giới hạn hiệu năng cho phép; nếu đông hơn, tạo instance mới với 15 slot riêng hoặc hiển thị hàng chờ. UI phải ghi rõ số người/slot theo từng phòng.
- Chống AFK giữ slot: cảnh báo sau 10 phút không thao tác, nhả sau 12 phút (cấu hình được).

## 5. Công nghệ đề xuất
- Frontend: Next.js + TypeScript; bản đồ 2D Leaflet/OpenStreetMap hoặc MapLibre; cảnh game 2D Phaser 3, sprite sheets và tilemaps.
- Backend: Node.js + TypeScript (Colyseus hoặc Socket.IO) quản lý phòng, di chuyển, vị trí, slot, trạng thái câu; xác thực và validation server-side.
- PostgreSQL + Prisma: người chơi, hồ, phòng, điểm câu, cá, vật phẩm, nhật ký giao dịch; Redis cho presence/lock/queue nếu scale.
- Tài sản: tileset 2D, avatar 4 hướng, animation quăng cần/cá cắn/kéo cá. Dữ liệu bản đồ có attribution và tuân thủ chính sách nhà cung cấp tile.

## 6. Mô hình dữ liệu tối thiểu
Lake(id, name, aliases, park_name, district, lat, lng, polygon?, source_url, verification_status, enabled)
LakeScene(lake_id, tilemap_key, spawn_x, spawn_y, water_polygon)
FishingSpot(id, lake_id, index 1..15, x, y, facing, enabled)
LakeRoom(id, lake_id, instance_no, capacity=15, state)
SpotOccupancy(room_id, spot_id, player_id, acquired_at, lease_expires_at) UNIQUE(room_id, spot_id)
Player(id, nickname, avatar, xp, coins, last_seen)
InventoryItem(player_id, item_id, quantity)
Catch(id, player_id, lake_id, fish_id, weight, caught_at)

## 7. Milestones
- Sprint 1 (tuần 1–2): thay app cũ bằng skeleton mới, bản đồ Hà Nội 2D, marker có nhãn, tìm kiếm, nhập/kiểm chứng seed 28 hồ; chọn Bảy Mẫu — Công viên Thống Nhất làm cảnh mẫu.
- Sprint 2 (tuần 3–4): cảnh hồ 2D top-down, nhân vật di chuyển trên desktop/mobile, 15 spot, tương tác câu cá offline.
- Sprint 3 (tuần 5–6): server multiplayer, đồng bộ avatar, chiếm/nhả slot atomic, reconnect, hàng chờ/instance.
- Sprint 4 (tuần 7–8): lưu nhân vật/kho đồ/cá, test 15 người/hồ, chống gian lận cơ bản, beta staging.

## 8. Tiêu chí nghiệm thu MVP
- Bản đồ 2D pan/zoom, tìm kiếm tên hồ và tên công viên; nhấn Bảy Mẫu hiển thị 'Công viên Thống Nhất'.
- Nhấn 'Vào hồ' tải cảnh 2D; avatar di chuyển được bằng WASD và joystick trên điện thoại.
- Có 15 spot được đánh số; người thứ 16 không thể chiếm spot trong cùng phòng.
- 2 client tranh cùng spot: chỉ 1 thành công; ngắt mạng quá grace period thì spot được giải phóng.
- Quăng cần, cá cắn, kéo cá, ghi nhận kết quả; người khác nhìn thấy avatar và trạng thái câu.
- Không tuyên bố các hồ ảo là địa điểm câu cá được cấp phép thực tế.

## 9. Git và triển khai
Người dùng đã xác nhận chuyển đổi hoàn toàn repo ai_web: sản phẩm mới sẽ thay thế 50 landing page, không tạo workspace song song. Thực hiện trên nhánh chuyển đổi, kiểm tra build/test, rồi merge main; không xóa lịch sử Git. Tài liệu này là PLAN, chưa chứng minh game 2D đã triển khai hay deploy.
