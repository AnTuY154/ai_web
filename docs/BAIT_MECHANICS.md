# Cơ chế mồi câu và xác suất gặp cá — Hanoi Fishing World

**Đây là mô phỏng phục vụ game**, không phải tỷ lệ câu thật tại Hồ Bảy Mẫu.

## Nguyên lý

Mồi làm thay đổi **xác suất** xuất hiện từng loài, không đảm bảo câu được loài đó. Ngoài mồi còn có độ hiếm, cần câu, khả năng nhận biết phao và canh thanh lực.

- Chọn mồi trước khi thả câu; mồi và cần bị khóa trong lượt câu.
- Lúc một con cá có khả năng ghé mồi, game chọn nhóm độ hiếm trước rồi chọn loài theo **độ hợp mồi**.
- Khi cá thử mồi hoặc cắn, UI **không lộ tên cá hoặc báo cá cắn**; người chơi phải nhìn phao để nhấc cần.
- Nếu người chơi lỡ một cú cắn, phao tự ổn định, gặp cá tiếp theo cũng được chọn từ mồi hiện tại.
- Mồi được cấp miễn phí trong bản demo, chưa có kho mồi tiêu hao.

## Danh sách 7 mồi

| Mồi | Nhóm | Loài ưu tiên | Ý nghĩa |
|---|---|---|---|
| 🪱 Giun đất | Động vật | Rô đồng, Trê, Diếc | Mồi tự nhiên đa dụng |
| 🍚 Bột ngũ cốc | Thực vật | Mè trắng, Trôi, Chép | Bột tạo đám mây thức ăn; riêng mè trắng là cá lọc nước, không hàm ý đớp nguyên viên bột trên lưỡi |
| 🌽 Ngô ngọt | Thực vật | Chép, Trắm cỏ, Trôi | Hợp các loài ăn tạp/ăn thực vật |
| 🌿 Rau non / cỏ | Thực vật | Trắm cỏ, Rô phi, Trôi | Ưu tiên trắm cỏ |
| 🦐 Tép / tôm nhỏ | Động vật | Trê, Rô đồng, Cá quả | Hấp dẫn cá ăn động vật |
| 🐚 Ốc nhỏ | Động vật | Trắm đen, Trê, Chép | Ưu tiên cá trắm đen |
| 🎣 Mồi giả | Mô phỏng mồi sống | Cá quả | Ưu tiên cá săn mồi |

Mọi cá vẫn có xác suất nhỏ xuất hiện với mồi ít phù hợp; bảng chỉ làm thay đổi tỷ lệ, **không bảo đảm** một kết quả.

## Quy tắc xác suất

1. Tỷ trọng ban đầu: phổ biến **70%**, hiếm **25%**, cực hiếm **5%**.
2. Mồi nhân hệ số tác động lên tỷ trọng từng nhóm. Cần máy và cặp cần lure + mồi giả có phần thưởng nhỏ.
3. Chuẩn hóa để tổng tỷ trọng là 100%; chọn nhóm hiếm.
4. Trong nhóm đã chọn, chọn cá bằng bảng **10 loài × 7 mồi** có trọng số dương, bảo đảm mỗi loài vẫn có thể xuất hiện.
5. Đó chỉ là tỷ lệ **gặp cá**, không tính khả năng giật đúng và thắng minigame Space.

Ví dụ mồi ốc tăng cơ hội gặp trắm đen so với ngô; mồi giả tăng cá quả so với bột; rau làm trắm cỏ nổi bật so với tép.

## Tham khảo

- [Missouri Department of Conservation — Bait and Lures](https://mdc.mo.gov/fishing/get-started-fishing/bait-lures): giun là mồi đa dụng; cá chép thường hợp bột/giun; cá da trơn hợp giun và mồi có mùi; mồi giả mô phỏng động vật nhỏ.
- [Missouri Department of Conservation — Catching Grass Carp](https://mdc.mo.gov/improve-your-property/habitat-management/pond-and-stream-management/ponds-fish-frog-management-0): trắm cỏ hợp ngô, bánh mì, giun và nhiều loại mồi thực vật.
- [New York State Department of Environmental Conservation — Carp Fishing Tips](https://extapps.dec.ny.gov/docs/regions_pdf/gocarpn2.pdf): cá chép hợp ngô, giun, bột.
- [Hawaii Division of Aquatic Resources — The Keiki Angler](https://dlnr.hawaii.gov/dar/files/2014/04/keiki_angler.pdf): cá rô phi với bánh mì/bột, cá da trơn với giun.

Tập tính còn phụ thuộc thời tiết, mùa, quần thể và cách chế biến mồi. Bảng trọng số là giả định gameplay, không phải nghiên cứu sinh thái Hồ Bảy Mẫu. Cá mè trắng là cá lọc nước, vì vậy mồi bột tượng trưng cho đám mây mồi thu hút, không khẳng định cá nuốt viên bột trên lưỡi.

## Mã và kiểm thử

- bait-engine.mjs: trọng số 10 loài × 7 mồi, tính xác suất và lấy mẫu ngẫu nhiên.
- app.js: kết nối mồi với con cá được chọn, khóa thay đổi mồi trong lượt câu và gợi ý trước khi câu.
- scripts/bait-engine.test.mjs: test tổng xác suất, tương quan hợp mồi, tính ngẫu nhiên và mô phỏng 10.000 lượt.
- npm run build: kiểm tra, đóng gói module vào dist/ phục vụ bởi Vercel.
