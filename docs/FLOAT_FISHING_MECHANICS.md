# Hanoi Fishing World · Câu phao & canh Space theo nhịp (Pixel Art 2D)

**Triển khai nguyên mẫu tháng 11/2026.** Bản chơi đơn, xu và kết quả demo local (không phải kết quả server authoritative).

## 1. Cơ chế phao dựa trên quan sát thực tế

Theo [Discover Nature Fishing Instructor Guide của Missouri Department of Conservation](https://education.mdc.mo.gov/sites/default/files/2025-12/Discover-Nature-Fishing-Instructor-Guide-2024-508.pdf) (mục “Bobber Movement”), **phao rung, nhấp nhô** có thể chỉ là cá đang tìm hiểu mồi; **phao đâm xuống hoặc trượt ngang** là tín hiệu cá đã cắn chắc để giật cần. [Take Me Fishing — Traditional Fishing Floats](https://www.takemefishing.org/blog/november-2015/traditional-fishing-floats-the-bobber/) cũng mô tả nhấp, phao biến mất hoặc di chuyển đều như những tín hiệu cần phân biệt.

Trong **game**:
1. Người chơi nhấp vào số chỗ câu để đi tới chỗ ngồi; **màn hình chuyên biệt** mở thay bản đồ.
2. Nhấn **THẢ CÂU** hoặc **Space** (nút cảm ứng trên điện thoại).
3. Phao luôn có dao động theo sóng nhỏ. Trước khi cắn thật xuất hiện **đợt nhấp giả**; giật quá sớm sẽ mất lượt.
4. Sau 4,2–8,1 giây (đề xuất demo), phao có một trong ba tín hiệu: **lặn sâu**, **bị kéo ngang**, hoặc **nổi cao**. Phải bấm **Space đúng trong cửa sổ** khoảng 0,84–1,41 giây (tùy cá và cần).
5. Bấm quá muộn cá bỏ chạy; bấm đúng chuyển sang **minigame kim tự chạy ngang**.

Thời gian và tín hiệu được điều chỉnh để có gameplay vui, không phải mô phỏng khoa học hay quy tắc câu thực tế cho mọi loài.

## 2. Thanh lực ở chính giữa màn hình, kim chạy qua lại

Phiên bản được chủ dự án xác nhận sử dụng **cơ chế bấm Space theo nhịp** (khác với kiểu giữ/thả lực của Fishing World và Adventure Academy). Sau khi giật phao đúng thời điểm:

- Một **bảng Pixel Art nổi cố định ở giữa viewport** xuất hiện trên nền hồ được làm tối nhẹ, vẫn thấy nước phía sau.
- Một **kim sáng tự di chuyển từ trái sang phải, đến biên lại quay về trái**, không phụ thuộc việc đang giữ phím.
- **Bấm Space mỗi lần kim chạm vùng xanh** để ghi một nhịp. Giữ Space không tự ghi thêm nhịp; mỗi lần quét chỉ tính tối đa một điểm.
- **Bấm ngoài vùng xanh** là trượt. **4 lần trượt** thì cá thoát. Không đạt đủ nhịp trước khi đồng hồ **5–10 giây** hết cũng mất cá.
- Đạt đủ nhịp và hết thời gian thì bắt được cá. Vùng xanh có dao động nhẹ để tạo thử thách; cá càng khó, **kim càng nhanh, vùng xanh càng hẹp, cần nhiều nhịp hơn và thời gian dài hơn**.
- Trên điện thoại, **chạm từng nhịp** vào nút **BẤM ĐÚNG NHỊP** ở chính giữa màn hình thay cho Space.

| Loài | Nhóm | Thời gian | Độ rộng xanh cơ bản | Vận tốc kim (điểm/s) | Số nhịp cần |
|---|---|---:|---:|---:|---:|
| Rô phi | Thường | 5,0 s | 43% | 78 | 2 |
| Rô đồng | Thường | 5,3 s | 41% | 84 | 2 |
| Diếc | Thường | 5,6 s | 39% | 88 | 3 |
| Trôi | Thường | 6,0 s | 37% | 92 | 3 |
| Mè trắng | Thường | 6,3 s | 35% | 96 | 3 |
| Chép | Hiếm | 7,0 s | 30% | 105 | 4 |
| Trắm cỏ | Hiếm | 7,8 s | 27% | 113 | 4 |
| Trê | Hiếm | 8,1 s | 25% | 122 | 5 |
| Trắm đen | Cực hiếm | 9,4 s | 20% | 134 | 6 |
| Cá quả | Cực hiếm | 10,0 s | 18% | 145 | 7 |

**Hiệu ứng cần:** cần tay rộng vùng xanh thêm 3 điểm; cần máy làm kim chạy chậm ~8%; lure nhanh ~6% và thu hẹp vùng xanh 2 điểm. Đây là thông số balance game để chơi thử, không phải sức kéo sinh học.

## 3. UI/UX

- World map và khu chờ hồ vẫn có 15 spot; click một spot mở riêng **Fishing Station** với khung nhìn phao lớn, tên hồ, số spot, thời gian miễn phí còn lại, chọn cần/mồi, nút câu và bảng lực.
- Trên desktop bấm **Space từng nhịp**; trên mobile chạm nút lớn **BẤM ĐÚNG NHỊP**. Thanh lực luôn ở **giữa viewport**, cả trên mobile.
- Cảnh báo chuyển động phao và thanh lực có chữ rõ ràng, không chỉ phân biệt bằng màu.
- Bỏ ghế đưa trở lại bản đồ hồ, hủy pha câu hiện tại; đồng hồ miễn phí không reset.

## 4. Cấu trúc và xác nhận

- \`fishing-engine.mjs\`: hàm thuần \`makeFight\`, \`stepFight\`, \`strikeFight\`, \`biteConfig\`; không phụ thuộc DOM nên kiểm thử Node được.
- \`app.js\`: kết nối phao Canvas, trạng thái \`idle → waiting → bite → reeling → caught/missed\`, Space + pointer input.
- \`index.html\`/\`styles.css\`: Fishing Station Pixel Art riêng.
- \`scripts/fishing-engine.test.mjs\`: test đơn vị cho 10 cá, kim tự chạy hai chiều, chống spam nhịp, giới hạn 4 lần bấm hụt và kịch bản điều khiển đúng nhịp thắng tất cả cá.
- \`npm run build\`: kiểm tra game, module JS, HTTP assets rồi đóng gói \`dist/\` cho Vercel.

**Hạn chế:** Chưa có đồng bộ nhiều người / server authoritative, thanh toán, lưu lịch sử. Độ khó và thời gian giật sẽ tiếp tục được cân bằng dựa trên chơi thử; không có chế độ auto-catch.
