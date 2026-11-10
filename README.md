# Smart Room IoT

Frontend HTML/CSS/JavaScript thuần; Spring Boot; SQLite; MQTT; ESP8266 với DHT11, cảm biến ánh sáng A0 và hai LED D6/D7.

Giao diện hiện tại: [Figma](https://www.figma.com/design/rwKJ8mWRWcIMwxa3AAYK8g/ESP8266-IoT-Dashboard?node-id=87-31). API: [Postman](https://documenter.getpostman.com/view/60095257/2sBYHYvdmt). Các màn hình dữ liệu trên Figma dùng giá trị giữ chỗ; ứng dụng chạy local hiển thị dữ liệu từ mạch.

## Chạy local

1. Cài Java 17+ và Maven 3.9. Broker MQTT phải chạy ở cổng 1884 và ESP8266 phải kết nối tới cùng broker. Trên laptop hiện tại, có thể chạy `mosquitto -c /opt/homebrew/etc/mosquitto/mosquitto.conf` ở Terminal riêng.
2. Đặt tài khoản broker giống firmware qua biến môi trường, rồi chạy:

```bash
export MQTT_USERNAME='tài_khoản_broker'
export MQTT_PASSWORD='mật_khẩu_broker'
./run.sh
```

Mặc định backend kết nối `tcp://localhost:1884`. Nếu broker ở máy khác, đặt `MQTT_URL=tcp://IP:1884`. Trang web mở tại địa chỉ do `run.sh` in ra. Đăng ký tài khoản trên web trước khi đăng nhập. Dừng bằng Ctrl+C.
Trong firmware, `MQTT_BROKER` phải là **IP Wi‑Fi hiện tại của laptop**, không phải `localhost`. ESP8266 chỉ kết nối Wi‑Fi 2,4 GHz; laptop có thể dùng băng tần 5 GHz nếu hai băng tần cùng LAN và không bị cách ly. Sau khi đổi IP hoặc Wi‑Fi trong firmware, cần nạp lại ESP8266.

Firmware công khai nằm ở `firmware/iotptit/iotptit.ino`. Sao chép `firmware/iotptit/secrets.example.h` thành `firmware/iotptit/secrets.h`, rồi điền Wi‑Fi 2,4 GHz, IP LAN laptop và tài khoản MQTT. Tệp `secrets.h` được Git bỏ qua. Trong Arduino IDE cần cài board ESP8266 cùng thư viện `PubSubClient` và `DHT sensor library`; chọn `NodeMCU 1.0 (ESP-12E Module)` trước khi nạp. D0, D1, D5 chỉ là LED dự phòng, khởi tạo ở mức OFF.

SQLite tạo ở `backend/data/smartroom.db`. Không xóa tệp này nếu muốn giữ dữ liệu. Dữ liệu demo cũ trong `localStorage` được xóa khi tải giao diện mới và không được nhập vào database.
Tài liệu API tự sinh có tại `/swagger-ui.html` sau khi chạy backend.

## Thử API bằng Postman

Import `postman/Smart-Room-IoT.postman_collection.json` vào Postman, dùng Desktop Agent để gọi `localhost`. Đặt collection variables `username` và `password` theo tài khoản đã đăng ký trên web, rồi chạy **01 Đăng nhập**. Postman tự giữ cookie phiên và script lưu CSRF token. Chạy Bật/Tắt đèn LED (D7) hoặc Bật/Tắt LED quạt (D6), sau đó xem **Lịch sử thao tác**: lệnh trả HTTP 202 khi được nhận, trạng thái `SUCCESS` chỉ xuất hiện khi ESP8266 xác nhận qua MQTT. Broker, backend và mạch phải đang chạy. Nếu backend dùng cổng khác 8080, đổi `baseUrl` trong collection. `localhost` luôn là máy chạy Postman. Để thầy gọi từ máy khác trong cùng LAN, chạy backend với `SERVER_ADDRESS=0.0.0.0 ./run.sh` và đặt `baseUrl=http://IP_LAPTOP:8080`; dùng tài khoản web và giữ máy, broker, ESP8266 đang chạy trong lúc demo.

## Luồng hoạt động

- ESP8266 publish `smartroom/sensor/{temperature,humidity,light}` mỗi khoảng 3 giây. Backend lưu vào `sensor_data`; ánh sáng là giá trị ADC 0–1023, không phải lux.
- Web gửi lệnh ON/OFF đến backend. Backend lưu `PENDING`, publish MQTT retained tới `smartroom/{fan,light}/control`, rồi đợi `smartroom/{fan,light}/status` từ ESP8266. Phản hồi khớp trong 10 giây chuyển thành `SUCCESS`; quá hạn thành `FAILED`. Nếu ESP8266 kết nối lại và xác nhận lệnh cuối cùng sau đó, lịch sử giữ dòng `FAILED` của lần chờ quá hạn và thêm dòng `SUCCESS` với thời gian phản hồi thực tế. Trạng thái thiết bị lấy từ phản hồi phần cứng.
- Firmware đang điều khiển hai LED D6 (quạt) và D7 (đèn). Ba LED D0, D1, D5 được cấu hình đầu ra ở mức OFF để dự phòng; chưa có API hoặc MQTT topic điều khiển chúng.
- Backend ghi 6 bảng theo báo cáo: `user`, `iot_node`, `sensor`, `sensor_data`, `actuator`, `action_history`. Mật khẩu được băm BCrypt; API cần phiên đăng nhập và CSRF token.
- Trạng thái nút được suy ra từ bản tin cảm biến hoặc trạng thái trong 12 giây gần nhất. Firmware hiện không có heartbeat riêng.

## Cấu trúc

```text
backend/src/main/java/com/smartroom/controller/  REST API và phiên đăng nhập
backend/src/main/java/com/smartroom/service/     Nghiệp vụ tài khoản, phòng, dữ liệu MQTT
backend/src/main/java/com/smartroom/repository/  Truy vấn và khởi tạo SQLite bằng JdbcTemplate
backend/src/main/java/com/smartroom/mqtt/        Kết nối và publish/subscribe MQTT
backend/data/        Database local
frontend/            Giao diện hiện tại, Chart.js
firmware/            Mã ESP8266 và mẫu cấu hình bí mật
postman/             Bộ API để import
run.sh               Khởi chạy ứng dụng
```
