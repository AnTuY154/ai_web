# Hanoi Fishing World · Câu phao & canh Space theo nhịp (Pixel Art 2D)

**Triển khai nguyên mẫu tháng 11/2026.** Bản chơi đơn, xu và kết quả demo local (không phải kết quả server authoritative).

## 1. Đọc phao như ngoài đời: KHÔNG HIỆN CẢNH BÁO CÁ CẮN

**Quy tắc trải nghiệm:** khi thả câu, game KHÔNG hiển thị chữ “CÁ CẮN”, popup, âm báo, nút đổi màu hay trạng thái HUD khác biệt. Người chơi tự nhận ra cắn thật nhờ chuyển động phao, nhấn **Space** hoặc **NHẤC CẦN**. Không có đồng hồ đếm đến khi cắn.

**Các nguồn tham khảo:**
- [California Department of Fish and Wildlife — F.I.S.H. Handbook](https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=28748): phao có thể rung, chuyển ngang, nằm nghiêng; không nhất thiết chìm.
- [Mississippi Department of Wildlife, Fisheries and Parks — Sinkers and Bobbers](https://www.mdwfp.com/sites/default/files/2024-06/Sinkers%20and%20Bobbers%20_%20Revised%2012.20.19.pdf): tư thế phao còn phụ thuộc cách mắc phao/chì; phao nằm ngang không mặc nhiên là cá cắn.
- [Take Me Fishing — How to Fish](https://www.takemefishing.org/getmedia/1212b64d-4fbf-4f99-ae9e-7565a4c477eb/How-to-Fish-Tailored-Tackle-Take-Me-Fishing-Book.pdf): phao đổi hướng đột ngột, chìm hoặc kéo ngang có thể báo cá ăn.
- [Lake & Lines — Missing Bites](https://www.lakeandlines.co.uk/guides/missing-bites-float-fishing): phải phân biệt gió, nhấp nhẹ, cú kéo ngang bền, phao nổi lên (*lift bite*) và giật quá sớm.

**Mô phỏng Hồ Bảy Mẫu:**

| Quan sát phao trong video được người chơi mô tả | Ý nghĩa và xử lý | Mô phỏng trong game |
|---|---|---|
| Rung lăn tăn | Cá thăm dò, gió hoặc sóng; **chờ** | Phao dao động nhỏ theo sóng, có lúc bị va nhẹ |
| Nhấp **nhanh, liên tục nhưng nông** | Có thể cá nhỏ rỉa mồi; thử mồi to | Các nhịp *nibble* nhanh và nông; mồi giun/bột/tép có thể có nhiều hơn mồi to như ngô/ốc |
| **Chìm xuống rồi nổi lại** | Cá chưa ngậm chắc; **chờ** | *Dip-return* giả: chóp phao hạ sâu trong chốc lát rồi trở về |
| **Chìm dứt khoát và duy trì** | Có thể cá ngậm mồi; **nhấc cần** | *Dive* thật: đầu phao chìm khuất dưới mặt nước |
| **Chạy ngang có hướng, liên tục** | Cá mang mồi đi; **nhấc cần** | *Slide* thật: phao dịch chuyển xa, không bật về ngay |
| **Trồi cao, nằm nghiêng** | Cá có thể nâng mồi/chì; **nhấc cần** | *Lift* thật: phao nhô cao, thân nghiêng về một phía |
| **Đứng im rất lâu** | Có thể thiếu cá hoặc sai độ sâu; kiểm tra lại | Thỉnh thoảng có quãng chờ dài; có nút **THU PHAO / ĐỔI MỒI** không bị tính là giật hụt |

### Cân chỉnh phao và chì

Theo ví dụ người dùng tóm tắt từ video, phao quá to hoặc chì quá nhẹ có thể làm tín hiệu khó quan sát. Bản demo mặc định dùng **phao được cân nổi thấp**, phần thân nằm dưới mặt nước, chỉ một phần chóp màu nhô lên. Canvas **che phần phao ở dưới mặt nước**: những cú nhấp nông, chìm giả rồi hồi lên, chìm thật, nổi cao đều có khác biệt trực quan.

**Giới hạn hiện tại:** chưa có thanh điều chỉnh cỡ phao, lượng chì hoặc độ sâu riêng trong UI. Nút thu phao cho phép đổi mồi/cần, rồi thả lại; khuyến nghị về chì/độ sâu trong sổ tay là kiến thức câu thật.

**Thời gian chỉ để cân bằng game:** một cú cắn thường xuất hiện sau khoảng 6,2–15,2 giây, đôi khi chậm hơn khoảng 8 giây nữa; chuyển động nhỏ trước đó cũng không cố định, số lần va mồi thay đổi. Khung giật khoảng 1,5–1,8 giây, đủ nhìn và phản xạ; không ám chỉ thời gian mắc cá thực tế. Nếu không giật, phao sẽ yên lại trong im lặng, rồi tiếp tục chờ cơ hội mới trong cùng lượt thả. Chỉ khi nhấc cần, game mới xác nhận có mắc cá hoặc giật hụt.

**Hạn chế mô phỏng:** dấu hiệu phao thực tế còn phụ thuộc loại phao, chì, độ sâu, gió và loài cá. Game mô phỏng nguyên tắc quan sát, không khẳng định 100% hình thái cắn của một loài cá cụ thể.

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
- **Không có chữ cảnh báo chuyển động phao lúc cá cắn**. Chỉ phần thanh lực hiện ra khi đã giật đúng và mắc cá; sổ tay tĩnh có thể mở khi muốn học.
- Bỏ ghế đưa trở lại bản đồ hồ, hủy pha câu hiện tại; đồng hồ miễn phí không reset.

## 4. Cấu trúc và xác nhận

- \`fishing-engine.mjs\`: hàm thuần \`makeFight\`, \`stepFight\`, \`strikeFight\`, \`biteConfig\`; không phụ thuộc DOM nên kiểm thử Node được.
- \`app.js\`: kết nối phao Canvas, trạng thái \`idle → waiting → bite → reeling → caught/missed\`, Space + pointer input.
- \`index.html\`/\`styles.css\`: Fishing Station Pixel Art riêng.
- \`scripts/fishing-engine.test.mjs\`: test đơn vị cho 10 cá, kim tự chạy hai chiều, chống spam nhịp, giới hạn 4 lần bấm hụt và kịch bản điều khiển đúng nhịp thắng tất cả cá.
- \`npm run build\`: kiểm tra game, module JS, HTTP assets rồi đóng gói \`dist/\` cho Vercel.

**Hạn chế:** Chưa có đồng bộ nhiều người / server authoritative, thanh toán, lưu lịch sử. Độ khó và thời gian giật sẽ tiếp tục được cân bằng dựa trên chơi thử; không có chế độ auto-catch.
