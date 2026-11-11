# Smart Room IoT

Smart Room IoT là hệ thống giám sát nhiệt độ, độ ẩm, ánh sáng và điều khiển hai LED qua ESP8266. Dữ liệu được truyền bằng MQTT, lưu trong SQLite và hiển thị trên giao diện web sử dụng HTML, CSS, JavaScript thuần. Backend được xây dựng bằng Spring Boot.

Dự án được thực hiện cho bài tập lớn môn IoT. [Báo cáo cuối cùng](frontend/documents/LeDucMinh-B23DCAT193-IOT.pdf) trình bày sơ đồ mạch, thiết kế dữ liệu và các luồng xử lý.

## Chức năng

- Dashboard hiển thị số đo mới nhất, biểu đồ, trạng thái kết nối và trạng thái hai LED.
- Trang lịch sử cho phép lọc dữ liệu cảm biến và thao tác bật/tắt.
- Trang Người dùng hỗ trợ cập nhật hồ sơ, đổi mật khẩu, lưu liên kết dự án và tải báo cáo PDF.
- Lịch sử điều khiển ghi nhận `PENDING`, `SUCCESS` và `FAILED`. Công tắc chỉ cập nhật sau khi ESP8266 xác nhận trạng thái thực tế.

| Thành phần | Công nghệ / kết nối |
| --- | --- |
| Giao diện | HTML, CSS, JavaScript; Chart.js cho biểu đồ |
| Backend | Java 17+, Spring Boot 3.5.6, REST API |
| Lưu trữ | SQLite tại `backend/data/smartroom.db` |
| Truyền dữ liệu | MQTT broker trên cổng `1884` |
| Mạch | ESP8266; DHT11 ở D2; cảm biến ánh sáng ở A0; LED quạt ở D6; LED đèn ở D7 |

Ba LED tại D0, D1 và D5 được lắp dự phòng, chưa có chức năng điều khiển trên web. Cảm biến ánh sáng cung cấp giá trị ADC trong khoảng `0–1023`; hệ thống không quy đổi sang lux.

## Yêu cầu và khởi chạy

Môi trường chạy gồm Java 17 trở lên, Maven 3.9 và MQTT broker tại cổng `1884`. Với Mosquitto cài qua Homebrew, broker có thể khởi động trong một Terminal riêng:

```bash
mosquitto -c /opt/homebrew/etc/mosquitto/mosquitto.conf
```

Khởi động ứng dụng từ thư mục gốc:

```bash
./run.sh
```

Trường hợp broker yêu cầu xác thực, cấu hình tài khoản trùng với firmware:

```bash
MQTT_USERNAME='tai_khoan_broker' MQTT_PASSWORD='mat_khau_broker' ./run.sh
```

Backend mặc định kết nối `tcp://localhost:1884`. Broker ở địa chỉ khác được cấu hình qua biến `MQTT_URL=tcp://IP:PORT`. Tập lệnh `run.sh` chọn cổng web còn trống trong khoảng `8080–8099` và in địa chỉ truy cập. Lệnh `Ctrl+C` trong Terminal chạy ứng dụng sẽ dừng chương trình.

Ứng dụng yêu cầu đăng ký tài khoản trước lần đăng nhập đầu tiên. Cơ sở dữ liệu được tạo tại `backend/data/smartroom.db` khi khởi chạy; dữ liệu lịch sử được giữ trong tệp này.

## Nạp chương trình cho ESP8266

1. Tạo `firmware/iotptit/secrets.h` từ `firmware/iotptit/secrets.example.h`. Cấu hình Wi-Fi, IP LAN của máy chạy broker và tài khoản MQTT nếu broker yêu cầu. Git bỏ qua tệp `secrets.h`.
2. Cài board ESP8266, `PubSubClient` và `DHT sensor library` trong Arduino IDE. Chọn board `NodeMCU 1.0 (ESP-12E Module)`.
3. Nạp `firmware/iotptit/iotptit.ino` và kiểm tra kết nối Wi-Fi/MQTT qua Serial Monitor.

ESP8266 sử dụng Wi-Fi 2,4 GHz. Địa chỉ broker trong firmware phải là **IP LAN của máy chạy broker**, không phải `localhost`. Máy chạy broker và ESP8266 cần ở cùng mạng, không bị cách ly thiết bị. Mọi thay đổi IP hoặc Wi-Fi trong `secrets.h` cần được nạp lại lên mạch.

## Điều khiển và kiểm tra API

ESP8266 gửi số đo lên `smartroom/sensor/temperature`, `smartroom/sensor/humidity` và `smartroom/sensor/light` khoảng mỗi 3 giây. Backend lưu số đo; Dashboard lấy dữ liệu qua `GET /api/state`.

Lệnh bật/tắt được lưu với trạng thái `PENDING` và gửi tới `smartroom/{fan,light}/control`. ESP8266 phản hồi qua `smartroom/{fan,light}/status`. Phản hồi khớp trong 10 giây chuyển lệnh thành `SUCCESS`; hết thời hạn chuyển thành `FAILED`. Khi phản hồi đến sau thời hạn, lịch sử giữ bản ghi `FAILED` và thêm một bản ghi `SUCCESS`. Trạng thái thiết bị hiển thị theo phản hồi từ mạch.

API có thể được kiểm tra bằng [Postman collection](postman/Smart-Room-IoT.postman_collection.json) và Postman Desktop Agent. Biến `username`, `password` cần trùng với tài khoản đã đăng ký. Yêu cầu **01 Đăng nhập** thiết lập cookie phiên và CSRF token cho các yêu cầu tiếp theo. Các yêu cầu bật/tắt LED trả HTTP `202`; trạng thái kết quả nằm trong lịch sử thao tác. Nếu ứng dụng chạy ở cổng khác `8080`, cần cập nhật biến `baseUrl` của collection.

Để truy cập từ máy khác trong cùng LAN, khởi động bằng `SERVER_ADDRESS=0.0.0.0 ./run.sh` và đặt `baseUrl` thành `http://IP_MAY_CHU:PORT`. Backend, broker và ESP8266 cần hoạt động trong suốt quá trình kiểm tra.

## Mã nguồn và tài liệu

```text
backend/src/main/java/com/smartroom/
  controller/   REST API, xác thực phiên và CSRF
  service/      Tài khoản, lệnh điều khiển, dữ liệu MQTT
  repository/   Khởi tạo SQLite và truy vấn lịch sử
  mqtt/         Kết nối broker, gửi và nhận bản tin
frontend/      Các trang web, CSS, JavaScript và báo cáo PDF
firmware/      Chương trình ESP8266 và mẫu cấu hình
postman/       Collection để thử API
run.sh         Khởi động backend và phục vụ frontend
```

- [Thiết kế giao diện trên Figma](https://www.figma.com/design/rwKJ8mWRWcIMwxa3AAYK8g/ESP8266-IoT-Dashboard?node-id=87-31)
- [Tài liệu API trên Postman](https://documenter.getpostman.com/view/60095257/2sBYHYvdmt)
