# Cơ chế mồi câu và xác suất gặp cá — Hanoi Fishing World

**Đây là mô phỏng phục vụ game**, không phải tỷ lệ câu thật tại Hồ Bảy Mẫu.

## Nguyên lý

Mồi làm thay đổi **xác suất** xuất hiện từng loài, không đảm bảo câu được loài đó. Ngoài mồi còn có độ hiếm, cần câu, khả năng nhận biết phao và canh thanh lực.

- Chọn mồi trước khi thả câu; mồi và cần bị khóa trong lượt câu.
- Lúc một con cá có khả năng ghé mồi, game chọn nhóm độ hiếm trước rồi chọn loài theo **độ hợp mồi**.
- Khi cá thử mồi hoặc cắn, UI **không lộ tên cá hoặc báo cá cắn**; người chơi phải nhìn phao để nhấc cần.
- Nếu người chơi lỡ một cú cắn, phao tự ổn định, gặp cá tiếp theo cũng được chọn từ mồi hiện tại.
- Người chơi mới nhận **tổng cộng 50 mồi miễn phí một lần cho mỗi kho lưu trên trình duyệt**, không phải 50 mồi của từng loại. Mỗi lần **thả câu tiêu hao 1 lượt mồi**; thu phao, giật hụt, hoặc cá thoát không hoàn mồi. Nếu chỉ bỏ lỡ cú cắn và chờ cơ hội khác trên cùng lượt thả thì không trừ thêm. Có cửa hàng mua mồi bằng xu ảo.

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

## Kho mồi và cửa hàng (bản triển khai)

Mỗi kho trình duyệt nhận một lần **50 mồi khởi đầu**, chia đủ 7 loại, cùng **50 xu demo**. Đó là quà **một lần trên mỗi hồ sơ lưu trình duyệt**, không phải 50 mồi cho *mỗi loại*.

| Mồi | Miễn phí lúc bắt đầu | Giá xu / lượt | Gặp cá hiếm | Gặp cá cực hiếm |
|---|---:|---:|---:|---:|
| Giun đất | 16 | 1 | 23,5% | 4,0% |
| Bột ngũ cốc | 10 | 2 | 28,0% | 2,1% |
| Ngô ngọt | 8 | 3 | 32,7% | 1,9% |
| Rau non / cỏ | 6 | 3 | 35,8% | 1,6% |
| Tép / tôm nhỏ | 5 | 4 | 28,7% | 6,9% |
| Ốc nhỏ | 3 | 6 | 25,3% | 11,8% |
| Mồi giả | 2 | 8 | 25,6% | 17,2% |
| **Tổng** | **50** | | | |

Các tỷ lệ trong bảng được tính từ **hệ số cân bằng game đang chạy, với cần tay**, và là xác suất gặp cả nhóm độ hiếm; ví dụ 11,8% cực hiếm khi dùng ốc gồm các loài cực hiếm đang được đưa vào hồ, không có nghĩa chắc chắn gặp trắm đen. Cần khác có thể làm các tỷ lệ thay đổi nhẹ. Cửa hàng hiển thị tỷ lệ tính trực tiếp từ hàm xác suất nên luôn khớp luật chơi. **Tỷ lệ gặp không phải tỷ lệ bắt được**: người chơi còn cần giật phao và hoàn thành minigame.

- Mỗi lượt nhấn **THẢ CÂU** có hiệu lực đều dùng 1 mồi thuộc loại đang chọn, ngay tại thời điểm thả; không trừ thêm trong quá trình chờ cùng một lượt.
- **Thu phao / Đổi mồi** và **giật hụt** không hoàn lại mồi đã dùng; người chơi phải thả lượt mới.
- Cửa hàng mua nhanh **1 hoặc 5** mồi, thanh toán bằng xu ảo thu được từ cá. Nếu không đủ xu hoặc mồi hết, nút mua/thả tương ứng sẽ bị vô hiệu hóa.
- Khi hoàn thành cá, xu thưởng và số cá được ghi vào kho; người chơi có thể dùng xu thưởng mua thêm mồi.
- **Mồi giả** cũng tiêu hao **một lượt sử dụng game** mỗi lần thả cho cân bằng cơ chế. Ngoài đời, đa số mồi giả có thể dùng nhiều lần; đây là quy ước gameplay, không phải khuyến nghị về dụng cụ thực.
- Số xu, kho mồi, cá đã bắt và thời gian còn lại được lưu vào **localStorage**. Tải lại trang không tự phát thêm quà tân thủ. Đây chưa phải **hệ thống tài khoản thật**: xóa dữ liệu duyệt web, dùng trình duyệt hoặc thiết bị khác, hoặc tự chỉnh localStorage có thể tạo kho mới hoặc thay đổi số liệu. Cần backend và xác thực để thực sự đảm bảo **50 mồi mỗi tài khoản**.

## Căn cứ sinh học để lựa chọn loại mồi

- [Missouri Department of Conservation — Bait and Lures](https://mdc.mo.gov/fishing/get-started-fishing/bait-lures): giun phổ dụng, bột hợp các loài cá chép, và mồi giả thường mô phỏng cá nhỏ/động vật săn mồi.
- [Florida Fish and Wildlife Conservation Commission — Common Carp](https://myfwc.com/wildlifehabitats/profiles/freshwater/common-carp/): cá chép ăn tạp, mồi ngô, bột, bánh mì và giun phù hợp.
- [Penn State Extension — Grass Carp](https://extension.psu.edu/using-grass-carp-to-control-aquatic-plants): trắm cỏ ưu tiên thức ăn thực vật.
- [U.S. Fish & Wildlife Service — Black Carp](https://www.fws.gov/species/black-carp-mylopharyngodon-piceus): trắm đen lớn ăn chủ yếu ốc và nhuyễn thể.
- [Animal Diversity Web — Channa striata](https://animaldiversity.org/accounts/Channa_striata/): cá quả là loài săn mồi, ăn cá nhỏ, giáp xác và động vật khác.

**Các giá xu, hệ số và tỷ lệ trong game là con số thiết kế phục vụ chơi thử, không phải số liệu xác suất câu cá đo ngoài thực địa.**
