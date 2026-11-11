# Smart Room IoT

Website theo dõi nhiệt độ, độ ẩm, ánh sáng và điều khiển hai LED trên ESP8266. Mạch gửi dữ liệu qua MQTT; ứng dụng Spring Boot lưu lịch sử vào SQLite và cung cấp API cho giao diện HTML, CSS, JavaScript thuần.

Đây là bài tập lớn môn IoT. [Báo cáo cuối cùng](frontend/documents/LeDucMinh-B23DCAT193-IOT.pdf) mô tả sơ đồ mạch, thiết kế dữ liệu và các luồng xử lý.

## Chức năng

- Dashboard hiển thị số đo mới nhất, biểu đồ, trạng thái kết nối và trạng thái hai LED.
- Trang lịch sử cho phép lọc dữ liệu cảm biến và thao tác bật/tắt.
- Trang Người dùng quản lý hồ sơ, mật khẩu, liên kết dự án và tải báo cáo PDF.
- Lệnh điều khiển có trạng thái `PENDING`, `SUCCESS` hoặc `FAILED`. Giao diện chỉ xác nhận bật/tắt khi ESP8266 gửi phản hồi.

| Thành phần | Công nghệ / kết nối |
| --- | --- |
| Giao diện | HTML, CSS, JavaScript; Chart.js cho biểu đồ |
| Backend | Java 17+, Spring Boot 3.5.6, REST API |
| Lưu trữ | SQLite tại `backend/data/smartroom.db` |
| Truyền dữ liệu | MQTT broker trên cổng `1884` |
| Mạch | ESP8266; DHT11 ở D2; cảm biến ánh sáng ở A0; LED quạt ở D6; LED đèn ở D7 |

Ba LED ở D0, D1 và D5 đã được lắp dự phòng, hiện chưa có chức năng điều khiển trên web. Giá trị ánh sáng là số đọc ADC từ `0` đến `1023`, không phải lux.

## Chạy trên máy tính

Bạn cần Java 17 trở lên, Maven 3.9 và một MQTT broker đang nghe ở cổng `1884`. Nếu đã cài Mosquitto bằng Homebrew, có thể mở broker trong một Terminal riêng:

```bash
mosquitto -c /opt/homebrew/etc/mosquitto/mosquitto.conf
```

Trong thư mục gốc của repo, chạy:

```bash
./run.sh
```

Nếu broker yêu cầu đăng nhập, dùng tài khoản khớp với firmware:

```bash
MQTT_USERNAME='tai_khoan_broker' MQTT_PASSWORD='mat_khau_broker' ./run.sh
```

Backend mặc định kết nối `tcp://localhost:1884`. Nếu broker dùng địa chỉ khác, đặt `MQTT_URL=tcp://IP:PORT` trước khi chạy. `run.sh` chọn cổng web còn trống từ `8080` đến `8099` và in địa chỉ truy cập. Nhấn `Ctrl+C` trong Terminal chạy ứng dụng để dừng.

Mở địa chỉ vừa in, đăng ký tài khoản rồi đăng nhập. SQLite tạo cơ sở dữ liệu trong `backend/data/` ở lần chạy đầu; giữ thư mục này nếu muốn giữ lịch sử.

## Nạp chương trình cho ESP8266

1. Sao chép `firmware/iotptit/secrets.example.h` thành `firmware/iotptit/secrets.h` và điền tên, mật khẩu Wi-Fi, IP LAN của laptop cùng tài khoản MQTT nếu có. Git bỏ qua `secrets.h`.
2. Trong Arduino IDE, cài board ESP8266, thư viện `PubSubClient` và `DHT sensor library`; chọn `NodeMCU 1.0 (ESP-12E Module)`.
3. Mở `firmware/iotptit/iotptit.ino`, nạp chương trình và xem Serial Monitor để kiểm tra Wi-Fi/MQTT.

ESP8266 cần Wi-Fi 2,4 GHz. Trong firmware, địa chỉ broker là **IP LAN của laptop**, không phải `localhost`. Laptop và mạch phải ở cùng mạng và nhìn thấy nhau. Khi IP hoặc thông tin Wi-Fi đổi, cập nhật `secrets.h` rồi nạp lại mạch.

## Điều khiển và kiểm tra API

ESP8266 gửi số đo lên `smartroom/sensor/temperature`, `smartroom/sensor/humidity` và `smartroom/sensor/light` khoảng mỗi 3 giây. Backend lưu số đo và trả dữ liệu cho Dashboard qua `GET /api/state`.

Khi bạn bật hoặc tắt LED, backend lưu lệnh `PENDING` và gửi MQTT tới `smartroom/{fan,light}/control`. ESP8266 thực hiện lệnh rồi trả trạng thái qua `smartroom/{fan,light}/status`. Backend đánh dấu `SUCCESS` khi nhận phản hồi khớp trong 10 giây; quá hạn thì ghi `FAILED`. Nếu mạch kết nối lại và xác nhận lệnh sau đó, lịch sử giữ dòng `FAILED` và thêm một dòng `SUCCESS` cho phản hồi đến muộn. Trạng thái hiển thị lấy từ mạch.

Để thử API, import [Postman collection](postman/Smart-Room-IoT.postman_collection.json). Dùng Postman Desktop Agent, đặt `username` và `password` theo tài khoản bạn đã đăng ký, rồi chạy yêu cầu **01 Đăng nhập**. Collection lưu cookie phiên và CSRF token cho các yêu cầu tiếp theo. Chạy yêu cầu bật/tắt LED, sau đó mở lịch sử thao tác để xem phản hồi. Nếu `run.sh` chọn cổng khác `8080`, sửa biến `baseUrl` trong collection.

Nếu bạn dùng Postman trên máy khác trong cùng LAN, chạy `SERVER_ADDRESS=0.0.0.0 ./run.sh` và đặt `baseUrl` thành `http://IP_LAPTOP:PORT`. Giữ backend, broker và ESP8266 hoạt động trong lúc thử.

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
