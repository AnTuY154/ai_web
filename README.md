# 50 landing page Next.js cho cửa hàng địa phương

Repository gồm 50 project Next.js độc lập, mỗi cửa hàng nằm trong một thư mục riêng dưới sites/. Các site dùng dữ liệu liên hệ công khai đã kiểm tra trên Google Maps và liên kết về điện thoại, bản đồ hoặc kênh hiện có.

## Cấu trúc

- sites/01-... đến sites/50-...: 50 ứng dụng Next.js độc lập.
- data/stores.json: dữ liệu nguồn.
- design-system/: năm hệ thiết kế theo nhóm ngành.
- templates/: mẫu mã nguồn dùng để tái tạo.
- scripts/generate-sites.mjs: sinh lại toàn bộ project.
- docs/: phương pháp và nguồn nghiên cứu.

## Cài đặt và kiểm tra

    pnpm install
    pnpm run validate
    pnpm run build:all

Chạy một site:

    npm run dev --workspace sites/01-luxury-mobile-vinh-phuc

Mỗi project xuất bản tĩnh vào thư mục out/ tương ứng.

## Danh sách project

| # | Cửa hàng | Ngành | Khu vực | Hệ thiết kế |
|---:|---|---|---|---|
| 01 | [Cửa Hàng ĐTDĐ Luxury Mobile](./sites/01-dtdd-luxury-mobile-vinh) | Điện thoại | Vĩnh Phúc (khu vực cũ) | tech |
| 02 | [Cửa Hàng ĐTDĐ Hoàng Long Smart Phone](./sites/02-dtdd-hoang-long-smart-phone-vinh) | Điện thoại | Vĩnh Phúc (khu vực cũ) | tech |
| 03 | [Click Phone - Vĩnh Yên](./sites/03-click-phone-vinh-yen-vinh) | Điện thoại | Vĩnh Phúc (khu vực cũ) | tech |
| 04 | [Hà Tú Mobile](./sites/04-ha-tu-mobile-hung) | Điện thoại | Hưng Yên | tech |
| 05 | [SEVEN STORE - Thời Trang Nam Basic](./sites/05-seven-store-thoi-trang-nam-basic-bac) | Thời trang nam | Bắc Ninh | fashion |
| 06 | [Tấn Con Shop Thời Trang Nam](./sites/06-tan-con-shop-thoi-trang-nam-bac) | Thời trang nam | Bắc Ninh | fashion |
| 07 | [Cửa Hàng Giày Dép Nguyện Xuyến](./sites/07-giay-dep-nguyen-xuyen-hung) | Giày dép | Hưng Yên | fashion |
| 08 | [Tổng Kho Piano Hà Nội - Nhạc Cụ Minh Đức](./sites/08-tong-kho-piano-ha-noi-nhac-cu-minh-duc-ha) | Nhạc cụ | Hà Nội | creative |
| 09 | [Đồ chơi xe Tự Decal Bắc Ninh](./sites/09-do-choi-xe-tu-decal-bac-ninh-bac) | Phụ kiện ô tô/xe máy | Bắc Ninh | home |
| 10 | [Cửa Hàng Đồ Chơi Trẻ Em Hiểu Khánh](./sites/10-do-choi-tre-em-hieu-khanh-bac) | Đồ chơi trẻ em | Bắc Ninh | lifestyle |
| 11 | [Cửa Hàng Thế Giới Đồ Chơi Thái Thành](./sites/11-the-gioi-do-choi-thai-thanh-bac) | Đồ chơi trẻ em | Bắc Ninh | lifestyle |
| 12 | [Điện hoa - Tiệm hoa tươi Vĩnh Yên](./sites/12-dien-hoa-tiem-hoa-tuoi-vinh-yen-vinh) | Hoa tươi | Vĩnh Phúc (khu vực cũ) | lifestyle |
| 13 | [DC Mobile Store Bắc Ninh - Sửa điện thoại](./sites/13-dc-mobile-store-bac-ninh-sua-dien-thoai-bac) | Điện thoại & sửa chữa | Bắc Ninh | tech |
| 14 | [Ken Mobile](./sites/14-ken-mobile-bac) | Điện thoại | Bắc Ninh | tech |
| 15 | [Cửa Hàng Điện Thoại Di Động Đoài Apple](./sites/15-dien-thoai-di-dong-doai-apple-hung) | Điện thoại | Hưng Yên | tech |
| 16 | [GIẦY DÉP MINH HIẾU](./sites/16-giay-dep-minh-hieu-hung) | Giày dép | Hưng Yên | fashion |
| 17 | [Cửa Hàng Rèm Cửa Thành Thái](./sites/17-rem-cua-thanh-thai-vinh) | Rèm cửa | Vĩnh Phúc (khu vực cũ) | home |
| 18 | [Họa Phẩm Hoàng Quân](./sites/18-hoa-pham-hoang-quan-ha) | Họa phẩm | Hà Nội | creative |
| 19 | [Họa cụ Hana art shop](./sites/19-hoa-cu-hana-art-shop-ha) | Họa phẩm | Hà Nội | creative |
| 20 | [Họa Phẩm Thanh Vân](./sites/20-hoa-pham-thanh-van-ha) | Họa phẩm | Hà Nội | creative |
| 21 | [SA ĐÀ AUDIO](./sites/21-sa-da-audio-ha) | Thiết bị âm thanh | Hà Nội | tech |
| 22 | [Cửa Hàng Gia Dụng Phượng Chúc](./sites/22-gia-dung-phuong-chuc-vinh) | Đồ gia dụng | Vĩnh Phúc (khu vực cũ) | home |
| 23 | [Giầy Dép Minh Phát (Thơm Báu)](./sites/23-giay-dep-minh-phat-thom-bau-hung) | Giày dép | Hưng Yên | fashion |
| 24 | [Công ty TNHH BGHOME Chi nhánh Hưng Yên](./sites/24-bghome-chi-nhanh-hung-yen-hung) | Nội thất | Hưng Yên | home |
| 25 | [Nu-Art Shop - Thế giới họa cụ mới](./sites/25-nu-art-shop-the-gioi-hoa-cu-moi-ha) | Họa phẩm | Hà Nội | creative |
| 26 | [Gumi Pet Shop](./sites/26-gumi-pet-shop-bac) | Thú cưng | Bắc Ninh | lifestyle |
| 27 | [Yêu Thú Cưng](./sites/27-yeu-thu-cung-bac) | Thú cưng | Bắc Ninh | lifestyle |
| 28 | [Cửa Hàng Thú Cưng Petty Bell](./sites/28-thu-cung-petty-bell-bac) | Thú cưng | Bắc Ninh | lifestyle |
| 29 | [Xe Điện Nhật Minh](./sites/29-xe-dien-nhat-minh-bac) | Xe đạp/xe điện | Bắc Ninh | tech |
| 30 | [Đại Lý Xe Đạp Thống Nhất Anh Nghĩa](./sites/30-dai-ly-xe-dap-thong-nhat-anh-nghia-bac) | Xe đạp | Bắc Ninh | tech |
| 31 | [Shop Trang Phục Thể Thao Nam Sport](./sites/31-shop-trang-phuc-the-thao-nam-sport-bac) | Thể thao | Bắc Ninh | fashion |
| 32 | [Tiệm hoa nhà mốc - Hoa Tươi Yên Mỹ](./sites/32-tiem-hoa-nha-moc-hoa-tuoi-yen-my-hung) | Hoa tươi | Hưng Yên | lifestyle |
| 33 | [Shop Hoa Tươi Hồng Hạnh Flower](./sites/33-shop-hoa-tuoi-hong-hanh-flower-hung) | Hoa tươi | Hưng Yên | lifestyle |
| 34 | [Cửa hàng Chăn, ga, gối, đệm Yến Đức](./sites/34-chan-ga-goi-dem-yen-duc-hung) | Chăn ga gối đệm | Hưng Yên | home |
| 35 | [Chăn ga gối đệm Tới Vân](./sites/35-chan-ga-goi-dem-toi-van-hung) | Chăn ga gối đệm | Hưng Yên | home |
| 36 | [Laptop Bắc Giang - Cửa hàng bán lẻ LAPTOP CŨ uy tín tại Bắc Giang - Store 24/7](./sites/36-laptop-bac-giang-cua-hang-ban-le-laptop-bac) | máy tính | Bắc Ninh | tech |
| 37 | [Better Shoes - Cửa hàng giày dép và phụ kiện](./sites/37-better-shoes-cua-hang-giay-dep-va-phu-ki-ha) | giày dép | Hà Nội | fashion |
| 38 | [Bluebirds' Nest](./sites/38-bluebirds-nest-ha) | quà tặng | Hà Nội | creative |
| 39 | [Công Ty TNHH Hòa Bình](./sites/39-hoa-binh-ha) | bán dụng cụ đóng gói | Hà Nội | home |
| 40 | [Cửa Hàng Giày Dép Phong Thúy](./sites/40-giay-dep-phong-thuy-ha) | giày dép | Hà Nội | fashion |
| 41 | [Cửa Hàng Họa Phẩm](./sites/41-hoa-pham-ha) | họa phẩm | Hà Nội | creative |
| 42 | [Gấu Bông Online Hà Nội 994 Đường Láng](./sites/42-gau-bong-online-ha-noi-994-duong-lang-ha) | quà tặng | Hà Nội | creative |
| 43 | [Max iStore ( Điện Thoại Thông Minh )](./sites/43-max-istore-dien-thoai-thong-minh-ha) | điện thoại di động | Hà Nội | tech |
| 44 | [Sea Phone](./sites/44-sea-phone-ha) | điện thoại di động | Hà Nội | tech |
| 45 | [Cửa Hàng Điện Thoại Huy Hoàng Mobile](./sites/45-dien-thoai-huy-hoang-mobile-hung) | điện thoại di động | Hưng Yên | tech |
| 46 | [Hệ thống cửa hàng điện thoại di động TĐ PHONE | EMPIRE](./sites/46-he-thong-cua-hang-dien-thoai-di-dong-td-ph-hung) | bán đồ điện tử | Hưng Yên | tech |
| 47 | [Thiện Táo - Cửa hàng điện thoại di động](./sites/47-thien-tao-cua-hang-dien-thoai-di-dong-hung) | điện thoại di động | Hưng Yên | tech |
| 48 | [Shop Guitar Vĩnh Phúc](./sites/48-shop-guitar-vinh-phuc-vinh) | nhạc cụ | Vĩnh Phúc | creative |
| 49 | [Trung Tâm Nhạc Cụ Vĩnh Phúc](./sites/49-trung-tam-nhac-cu-vinh-phuc-vinh) | nhạc cụ | Vĩnh Phúc | creative |
| 50 | [Hạnh Shop - Gói quà nghệ thuật](./sites/50-hanh-shop-goi-qua-nghe-thuat-ha) | quà tặng | Hà Nội | creative |

## Nguyên tắc dữ liệu

Không tự tạo giá, tồn kho, đánh giá, chứng nhận hoặc chính sách. Nội dung yêu cầu khách xác nhận trực tiếp trước khi mua. Nghiên cứu riêng nằm trong MARKET_RESEARCH.md của từng project.
