# Hanoi Fishing World · Cơ chế câu phao & kéo lực (Pixel Art 2D)

**Triển khai nguyên mẫu tháng 11/2026.** Bản chơi đơn, xu và kết quả demo local (không phải kết quả server authoritative).

## 1. Cơ chế phao dựa trên quan sát thực tế

Theo [Discover Nature Fishing Instructor Guide của Missouri Department of Conservation](https://education.mdc.mo.gov/sites/default/files/2025-12/Discover-Nature-Fishing-Instructor-Guide-2024-508.pdf) (mục “Bobber Movement”), **phao rung, nhấp nhô** có thể chỉ là cá đang tìm hiểu mồi; **phao đâm xuống hoặc trượt ngang** là tín hiệu cá đã cắn chắc để giật cần. [Take Me Fishing — Traditional Fishing Floats](https://www.takemefishing.org/blog/november-2015/traditional-fishing-floats-the-bobber/) cũng mô tả nhấp, phao biến mất hoặc di chuyển đều như những tín hiệu cần phân biệt.

Trong **game**:
1. Người chơi nhấp vào số chỗ câu để đi tới chỗ ngồi; **màn hình chuyên biệt** mở thay bản đồ.
2. Nhấn **THẢ CÂU** hoặc **Space** (nút cảm ứng trên điện thoại).
3. Phao luôn có dao động theo sóng nhỏ. Trước khi cắn thật xuất hiện **đợt nhấp giả**; giật quá sớm sẽ mất lượt.
4. Sau 4,2–8,1 giây (đề xuất demo), phao có một trong ba tín hiệu: **lặn sâu**, **bị kéo ngang**, hoặc **nổi cao**. Phải bấm **Space đúng trong cửa sổ** khoảng 0,84–1,41 giây (tùy cá và cần).
5. Bấm quá muộn cá bỏ chạy; bấm đúng chuyển sang **giữ lực kéo cá**.

Thời gian và tín hiệu được điều chỉnh để có gameplay vui, không phải mô phỏng khoa học hay quy tắc câu thực tế cho mọi loài.

## 2. Giữ lực như trong các game câu cá

[How to play Fishing World](https://fishing-world-game.com/html/howtoplay.php) mô tả việc điều chỉnh lực kéo: kéo mạnh làm dây căng; buông giúp dây chùng trở lại, cá lớn vùng vẫy. [Adventure Academy Fishing](https://support.adventureacademy.com/hc/en-us/articles/360048271453-How-does-fishing-work) cũng có thao tác giữ/thả để giữ lực trong vùng an toàn.

Trong nguyên mẫu:
- **Giữ Space** (giữ nút trên điện thoại) làm **kim lực tăng**.
- **Thả Space** làm **kim lực giảm**.
- Vùng xanh là vùng chịu lực tốt; quá cao gây đứt dây, quá thấp cá tuột.
- Mỗi loài có thời lượng **5–10 giây**, độ rộng vùng xanh và độ vùng vẫy riêng; độ khó tăng dần theo thứ tự dưới đây.
- Vùng xanh dao động nhẹ theo nhịp vùng vẫy của cá. Chạm màu đỏ một thoáng vẫn có thể cứu; lỗi kéo dài bị mất cá. Kết thúc đủ thời gian mà không giữ ổn định đủ cũng mất cá.
- **Cần tay** cho vùng xanh rộng thêm 3 điểm, **cần máy** làm lực biến đổi dịu hơn và cho thêm thời gian giật, **cần lure** hẹp hơn 2 điểm và cửa sổ giật ngắn hơn.

| Loài | Nhóm | Thời gian | Chiều rộng vùng xanh cơ bản |
|---|---|---:|---:|
| Rô phi | Thường | 5,0 s | 43% |
| Rô đồng | Thường | 5,3 s | 41% |
| Diếc | Thường | 5,6 s | 39% |
| Trôi | Thường | 6,0 s | 37% |
| Mè trắng | Thường | 6,3 s | 35% |
| Chép | Hiếm | 7,0 s | 30% |
| Trắm cỏ | Hiếm | 7,8 s | 27% |
| Trê | Hiếm | 8,1 s | 25% |
| Trắm đen | Cực hiếm | 9,4 s | 20% |
| Cá quả | Cực hiếm | 10,0 s | 18% |

Đây là **tham số thiết kế**, không phải dữ liệu sức kéo thật của từng loài.

## 3. UI/UX

- World map và khu chờ hồ vẫn có 15 spot; click một spot mở riêng **Fishing Station** với khung nhìn phao lớn, tên hồ, số spot, thời gian miễn phí còn lại, chọn cần/mồi, nút câu và bảng lực.
- Trên desktop dùng **Space**; trên mobile giữ nút lớn để tăng lực, nhả để giảm.
- Cảnh báo chuyển động phao và thanh lực có chữ rõ ràng, không chỉ phân biệt bằng màu.
- Bỏ ghế đưa trở lại bản đồ hồ, hủy pha câu hiện tại; đồng hồ miễn phí không reset.

## 4. Cấu trúc và xác nhận

- \`fishing-engine.mjs\`: hàm thuần \`makeFight\`, \`stepFight\`, \`biteConfig\`; không phụ thuộc DOM nên kiểm thử Node được.
- \`app.js\`: kết nối phao Canvas, trạng thái \`idle → waiting → bite → reeling → caught/missed\`, Space + pointer input.
- \`index.html\`/\`styles.css\`: Fishing Station Pixel Art riêng.
- \`scripts/fishing-engine.test.mjs\`: test đơn vị dữ liệu 10 cá, lực khi giữ/thả, cá tuột nếu không kéo, đứt nếu cứ giữ, và kịch bản có kỹ năng câu được cá.
- \`npm run build\`: kiểm tra game, module JS, HTTP assets rồi đóng gói \`dist/\` cho Vercel.

**Hạn chế:** Chưa có đồng bộ nhiều người / server authoritative, thanh toán, lưu lịch sử. Độ khó và thời gian giật sẽ tiếp tục được cân bằng dựa trên chơi thử; không có chế độ auto-catch.
