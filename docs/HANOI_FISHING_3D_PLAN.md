# HANOI FISHING WORLD — kế hoạch chuyển đổi sang web game câu cá 3D

**Trạng thái:** Đề xuất / planning only · **Ngày rà soát:** 2026-11-07 · **Phạm vi:** game câu cá trực tuyến 3D trong trình duyệt, lấy cảm hứng từ hồ tại Hà Nội.

> Repo này hiện là monorepo chứa 50 landing page Next.js. Nhánh kế hoạch **không xóa, đổi tên hay sửa** bất kỳ site đang tồn tại. Chỉ triển khai việc thay thế cấu trúc sau khi xác nhận đây đúng repo đích; triển khai từng bước bằng PR và khả năng rollback.

## 1. Tầm nhìn và định vị

- **Fantasy:** Lựa chọn hồ Hà Nội trên bản đồ, vào bối cảnh 3D, ngắm cảnh, thả câu, cảm nhận lực kéo khi cá cắn, thu thập cá và chơi cùng bạn bè.
- **Đối tượng:** người chơi casual VN trên desktop/mobile; phiên chơi 5–20 phút; không cần tải game.
- **Đặc trưng:** hồ Việt Nam được tái hiện có chủ đích (không cam kết mô phỏng địa hình chính xác 1:1); vòng lặp câu cá dễ học, nâng cấp dụng cụ, bộ sưu tập, bảng thành tích theo hồ.
- **Phân biệt:** đây là **game câu cá ảo**, không phải bản đồ hướng dẫn câu cá ngoài đời. Không gắn nhãn "được phép câu" cho địa điểm thực khi chưa xác minh. Không cho phép cá cược/đổi thưởng tiền thật.

## 2. Phạm vi sản phẩm

### MVP — chơi đơn trên web
1. Màn hình chọn hồ + thông tin bối cảnh; phân biệt rõ hồ trong game và địa danh thực tế.
2. Một scene 3D hoàn chỉnh: **Đồng Mô** (bờ nước, cây, đảo xa, ngày/đêm đơn giản).
3. Camera orbit/chế độ nhìn thứ nhất; click/tap chọn hướng và lực quăng cần.
4. Chu trình mô phỏng hữu hạn: `idle → aiming → casting → waiting → bite → reeling → caught/escaped`.
5. Ít nhất 5 **loài cá hư cấu hóa theo gameplay**; không khẳng định mật độ/loài sống thực ở một hồ cụ thể.
6. Thanh sức căng dây + mini-game kéo cá; luật rơi cá minh bạch, seed ở server khi online.
7. Kho đồ, tiền tệ **chỉ trong game**, nhiệm vụ, lịch sử bắt cá, cài đặt đồ họa & âm thanh.
8. Hỗ trợ bàn phím/chuột và màn hình cảm ứng; chế độ giảm chuyển động và chất lượng đồ họa thấp.

### Online v1
1. Tài khoản/guest, hồ sơ, lưu tiến độ.
2. Phòng 6–12 người theo từng hồ, nhìn thấy avatar và thao tác câu của nhau.
3. Máy chủ xác thực vật phẩm, xác suất cá cắn, kết quả câu, thưởng; chống spam và replay.
4. Chat có lọc từ/ẩn/báo cáo và rate limit; không mặc định hiển thị dữ liệu cá nhân.
5. Leaderboard theo mùa, sự kiện câu cá không dùng tiền thật.

### Sau MVP
- Hồ Suối Hai, Quan Sơn, Đồng Đò, Đồng Quan; hệ thời tiết, thuyền, thách đấu và giải cộng đồng.
- Chế độ chụp ảnh, kể chuyện lịch sử/địa lý của mỗi hồ, hỗ trợ localization.
- Không thêm bản đồ hồ nội đô với thương hiệu/di tích chính xác khi chưa hoàn thành kiểm tra pháp lý, giấy phép asset.

## 3. Kiến trúc đề xuất

- **Frontend:** Next.js + React + TypeScript; **Three.js / React Three Fiber / Drei** cho scene và camera; Zustand cho state gameplay UI.
- **Gameplay:** package logic TypeScript dùng chung client/server (`packages/game-core`), state machine có test; physics đơn giản theo quăng cần và dây câu, tránh mô phỏng nước vật lý nặng.
- **Online:** Node.js server authoritative + WebSocket (có thể dùng Colyseus); room snapshot/throttle, client interpolation, reconnect và idempotency.
- **Dữ liệu:** PostgreSQL cho user/inventory/catch, Redis tùy tải cho room/presence, object storage/CDN cho GLB/KTX2/audio.
- **Nội dung:** `data/hanoi-lakes.json` là seed có source và trạng thái xác minh, không phải danh sách điểm câu thực tế.
- **Asset:** terrain low-poly/stylized, model cá GLB, water shader hạn chế overdraw; texture KTX2, mesh compression, LOD, culling.
- **Triển khai:** web CDN/edge và game server container ở khu vực có độ trễ phù hợp người chơi Việt Nam; GitHub Actions lint → typecheck → tests → build → preview → release.

### Cấu trúc mã nguồn đích (chưa tạo trong PR lập kế hoạch)

```text
apps/
  web/               # Next.js: chọn hồ, profile, inventory, UI
  game-server/       # WS room + simulation authoritative
packages/
  game-core/         # casting, bite, reeling, RNG, validation
  game-scenes/       # R3F lakes, assets & performance presets
  lake-data/         # schema + import/validation of JSON
  ui/                # components
data/hanoi-lakes.json
docs/HANOI_FISHING_3D_PLAN.md
```

## 4. Data model hồ và quy trình biên tập

Mỗi hồ: `id`, `name`, `area`, `category`, `scene_priority`, `visual_motifs`, `sources[]`, `evidence_status`, `real_world_fishing`.
- `evidence_status: verified_place`: tồn tại và vị trí khu vực có nguồn; **không** xác thực độ sâu, lượng cá hoặc được phép câu.
- `evidence_status: historical_list_needs_recheck`: có trong danh sách lịch sử của TP Hà Nội, cần đối chiếu OpenStreetMap/địa giới hiện hành trước khi gắn GPS.
- Tách 3 bảng sau: `lakes`, `scene_configs`, `fish_spawn_rules`. **Không** gán dữ liệu cá game thành số liệu sinh học thực.
- Không đưa tọa độ suy đoán vào seed; geocode, kiểm polygon/centroid và nguồn GIS có giấy phép khi dựng map.
- Cơ chế `last_verified_at`, `source_url`, `editor_notes`; lịch kiểm tra mỗi 6 tháng.
- Sau điều chỉnh hành chính 2025, trường `area` mô tả **khu vực thường gọi**, không dùng làm địa chỉ hành chính chính thức.

## 5. Lộ trình triển khai (ước lượng 8 tuần, tùy nguồn lực)

| Tuần | Deliverable | Điều kiện hoàn thành |
| --- | --- | --- |
| 1 | xác định repo, dựng workspace & CI, schema hồ, wireframe | pnpm install/build + validate data chạy sạch |
| 2 | cảnh 3D Đồng Mô + điều khiển camera/thiết lập đồ họa | tải scene được trên desktop/mobile; không crash |
| 3 | casting, phao/dây, finite state machine, bite & reeling | game loop chơi được từ đầu đến cuối; unit tests |
| 4 | UI chọn hồ, inventory, UX mobile, âm thanh, truy cập | save progress cục bộ; trải nghiệm 5 phút |
| 5 | backend profile + server-authoritative catch, persistence | API/WS có validation, tests, log |
| 6 | online room và avatar, đồng bộ, reconnect, anti-abuse | 6–12 người/phòng trong test staging |
| 7 | tối ưu scene, perf, accessibility, QA | mục tiêu 60 FPS desktop / 30 FPS mobile tầm trung; đo thực tế |
| 8 | closed beta, bugfix, analytics và release | checklist bảo mật, lỗi nghiêm trọng = 0 |

**Lưu ý:** 8 tuần là roadmap đề xuất, không phải cam kết tiến độ nếu chưa biết đội ngũ/asset/hạ tầng.

## 6. Backlog theo mức ưu tiên

**P0**: repo/CI, scene loader, scene Đồng Mô, máy trạng thái quăng câu, quỹ đạo phao, câu cá, inventory, seed lake, tối ưu đồ họa mobile, analytics lỗi.

**P1**: backend authoritative, đăng nhập guest, profile, đồng bộ room, leaderboard, rate limiting, admin quản lý dữ liệu hồ/đồ vật.

**P2**: nhiều hồ, thời tiết, câu thuyền, hiệu ứng ngày/đêm nâng cao, giải đấu, ảnh chụp, social features.

## 7. Tiêu chí kiểm thử / vận hành

- Logic gameplay có unit test cho trạng thái hợp lệ, timeout, thưởng, random seed và trường hợp mất kết nối.
- Security: không tin số cá/đồ do client gửi; input validation, auth/authorization, anti-replay, rate limiting WS, chat moderation.
- Perf: telemetry FPS, WebGL fallback 2D, preset Low/Medium/High, lazy-load từng scene; đánh giá trên thiết bị thật.
- Accessibility: điều khiển bằng keyboard, contrast, phụ đề cho thông báo âm thanh, reduce-motion.
- Analytics: `scene_load_success`, `cast_started`, `bite_triggered`, `catch_result`, `session_end`; không thu dữ liệu nhạy cảm không cần thiết.

## 8. Rủi ro và quyết định

1. **Repo chưa xác nhận:** `ai_web` hiện chứa 50 landing page; PR này chỉ là **đề xuất**, không được merge/migrate toàn repo khi chưa xác nhận.
2. **Pháp lý/địa điểm:** mô phỏng hồ **không** đồng nghĩa được câu thực; ví dụ chính quyền Tây Hồ xử lý hành vi câu cá trái phép tại hồ Tây.
3. **Số liệu địa lý:** ranh giới, diện tích, sâu, loài cá, GPS cần nguồn GIS hoặc khảo sát; tuyệt đối không dựng như sự thật khi chưa kiểm.
4. **Bản quyền:** không sử dụng ảnh từ trang tin làm texture/game asset nếu không có phép; tài sản 3D tự sản xuất hoặc có giấy phép thương mại.
5. **Chi phí multiplayer:** thiết lập phòng giới hạn trước khi scale; tính chi phí hosting, CDN, storage, DB và moderation sau khi có usage thực.
6. **Thiết bị yếu:** một hồ đẹp chơi mượt quan trọng hơn mở 20 hồ cùng lúc.

## 9. Nguồn tham khảo chính

- Danh sách hồ Hà Nội (cổng TP, thông tin lịch sử): https://hanoi.gov.vn/dia-danh/ho-o-ha-noi-4241009161825854.htm
- Hồ Tây & Trúc Bạch (Sở VHTT Hà Nội): https://sovhtt.hanoi.gov.vn/gioi-thieu/ha-noi-thu-do-viet-nam/
- Đồng Mô (nguồn quy hoạch khu vực): https://datafiles.hanoi.gov.vn/gov-hni/7045/VanBan/2026/4/8/01%20DA-UBND.pdf
- Suối Hai (Sở VHTT Hà Nội): https://sovhtt.hanoi.gov.vn/ho-suoi-hai-dep-tho-mong-duoi-chan-nui-ba-vi/
- Quan Sơn (Ủy ban Nhà nước về NVNONN): https://scov.gov.vn/dat-nuoc-con-nguoi/ho-quan-son-ve-dep-hoang-so.html
- Đồng Quan (Hà Nội): https://vqh.hanoi.gov.vn/index.php?language=vi&nv=news&op=tin-lien-ket%2Fha-noi-duyet-nhiem-vu-quy-hoach-5-phan-khu-do-thi-soc-son-1987.html
- Đồng Đò, Kèo Cà (Hà Nội): https://hanoi.gov.vn/dan-hoi-ubnd-thanh-pho-tra-loi/cau-hoi-de-nghi-ubnd-thanh-pho-chi-dao-co-quan-chuc-nang-kiem-tra-toan-dien-cac-du-an-lien-quan-den-chuyen-doi-muc-dich-su-dung-rung-phong-ho-tai-xa-soc-son-425091809564987.htm
- Quản lý câu cá trái phép hồ Tây: https://tayho.hanoi.gov.vn/an-ninh-quoc-phong/chung-tay-giu-gin-ho-tay-xanh-sach-dep-hay-noi-khong-voi-boi-loi-phong-sinh-xa-rac-cau-ca-danh-bat-thuy-san-bat-hop-phap-tren-ho-tay-2697251013153954728.htm

**Bước triển khai tiếp theo nếu xác nhận repo đúng:** tạo workspace game ở nhánh feature riêng, phát hành demo 1 hồ trước, giữ nguyên 50 landing page đến lúc kế hoạch migrate được duyệt.
