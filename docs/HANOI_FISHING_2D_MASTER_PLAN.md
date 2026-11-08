# HANOI FISHING WORLD — MASTER PLAN 2D ONLINE (v3)

**Cập nhật:** 2026-11-08 · **Trạng thái:** kế hoạch thiết kế sản phẩm, chưa phải game đã hoàn thành.

Tài liệu này là nguồn thống nhất thay thế kế hoạch 3D trước đây. **Định hướng đã được chủ dự án chốt:** game trên trình duyệt; bản đồ toàn Hà Nội 2D; chọn hồ mở cảnh chơi 2D có nhân vật di chuyển; mỗi phòng hồ tối đa **15 người câu ở 15 slot riêng** + **30 khán giả trong khu chờ** (= 45 kết nối người chơi); cá dựa vào **may mắn và kỹ năng chung**, không mô phỏng độ sâu; hồ mẫu Bảy Mẫu có **10 loài cá chia độ hiếm**; **3 loại cần**; **5 phút câu đầu miễn phí, sau đó tính phí**.

Các mục ghi “ĐỀ XUẤT” là để chuẩn bị phát triển, chưa được người dùng quyết định mức giá, xác suất hay chi tiết cuối cùng.

## 1. Tầm nhìn và nguyên tắc

- Sản phẩm đích hoàn toàn thay thế chức năng 50 landing page cũ trong repository. Không giữ sản phẩm cũ trong UI hay kiến trúc mới. Giữ Git history/nhánh backup để có thể phục hồi.
- Mở game không cần tải app. Desktop trước, thiết kế đáp ứng cho mobile, điều khiển nhân vật bằng WASD/phím mũi tên hoặc joystick ảo.
- “2D” áp dụng cả thế giới chọn hồ và từng cảnh câu cá. Phong cách **top-down 2D** đề xuất, sprite/tileset và hoạt ảnh đơn giản; không quay lại Three.js/3D khi triển khai.
- Hồ là bối cảnh giả lập; không khẳng định hồ ngoài đời được phép câu, không gán tỷ lệ cá thực tại hồ nếu chưa có khảo sát.
- Tiền game không quy đổi tiền thật, không cá cược/đổi thưởng tiền thật.

## 2. Luồng màn hình

1. Landing/login guest hoặc tài khoản → tạo tên và avatar.
2. **Bản đồ 2D Hà Nội**: kéo/zoom, tìm tên hồ/công viên, filter khu vực, marker; hồ chưa mở gameplay có nhãn “Sắp mở”.
3. Click marker → thẻ thông tin: tên hồ, địa danh phụ, ảnh/ảnh vẽ minh hoạ, online, số slot câu 0–15 còn trống, số người chờ 0–30, nút “Vào hồ”, nếu cần chọn room instance.
4. **Khu chờ 2D của hồ**: người chơi xuất hiện ở điểm spawn, chạy quanh, quan sát cảnh, chat/tương tác; 30 spectator slots.
5. Click/đi đến bờ hồ → **15 vị trí câu cố định** được đánh số; chọn vị trí còn trống để chuyển từ spectator sang angler.
6. Khi chiếm slot → mở giao diện câu, đếm 5 phút miễn phí, chọn cần/mồi, quăng, chờ cắn, mini-game thu cần, nhận cá/điểm/xu.
7. Nhả slot → trở lại khu chờ nếu còn sức chứa, hoặc rời hồ → bản đồ Hà Nội.

**Hồ mẫu ưu tiên:** “Hồ Bảy Mẫu — Công viên Thống Nhất” (tên hồ và tên công viên phải cùng hiện trên map detail và scene). Dùng thử 1 hồ trọn vòng lặp trước khi mở nhiều hồ.

## 3. Dữ liệu Hà Nội và mô hình nội dung

- Seed hiện có: data/hanoi-lakes.json gồm **28 địa danh ứng viên**, chưa đại diện đầy đủ mọi hồ Hà Nội. Tiếp tục đối chiếu theo nguồn GIS/OpenStreetMap/cổng thông tin; tránh tự bịa toạ độ, diện tích, độ sâu.
- Field: lake_id, name, aliases, park_name, area_label, verified_coordinates, shape_geojson, category, images_with_license, source_urls, verification_status, scene_status, display_order, room_count, fish_catalog_id.
- Tách hai khái niệm: location trên **bản đồ thực** và lake scene **2D hư cấu hoá**; không dùng ảnh/tileset chưa có bản quyền.
- Các hồ nội đô là **địa danh mô phỏng trong game**, không phải khuyến nghị câu cá ngoài đời.
- Đích dài hạn là phủ danh mục hồ Hà Nội; chỉ công bố “tất cả hồ” khi hoàn tất kiểm kê, deduplicate và có nguồn dữ liệu.

## 4. Thiết kế một hồ (Bảy Mẫu)

### Không gian

- Top-down map gồm: cổng vào, đường đi, hồ nước, bờ cây, 15 fishing spot được đánh số 1–15 và icon trạng thái.
- Khu chờ có không gian di chuyển tự do (30 người), NPC quản lý hồ, quầy thuê cần/mồi, cửa hàng, bảng thành tích, lối trở về bản đồ Hà Nội.
- Vùng di chuyển và collision: không thể chạy xuyên nước/cây/tường; đứng gần slot mới được tương tác.
- Angler có animation ngồi/đứng, ném cần, chờ, cá cắn, kéo cá, thu cần. Spectator có animation di chuyển, ngồi ghế, chat và emote (emote sau MVP).
- Hiệu ứng âm thanh, gợn nước, phao chuyển động, bong bóng thông báo cá cắn. UI mobile không che slot và nút điều khiển.

### Nhiệm vụ phiên chơi

Vào hồ → xem slot → thuê/chọn dụng cụ → nhận slot → bắt đầu thời gian câu → quăng và kéo → ghi cá, XP, xu → tiếp tục hoặc nhả slot → về bản đồ.

## 5. Online: 15 người câu + 30 khán giả / instance

**Giới hạn cứng mỗi phòng instance (không phải toàn bộ hồ):**
- 15 angler slots, mỗi spot tối đa 1 người, cả người câu nhìn thấy nhau trong scene.
- 30 spectator slots trong khu chờ, nhân vật chạy quanh và quan sát. Không thể quăng cần hoặc nhận cá khi không giữ spot.
- Tổng tối đa 45 tài khoản có mặt tại room tại một thời điểm. Nếu cần nhiều người ở một hồ, mở nhiều instance room-1/room-2…, mỗi instance có 15+30 cap riêng.
- Khi người câu rời spot, spectator có thể xin chuyển sang angler; khi angler rời hồ hoặc người khác chuyển role, server phải cập nhật số đếm của hai vai trò atomically và không vượt cap. Cho phép chờ ưu tiên theo hàng đợi FIFO (**ĐỀ XUẤT**).
- Phòng đầy cả 45 người: người vào nhận danh sách instance khác, có thể vào hàng chờ tổng; không tự chen vào.
- Server authoritative cho movement validation, collision quan trọng, occupancy, timer, kết quả câu, tiền và vật phẩm. 2 yêu cầu chiếm cùng spot chỉ 1 thành công. Không tin kết quả client tự gửi.
- Ngắt kết nối: giữ chỗ 30 giây để reconnect (**ĐỀ XUẤT**), quá hạn trả spot; giảm spam bằng rate limits, idempotency, auth.
- AFK slot: cảnh báo sau 10 phút không hoạt động, nhả sau 12 phút (**ĐỀ XUẤT**, cần cân bằng để không phạt người đang chờ cá hợp lệ).
- Chat trong khu chờ/phòng, mute/report/filter, giới hạn tốc độ chat, bảo vệ tên và thông tin cá nhân.

**Quan trọng:** “phòng chờ 30 khán giả” là một vùng chức năng của cùng instance hồ; họ không tiêu thụ 15 vị trí câu. Mọi vai trò vẫn hiển thị online real-time và mỗi user chỉ được chiếm 1 role ở 1 room.

## 6. Danh mục 10 loài cá hồ Bảy Mẫu (game design, ĐỀ XUẤT)

Không phải kiểm kê cá thật của Hồ Bảy Mẫu. Độ hiếm là tỷ lệ xuất hiện trong trò chơi, không phải mô tả số lượng cá ngoài tự nhiên.

| STT | Loài | Tier | Kiểu gameplay |
|---|---|---|---|
| 1 | Rô phi | Phổ biến | Dễ gặp; dễ kéo |
| 2 | Rô đồng | Phổ biến | Cắn nhanh; thưởng nhỏ |
| 3 | Diếc | Phổ biến | Cắn nhẹ; đòi hỏi bấm đúng lúc |
| 4 | Trôi | Phổ biến | Kéo đều; sức kéo trung bình |
| 5 | Mè trắng | Phổ biến | Khó nhận biết tín hiệu cắn |
| 6 | Chép | Hiếm | Cá khỏe, mini-game thu dây dài hơn |
| 7 | Trắm cỏ | Hiếm | Lực kéo mạnh |
| 8 | Trê | Hiếm | Giằng dây bất chợt |
| 9 | Trắm đen | Cực hiếm | Cá mục tiêu; mini-game khó |
| 10 | Cá quả/cá lóc | Cực hiếm | Ưu tiên thao tác lure, phản xạ nhanh |

**Cơ chế rarity đề xuất:** Phổ biến 70%, hiếm 25%, cực hiếm 5% ở bảng xuất hiện cơ sở; điều chỉnh bằng nhóm mồi, loại cần, sự kiện, nhưng không đảm bảo chắc cá hiếm. Cân bằng tỉ lệ sau dữ liệu playtest. Trọng lượng ảo theo loài, hệ thống cá kỷ lục và sổ sưu tầm.

**Kỹ năng + may mắn:** hai lần random độc lập để quyết định “có cắn” và “loài gì”; người chơi phải phản xạ đúng cửa sổ thời gian, giữ lực dây trong vùng an toàn trong mini-game. Càng hiếm thì cửa sổ phản xạ hẹp và thời gian minigame dài hơn. Không có hệ độ sâu, thành phần nước, nhiệt độ khoa học.

## 7. Ba loại cần câu (ĐỀ XUẤT thông số chi tiết)

1. **Cần tay**: cấp khởi đầu/giá thuê thấp; thao tác đơn giản, ưu thế cá phổ biến, giữ dây dễ; nhược là khó giữ cá lớn.
2. **Cần máy**: cân bằng; có reel/gauge lực kéo, thời gian thu dây linh hoạt; dùng được nhiều loài.
3. **Cần lure**: thao tác chủ động/nhịp bấm để dụ cá, khó hơn; lợi thế săn cá quả và nhóm cá ăn mồi giả.

Mỗi cần có các thuộc tính trong game: level, control, tension_tolerance, bite_window_bonus, reel_speed, upgrade_cost, cosmetic_skin. **Không** thiết kế 1 cần có sức mạnh áp đảo; cùng một loài hiếm có thể câu bằng nhiều loại với xác suất khác nhau.

**Mồi (đề xuất)**: mồi giun, mồi bột, mồi hạt, mồi tôm, mồi giả lure. Mồi khác nhau ảnh hưởng tới bảng xuất hiện cá *trong game*; không đưa ra công thức thực tế như một hướng dẫn hoạt động ở hồ công cộng.

## 8. Thuê chỗ, thuê đồ, tiền ảo

**ĐÃ CHỐT: 5 phút đầu mỗi lượt câu miễn phí, sau đó có thu phí.**

Đề xuất triển khai rõ ràng:
- Thời gian bắt đầu chỉ khi server xác nhận chiếm một trong 15 spots. **Không tính phí khán giả** hoặc thời gian đứng ở khu chờ.
- Lượt miễn phí 5 phút đầu; đồng hồ đếm ngược luôn hiện.
- Hết 5 phút: hiển thị modal “Tiếp tục câu, trả X xu cho Y phút” hoặc “Nhả chỗ”. Không tự động trừ xu trước khi xác nhận.
- Cơ chế **thuê theo gói thời gian** sau mốc 5 phút, đồng hồ hạn sử dụng do server quản lý; hết hạn/chưa đủ xu thì dừng thả câu và trả spot, không trừ xu âm.
- **Chống làm mới 5 phút vô hạn:** free allowance gắn vào player + lake + session, không reset khi đổi spot; cooldown/lượt mỗi ngày **chưa chốt**.
- 3 loại cần có thể dùng vĩnh viễn nếu sở hữu hoặc thuê theo thời gian, mồi có thể mua theo số lượt; phí và giá thuê mặc định bằng **xu trong game**, không tiền thật (trừ khi sau này có quyết định riêng).
- Nguồn xu: cá hợp lệ, nhiệm vụ, quà đăng nhập có hạn mức, thành tích, sự kiện không cá cược. Tiêu xu: thuê vị trí, thuê cần, mua mồi, nâng cấp/cosmetic.
- Không dựng bảng giá cứng khi chủ dự án chưa quyết. Các biến cấu hình: FREE_MINUTES=5, SPOT_RENT_DURATION_MINUTES=?, SPOT_RENT_PRICE_COINS=?, ROD_RENT_PRICE=?, FREE_QUOTA_RESET_POLICY=?.
- Rủi ro cần thử: người mới hết xu; phải đảm bảo có cách chơi miễn phí đủ để phục hồi, không bị khóa tiến trình.

## 9. Kinh tế, hệ thống phụ và UX

- Kho đồ: cần/mồi/cá, số lượng, bán cá nhận xu, trang bị hiện tại.
- Nhiệm vụ ngày: bắt N cá, câu theo loại cần, khám phá hồ; đổi xu/XP.
- Hồ sơ: cấp độ, lịch sử cá, kỷ lục, thành tích, bảng xếp hạng theo hồ.
- Chat/phòng chờ, emote, bảng thông báo ai vừa câu cá hiếm (tắt được), theo dõi bạn bè (hậu MVP).
- Tiện ích hồ: NPC quản lý chỗ thuê, bảng hướng dẫn, shop cần và mồi, khu trưng bày cá và bảng xếp hạng.
- Hỗ trợ mobile: joystick ảo, nút thả/kéo, UI lớn dễ chạm, asset 2D nhẹ.

## 10. Tech plan và data model

Frontend Next.js + React + TS (UI), MapLibre/Leaflet cho bản đồ địa lý 2D (tuân giấy phép OSM/tiles), Phaser 3 cho map tương tác hồ/nhân vật; UI state React.
Backend Node.js TS với Colyseus hoặc Socket.IO/WebSocket; server-authoritative rooms, movement, player roles, timers và kết quả câu.
PostgreSQL + ORM cho Account, Player, Lake, LakeScene, FishSpecies, RodType, Bait, Inventory, Catch, EconomyLedger, Room, FishingSpot và SessionAllowance; Redis khi scale presence, queue và room coordination. Assets sprite sheets/tilemaps trên object storage/CDN.

Constraints:
- LakeRoom(room_id, lake_id, instance, angler_capacity=15, spectator_capacity=30)
- FishingSpot(room_id, spot_no 1..15, state, occupant_player_id nullable) với unique(room_id, spot_no).
- RoomMember(room_id, player_id, role in {angler,spectator}) và unique active(player_id).
- Lease room occupation atomic; authoritative allowances and coin transactions with idempotency keys.
- Log mọi đổi role/thuê/ghi nhận cá; tránh duplicate reward khi reconnect.
- Tick update 10–15 Hz mức mô phỏng di chuyển dự kiến (**ĐỀ XUẤT**), interpolation client; load test tối thiểu 45 kết nối/instance.

## 11. Lộ trình thực hiện (ước lượng 10–12 tuần, phụ thuộc team)

| Sprint | Giai đoạn | Kết quả bắt buộc |
|---|---|---|
| 1 (tuần 1–2) | Replatform + bản đồ Hà Nội | Đổi app cũ thành skeleton game; bản đồ 2D, marker, tìm kiếm, seed lake hợp lệ |
| 2 (tuần 3–4) | Hồ Bảy Mẫu 2D + nhân vật | Cảnh top-down, collision, 15 vị trí, khu chờ, di chuyển desktop/mobile |
| 3 (tuần 5–6) | Câu cá + kinh tế cục bộ | 10 loài, 3 cần, 5 phút free, thuê trả xu, mini-game câu được |
| 4 (tuần 7–8) | Multiplayer authoritative | 15 angler + 30 spectator, đồng bộ, đổi role, chiếm spot atomic, reconnect |
| 5 (tuần 9–10) | Persistence + shop + QA | Tài khoản/kho/cá/xu, an toàn giao dịch, chat moderation, load test |
| 6 (tuần 11–12) | Beta + mở hồ thứ 2 | Tối ưu, sửa lỗi, CI/CD, staging preview; đưa thêm hồ đủ asset |

### Nghiệm thu MVP

- Bản đồ Hà Nội 2D có nhãn “Hồ Bảy Mẫu — Công viên Thống Nhất”, có tìm kiếm và click vào được.
- Scene 2D có avatar, đường đi và 15 vị trí được đánh số.
- Phòng online chứa **15 anglers + 30 spectators**; người thứ 46 không thể vào cùng instance.
- Hai người click cùng spot chỉ một thành công; khán giả không thể quăng câu.
- Có đúng 10 species, ba loại cần, tier độ hiếm; xác suất và kỹ năng mang tính game.
- 5 phút đầu câu miễn phí; hiện đồng hồ và thông báo trả xu sau mốc đó; không trừ tiền khi chưa đồng ý.
- Sau reload/reconnect, kết quả cá, đồ và xu không nhân đôi; rời hồ trả spot đúng.
- Kiểm tra fps/mobile, an toàn data/anti-cheat và chat spam.

## 12. Các quyết định đã chốt và câu hỏi còn mở

- **ĐÃ CHỐT: Pixel Art hiện đại, sạch, màu tươi**, world map và lake scene đều top-down **2D**; UI hiện đại kết hợp đồ hoạ thế giới pixel. Xem [Pixel Art Style Guide](./PIXEL_ART_STYLE_GUIDE.md).
- Phí sau 5 phút: bao nhiêu xu/bao nhiêu phút, và có lựa chọn dừng ngay hay gia hạn tự động (đề xuất chỉ xác nhận thủ công).
- Quy tắc nhận lại 5 phút miễn phí: mỗi lượt/ngày/hồ và cooldown chống exploit.
- Số hồ playable ở launch ngoài Bảy Mẫu; số phòng mở đồng thời và thuật toán chia phòng.
- Có NPC trang trí hay khán giả luôn là người thật (plan mặc định 30 khán giả là người thật).
- Các tỉ lệ cá, chi phí mồi và nâng cấp: dữ liệu thử nghiệm, chưa phê duyệt.

## 13. Triển khai nguyên mẫu và Git

Nhánh trước tên plan/hanoi-fishing-3d là tên lịch sử; kế hoạch chính thức bây giờ là tài liệu này (**2D**). Đã chuẩn bị mã prototype static Pixel Art 2D với bản đồ 28 hồ và một cảnh chơi cục bộ cho Hồ Bảy Mẫu. Bản chơi **chưa có server online**, 15+30 là giới hạn mục tiêu; tiền xu/thuê chỉ là demo, cần thay bằng giao dịch server trước khi ra mắt. Khi bắt đầu lập trình, loại bỏ UI/code 50 landing page cũ từ cây nguồn của sản phẩm mới theo yêu cầu chuyển đổi toàn bộ; không force-push/xóa lịch sử Git.

**Tài liệu liên quan:** data/hanoi-lakes.json (seed hồ); kế hoạch cũ docs/HANOI_FISHING_3D_PLAN.md chỉ còn để chuyển hướng/đọc lịch sử.


## 14. Ghi chú triển khai 2026-11-08

Đã chọn thiết kế **Pixel Art** (không 3D). Bản prototype frontend gồm bản đồ chọn hồ, top-down scene Bảy Mẫu, nhân vật di chuyển, 15 vị trí, minigame 10 loài, ba loại cần và năm phút miễn phí trong phiên demo. Mọi thông số giả lập sẽ được cấu hình ở server sau khi xây multiplayer. Không giới thiệu bản prototype như game online hoàn chỉnh.
