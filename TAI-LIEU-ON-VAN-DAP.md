# SMART ROOM IOT — TÀI LIỆU ÔN VẤN ĐÁP

**Dành cho người đã biết HTML, CSS, JavaScript cơ bản. Đối chiếu mã nguồn ngày 21/10/2026, chuẩn bị báo cáo ngày 22/10/2026.**

Bạn không cần học thuộc từng dòng. Mục tiêu là nhìn một phần giao diện và nói được: nó dùng để làm gì, lấy dữ liệu từ đâu, khi thao tác thì hàm nào chạy, kết quả được lưu và hiện ra thế nào.

## 1. Đọc thế nào để kịp buổi báo cáo?

- **Có 30 phút:** đọc mục 2, 3, 6, 9, 15 và 18. Tập giải thích luồng bật đèn bằng lời của mình.
- **Có 90 phút:** thêm đăng nhập, tìm kiếm, phân trang, giao diện sáng/tối và bộ câu hỏi mục 16.
- **Có 2–3 giờ:** đọc toàn bộ, vừa đọc vừa mở file và làm theo kịch bản mục 17. Phần tra cứu mục 14 giúp tìm code nhanh.

Trong tài liệu, đường dẫn như `frontend/js/dashboard.js:66` nghĩa là **file dashboard.js, dòng 66**. Số dòng áp dụng cho mã nguồn được đọc hôm nay; nếu sửa file sau này thì dùng tên hàm hoặc ID để tìm lại. Bản HTML kèm tài liệu có liên kết đến bản chụp mã nguồn đánh số dòng, giúp bạn tra ngay trong cùng trang.

**Nguồn và phạm vi:** đã đọc các HTML, toàn bộ JavaScript tự viết, các CSS, script chạy và bốn tài liệu demo trong folder. Chart.js là thư viện đóng gói sẵn, không phân tích nội bộ thư viện. Link chia sẻ ChatGPT bạn gửi không tải được qua công cụ; đã đọc các lượt gần nhất của chat Codex “Thêm mock data và chọn số bản ghi” cùng thư mục để kiểm tra các phần đã gỡ. Nội dung dưới đây lấy mã nguồn hiện tại làm căn cứ, không suy đoán backend hoặc phần cứng chưa có.

## 2. Điều phải nắm chắc trước tiên

### 2.1. Project thực sự làm được gì?

Đây là **giao diện mô phỏng giám sát và điều khiển phòng thông minh**, viết bằng HTML, CSS và JavaScript thuần. Có đăng nhập, đăng ký minh họa, dashboard, lịch sử cảm biến, lịch sử điều khiển và hồ sơ tài khoản. Chart.js vẽ biểu đồ.

**Hiện chưa có backend ứng dụng, database máy chủ, MQTT, WebSocket hay kết nối ESP8266.** Python chỉ phục vụ các tệp tĩnh để trình duyệt tải về. Việc gọi `Api.setDevice()` là gọi một hàm JavaScript ngay trên máy, không phải gửi yêu cầu đến một API mạng.

| Phần | Hành vi hiện tại | Cần nói đúng khi báo cáo |
|---|---|---|
| Đăng nhập | Nhận username sau khi trim không rỗng và password không rỗng | Không kiểm tra tài khoản trong database |
| Đăng ký | Kiểm tra biểu mẫu rồi chuyển về đăng nhập | Không tạo hay lưu tài khoản |
| Ba thẻ cảm biến | Lấy các bản ghi demo mới nhất | Không đọc cảm biến thật |
| Biểu đồ | 30 mẫu cho mỗi loại cảm biến | Không có luồng dữ liệu tự động mới |
| Đèn và quạt | Lưu trạng thái ON/OFF vào localStorage | Không bật phần cứng |
| Mất kết nối | Giữ trạng thái, ghi DISCONNECT và 5600 ms | Không chờ timeout mạng thật |
| Lịch sử | Lọc, sắp xếp và phân trang trong trình duyệt | Không truy vấn SQL |
| Hồ sơ | Sửa tên/email trong kho phiên đăng nhập | Không đồng bộ lên máy chủ |
| Đổi mật khẩu | Kiểm tra các ô và thông báo minh họa | Không xác thực mật khẩu cũ, không đổi mật khẩu |
| Liên kết dự án | Lưu và mở URL người dùng điền | Không tích hợp API GitHub/Figma/Postman |
| Sáng/tối | Đổi biến màu và lưu lựa chọn | Chức năng giao diện đã có xử lý |

**Câu mở đầu có thể nói:** “Em làm phần frontend của Smart Room IoT bằng HTML, CSS và JavaScript thuần. Giao diện cho phép xem số đo, biểu đồ, mô phỏng bật tắt đèn/quạt và tra cứu lịch sử. Ở phiên bản này em dùng dữ liệu mẫu lưu trong trình duyệt để kiểm tra luồng giao diện; phần backend và kết nối ESP8266 chưa được triển khai.”

### 2.2. Các phần đã gỡ, đừng học nhầm bản cũ

Chat cùng folder cho thấy nút/popup tạo dữ liệu mẫu, phát dữ liệu tự động, khối xem/tải tài liệu trên hồ sơ và hiệu ứng quay quạt đã được bỏ. Mã hiện tại phù hợp với việc này. Icon quạt là SVG đứng yên. Các file `frontend/documents/guide-01.html` đến `guide-04.html` vẫn tồn tại nhưng không còn được liên kết từ giao diện hồ sơ. README vẫn nhắc bốn tài liệu xem/tải nên chỗ đó đã cũ.

## 3. Bản đồ project: file nào làm việc gì?

Hãy hình dung HTML là bộ khung căn phòng; CSS là cách sắp xếp, sơn và trang trí; JavaScript là người tiếp nhận thao tác và thay đổi đồ đạc. Dữ liệu demo là sổ ghi chép đặt trong trình duyệt.

| File | Trách nhiệm |
|---|---|
| `run.sh:1` | Vào thư mục frontend, chọn cổng, chạy máy chủ tệp tĩnh Python |
| `frontend/index.html:6` | Kiểm tra có token để chuyển sang login hoặc dashboard |
| `frontend/login.html:21` | Các ô, nút và thông báo trang đăng nhập |
| `frontend/register.html:20` | Biểu mẫu đăng ký và điều khoản |
| `frontend/dashboard.html:18` | Thẻ cảm biến, vùng thiết bị, canvas, các nút biểu đồ |
| `frontend/sensor-history.html:17` | Ô tìm cảm biến, bộ chọn loại, bảng, phân trang |
| `frontend/action-history.html:17` | Bộ lọc hoạt động và bảng kết quả |
| `frontend/profile.html:17` | Thông tin cá nhân, liên kết dự án, dialog mật khẩu |
| `frontend/js/auth.js:1` | Lưu/đọc/xóa phiên, chặn trang khi chưa đăng nhập |
| `frontend/js/api.js:6` | Sinh và lưu dữ liệu mẫu, lọc, phân trang, đổi trạng thái |
| `frontend/js/utils.js:1` | SVG, định dạng, parse thời gian, lỗi ô nhập, toast, escape |
| `frontend/js/layout.js:3` | Sidebar, topbar, tên người dùng, đồng hồ, đăng xuất |
| `frontend/js/theme.js:2` | Chọn sáng/tối, lưu lựa chọn và đổi màu biểu đồ |
| `frontend/js/login.js:1` | Sự kiện đăng nhập, ghi nhớ, quên mật khẩu |
| `frontend/js/register.js:17` | Kiểm tra từng trường đăng ký và chuyển trang |
| `frontend/js/dashboard.js:1` | Đọc dữ liệu, vẽ dashboard, công tắc, ẩn/hiện đường biểu đồ |
| `frontend/js/sensor-history.js:6` | Trạng thái tìm kiếm, dựng bảng cảm biến, nút tìm/đặt lại |
| `frontend/js/action-history.js:6` | Trạng thái bộ lọc hành động, dựng bảng và cảnh báo |
| `frontend/js/pager.js:16` | Sinh các nút trang và gọi lại hàm khi chọn trang |
| `frontend/js/profile.js:7` | Xem/sửa hồ sơ, dialog mật khẩu, lưu/mở liên kết |
| `frontend/css/base.css:1` | Biến màu, button, input, card, table, toast, hidden |
| `frontend/css/layout.css:1` | Các quy tắc khung trang cơ sở |
| `frontend/css/dashboard.css:1` | CSS dashboard cơ sở, một số selector thuộc bố cục cũ |
| `frontend/css/history.css:1` | Bảng, chân bảng, ô số bản ghi và thanh phân trang |
| `frontend/css/profile.css:1` | Lưới hồ sơ và dialog, cũng còn selector cũ |
| `frontend/css/login.css:1` | Form đăng nhập/đăng ký cơ sở |
| `frontend/css/redesign.css:1` | Bố cục hiện tại, ghi đè nhiều quy tắc cũ, responsive |
| `frontend/lib/chart.umd.min.js:1` | Thư viện Chart.js đã tải sẵn, dùng qua đối tượng `Chart` |

Project không dùng React, Vue, npm hay bước build. Các trang là các tệp HTML riêng. Bấm menu `<a href="...">` sẽ tải trang mới, không phải điều hướng SPA.

### 3.1. Vì sao thứ tự script quan trọng?

Ở dashboard, HTML tải Chart.js → Utils → Auth → Api → Layout → dashboard.js. Khi dashboard.js chạy thì các công cụ nó cần đã được khai báo, còn HTML phía trên đã có trong DOM. Trang lịch sử thêm Pager trước script của trang. Theme được tải trong head để đặt `data-theme` sớm, rồi gắn nút khi DOM đã sẵn sàng.

Theme có hàm tham chiếu Utils nhưng không gọi Utils ngay ở thời điểm khai báo đầu head. Nó gọi khi gắn nút hoặc chỉnh chart, khi Utils đã được tải. Đây là điểm phân biệt **định nghĩa hàm** với **thực thi hàm**.

## 4. Khung chung: sidebar, topbar, đồng hồ, đăng xuất

**Mở:** `frontend/js/layout.js:3`, `frontend/css/redesign.css:4`.

HTML các trang có hai vùng trống `#sidebar` và `#topbar`. Script trang gọi `Layout.mount({ active: 'dashboard.html' })`. Hàm mount tạo chuỗi HTML cho hai vùng, đặt tiêu đề và gắn sự kiện.

| Phần trên màn hình | Code phụ trách | Giải thích |
|---|---|---|
| Logo SMART ROOM, chữ IoT MONITORING | `layout.js:9`, `sidebarHtml()` | Nội dung và icon SVG tạo từ JavaScript |
| Bốn mục menu | `layout.js:3`, mảng `links` | Mỗi phần tử có đường dẫn, tên icon và nhãn |
| Mục đang chọn nền trắng | `layout.js:17`, `redesign.css:21` | So sánh href với active rồi thêm class active |
| Tên người dùng/chữ cái avatar | `layout.js:10`, `layout.js:22` | Đọc Auth.user(), lấy tên hoặc username |
| Chữ “Bản trình diễn”, chấm trạng thái | `layout.js:20`, `redesign.css:26` | Chỉ là nhãn trang trí; không đo kết nối |
| Tiêu đề trang trên topbar | `layout.js:38` | Dùng tên trang để chọn tiêu đề |
| Đồng hồ | `layout.js:47` | tick chạy ngay rồi setInterval mỗi 1000 ms |
| Nút đăng xuất | `layout.js:45` → `auth.js:46` | Xóa token/user ở hai kho rồi replace sang login |
| Chế độ sáng/tối | `theme.js:28` | Gắn sự kiện vào nút có data-theme-toggle |

**Luồng chuyển menu:** bấm liên kết → trình duyệt tải HTML mới → script trang kiểm tra đăng nhập → mount lại khung chung → lấy dữ liệu và dựng nội dung trang.

**Đăng xuất có xóa hết lịch sử không?** Không. `Auth.clear()` chỉ xóa `sr_token` và `sr_user`, không xóa dữ liệu cảm biến, hành động, theme hoặc liên kết. Đăng nhập lại vẫn thấy lịch sử đã lưu trong cùng origin.

## 5. Trang đăng nhập và đăng ký

### 5.1. Đăng nhập: đi từ nút đến dữ liệu

**Mở:** `frontend/login.html:21`, `frontend/js/login.js:23`, `frontend/js/api.js:73`, `frontend/js/auth.js:10`.

1. Người dùng bấm Đăng nhập hoặc nhấn Enter trong form. Sự kiện được nghe ở `#login-form`, không cần gắn click riêng vào nút.
2. `e.preventDefault()` chặn việc gửi form/tải lại trang mặc định.
3. Lấy username, bỏ khoảng trắng đầu cuối bằng trim; lấy password nguyên văn.
4. `Utils.setFieldError()` hiện lỗi dưới ô nếu thiếu. Có lỗi thì return, dừng tại đây.
5. Khóa nút bằng `btn.disabled = true` để tránh bấm lặp trong lúc xử lý.
6. Gọi `await Api.login(...)`. Bản demo chỉ kiểm tra không rỗng, tạo user và token cố định `frontend-demo`.
7. `Auth.save()` xóa phiên cũ, chọn localStorage nếu tích Ghi nhớ; nếu không thì sessionStorage. User được chuyển thành chuỗi JSON.
8. `location.replace('dashboard.html')` chuyển trang. `finally` mở khóa nút trong luồng kết thúc xử lý.

**Điều dễ nhầm:** password không được trim nên chuỗi chỉ gồm dấu cách vẫn là chuỗi không rỗng trong demo. Đây không phải kiểm tra mật khẩu bảo mật. Mọi tài khoản demo do `Api.login()` tạo đều có role ADMIN và id 1; không có phân quyền thực tế.

Nếu có lỗi từ hàm API, catch xóa ô mật khẩu và hiện `err.message`. Trong mã hiện tại chưa có nhánh kiểm tra “sai mật khẩu so với tài khoản đã đăng ký”. `async/await` ở giao diện giữ cách viết phù hợp nếu sau này gọi mạng; nó không chứng minh đang có gọi mạng.

### 5.2. Các thành phần còn lại ở login

| Phần | Tìm ở đâu? | Hành vi |
|---|---|---|
| Icon con mắt | `utils.js:114`, `data-target="password"` | Đổi input.type giữa password và text; không mã hóa dữ liệu |
| Ghi nhớ đăng nhập | `login.js:37`, `auth.js:10` | Chọn nơi lưu token/user |
| Quên mật khẩu | `login.js:18` | preventDefault và toast “chưa được hỗ trợ” |
| Đăng ký ngay | `login.html:56` | Liên kết sang register.html |
| Thông báo sau đăng ký | `login.js:12` | Đọc query `registered` bằng URLSearchParams |
| Đã có phiên mà vào login | `login.js:2` | Chuyển thẳng dashboard |
| Khối xanh bên trái | `login.html:15`, `redesign.css:143` | Nội dung tĩnh; không phải chức năng cảm biến |

### 5.3. Đăng ký: kiểm tra những gì?

**Mở:** `frontend/js/register.js:17` — hàm validate.

| Trường | Điều kiện |
|---|---|
| Username | 3–30 ký tự, chỉ chữ Latin, số, dấu chấm, gạch dưới; regex `^[A-Za-z0-9_.]{3,30}$` |
| Email | Không rỗng, có mẫu cơ bản tên@miền.đuôi qua regex |
| Password | Ít nhất 6 ký tự |
| Xác nhận password | Trùng password |
| Điều khoản | Checkbox terms phải được tích |

Regex email chỉ kiểm tra hình thức cơ bản, không xác nhận hộp thư tồn tại. `novalidate` trên form để ứng dụng tự kiểm tra và hiện thông báo tiếng Việt thay vì phụ thuộc toàn bộ thông báo mặc định của trình duyệt.

Luồng: submit → preventDefault → validate → nếu hợp lệ gọi `Api.register()` → hàm này trả `{}` và không lưu gì → chuyển `login.html?registered=1` → trang login hiện thông báo minh họa. Các link Điều khoản/Chính sách có class soft-link chỉ hiện toast “đang được cập nhật”.

Trong catch có xử lý mã lỗi 409 để gắn lỗi trùng email/username đúng ô. **Đó là nhánh dự phòng; Api.register hiện tại không kiểm tra trùng và không phát lỗi 409.**

## 6. Dashboard: ba thẻ, công tắc, biểu đồ và lịch sử gần đây

### 6.1. Khi mở dashboard, chương trình làm gì?

**Mở:** `frontend/js/dashboard.js:1`, `frontend/js/dashboard.js:84`.

Đầu tiên `Auth.requireLogin()` kiểm tra có token. Không có thì chuyển login và return. Có thì mount Layout, tạo SVG, khởi tạo Chart. Sau khi gắn sự kiện, gọi `render()` để điền dữ liệu.

`render()` làm năm việc: lấy cảm biến mới nhất → điền ba thẻ; lấy danh sách thiết bị → vẽ công tắc; lấy ba hành động mới nhất → vẽ khu gần đây; lấy lịch sử cảm biến → nhóm thành ba mảng; cập nhật labels và datasets của chart rồi chart.update().

Khi dữ liệu demo được ghi lại, sự kiện `demo:data` gọi render lần nữa. **Dashboard không có bộ hẹn giờ sinh số đo mới. Đồng hồ chạy mỗi giây là chuyện riêng.**

### 6.2. Ba thẻ chỉ số

**HTML:** `frontend/dashboard.html:18`. **JS:** `dashboard.js:43`, `api.js:85`.

Các ID `v-temp`, `v-hum`, `v-light` là nơi hiện giá trị; `n-temp`, `n-hum`, `n-light` là nhận xét. `Api.sensorsLatest()` sắp xếp dữ liệu mới nhất trước rồi find bản ghi đầu tiên của từng loại.

`renderMetric(key, sensor)` dùng key ghép thành ID, ví dụ key temp → v-temp. Nếu không có sensor thì hiện `--` và “Chưa có dữ liệu”. Có sensor thì hiện số đo, đơn vị và nhận xét theo ngưỡng:

| Chỉ số | Ngưỡng nhận xét trong code |
|---|---|
| Nhiệt độ | <18: Lạnh; 18–28: Dễ chịu; >28 đến 33: Ấm; >33: Nóng |
| Độ ẩm | <40: Khô; 40–70: Thoải mái; >70: Ẩm |
| Ánh sáng | <300: Tối; 300 đến dưới 700: Vừa; từ 700: Sáng |

Đây là các ngưỡng hiển thị được viết trong frontend, không phải chế độ tự động điều khiển quạt/đèn. AHT20 và BH1750 là nhãn tĩnh trong HTML, không có thư viện đọc hai cảm biến trong folder này.

### 6.3. Công tắc đèn/quạt — phần nên hiểu kỹ nhất

**Mở:** `frontend/js/dashboard.js:54`, `frontend/js/dashboard.js:66`, `frontend/js/api.js:109`.

HTML ban đầu chỉ có `<div id="devices"></div>`. `renderDevices()` map hai thiết bị thành hai khối article, mỗi khối có tên, icon, trạng thái và button.switch. Vì vậy bạn tìm nút công tắc trong dashboard.html sẽ không thấy toàn bộ markup: nó được JavaScript tạo ra.

Các thuộc tính quan trọng: `data-type="LIGHT"` hoặc FAN để biết thiết bị; `aria-checked="true"` nếu ON; class is-on để tô nền khi bật. CSS `redesign.css:70` đến khu switch quy định màu và chuyển vị trí núm gạt. Núm di chuyển bằng transform, không phải JavaScript chạy hoạt ảnh từng khung.

**Luồng bấm bật đèn từ OFF:**

1. Vùng cha `#devices` nhận click; `e.target.closest('.switch')` tìm nút kể cả khi bạn bấm vào span bên trong.
2. Đọc `button.dataset.type` để biết LIGHT.
3. `Api.actuators().find(...)` lấy trạng thái hiện tại.
4. Toán tử ba ngôi chọn trạng thái đích: đang ON thì OFF, đang OFF thì ON.
5. Đọc checkbox `#simulate-timeout` rồi gọi `Api.setDevice(type, nextState, timeout)`.
6. Trong API: đọc dữ liệu → tìm thiết bị → kiểm tra ON/OFF → đổi reportedState nếu không mô phỏng lỗi.
7. Thêm hành động mới ở đầu mảng bằng unshift, lấy ID lớn nhất + 1, ghi người thao tác và thời điểm; giữ tối đa 300 hành động.
8. `write(data)` lưu JSON vào localStorage rồi phát `demo:data`.
9. Dashboard nghe sự kiện và render lại, nên công tắc, màu thiết bị và lịch sử gần đây được cập nhật.
10. Handler hiện toast thông báo kết quả.

**Mẫu giải thích bằng miệng:** “Nút này do hàm renderDevices tạo ra. Em nghe click ở vùng cha để các nút dựng lại vẫn hoạt động. Khi bấm, em lấy loại thiết bị và trạng thái cũ, tính trạng thái mới rồi gọi lớp dữ liệu demo. Lớp này lưu trạng thái cùng lịch sử vào localStorage, phát sự kiện để dashboard vẽ lại.”

Đó là **event delegation**: một người đứng ở cửa chung nhận thao tác của nhiều nút con. Nếu mỗi lần innerHTML thay toàn bộ nút mà chỉ gắn listener vào nút cũ thì listener của các nút cũ không tự đi theo nút mới. Gắn ở cha giữ được đầu mối nghe sự kiện.

`Api.actuators()` đọc JSON và tạo object mới mỗi lần đọc. Biến `device` trong handler giữ trạng thái cũ; `setDevice()` đọc dữ liệu riêng rồi sửa. Vì vậy câu toast suy ra vừa “bật” hay “tắt” từ biến trạng thái cũ vẫn phù hợp với luồng hiện tại.

### 6.4. Checkbox “Mô phỏng mất kết nối”

Khi tích checkbox, lần bấm công tắc tiếp theo sẽ ghi status DISCONNECT, responseTimeMs 5600 và result “Không nhận được phản hồi”. reportedState không bị đổi nên công tắc giữ nguyên. Nếu trước đó đèn ON, bấm tắt trong chế độ lỗi sẽ ghi một lệnh OFF thất bại và đèn vẫn ON.

**Không có setTimeout chờ 5600 ms ở đây.** Con số đó được gán ngay vào bản ghi để minh họa ngưỡng hơn 5 giây. Thành công cũng là số ngẫu nhiên từ 400 đến 2500 ms, không phải thời gian đo thực tế.

### 6.5. Biểu đồ và các nút chú giải

**Mở:** `dashboard.js:6`, `dashboard.js:25`, `dashboard.html:43`.

Chart.js vẽ vào `<canvas id="live-chart">`. Chart có type line, labels là mốc thời gian và ba datasets. Mỗi dataset là một đường: nhiệt độ xanh dương, độ ẩm xanh lá, ánh sáng vàng. Dữ liệu mỗi đường lấy tối đa 30 bản ghi, đảo về thứ tự cũ → mới để đọc từ trái sang phải.

| Thành phần | Ý nghĩa |
|---|---|
| Trục x | Giờ:phút:giây do Utils.fmtTime() tạo |
| Trục y bên trái | Dùng chung nhiệt độ/độ ẩm, min 0 max 100 |
| Trục y1 bên phải | Ánh sáng, min 0 max 1000 |
| tension .36 | Làm đường cong mềm |
| pointRadius 2 | Kích thước điểm trên đường |
| responsive true | Chart thích nghi vùng chứa |
| maintainAspectRatio false | Cho phép dùng chiều cao CSS của chart-box |
| animation false | Tắt hoạt ảnh cập nhật của Chart.js |
| interaction mode index | Rê chuột xem dữ liệu theo cùng vị trí chỉ số |

Vì lux có thang số lớn hơn nên dùng trục riêng để các đường còn dễ nhìn. Nhiệt độ và độ ẩm vẫn khác đơn vị; trục chung ở đây là lựa chọn đơn giản cho demo. Không có tự mở rộng giới hạn trục theo dữ liệu trong mã hiện tại.

Nút Nhiệt độ/Độ ẩm/Ánh sáng có `data-dataset="0/1/2"`. Click → đọc chỉ số → đảo chart.isDatasetVisible bằng setDatasetVisibility → `syncChartControls()` cập nhật aria-pressed, trạng thái nút Tất cả và trục ánh sáng → chart.update(). Không xóa số liệu và không sửa localStorage.

Nút **Tất cả** luôn bật lại cả ba đường, không phải bật/tắt đồng loạt. Ẩn ánh sáng thì trục y1 cũng ẩn. Tải lại trang sẽ trở về hiển thị cả ba vì lựa chọn đường biểu đồ không được lưu.

### 6.6. Lịch sử gần đây và link chuyển trang

`dashboard.js:76` dựng ba hành động mới nhất từ `Api.actions({ limit: 3 }).items`. Mỗi mục có icon, tên thiết bị, BẬT/TẮT, thời gian và nhãn trạng thái. Dữ liệu là cùng kho với trang lịch sử hoạt động, không phải hai danh sách lưu riêng.

“Xem lịch sử” là `<a href="sensor-history.html">`; “Xem tất cả” là `<a href="action-history.html">`. Đây là chuyển trang HTML thông thường, không có hàm tải thêm đặc biệt.

## 7. Lịch sử cảm biến: tìm kiếm, bảng và phân trang

**Mở:** `frontend/sensor-history.html:17`, `frontend/js/sensor-history.js:6`, `frontend/js/api.js:93`.

### 7.1. State là gì?

```js
const state = { searchType: 'ALL', keyword: '', page: 1, limit: 10 };
```

Hãy coi state là tờ giấy ghi lựa chọn đang áp dụng: tìm loại gì, từ khóa nào, trang mấy và bao nhiêu dòng. Không phải state của React; đây chỉ là object JavaScript bình thường và không tự render. Code phải gọi `load()` sau khi sửa.

`load()` gọi `Api.sensorsHistory(state)`, nhận items/page/limit/total, dùng map tạo các `<tr>` rồi nối bằng join('') và gán vào tbody.innerHTML. Nếu items rỗng thì hiện một dòng “Không tìm thấy…” với colspan 4.

Mỗi dòng có ID hiển thị dạng #001 nhờ padStart(3, '0'), tên cảm biến, giá trị kèm đơn vị và thời gian. #001 là ID đã định dạng; không phải số thứ tự tự đếm lại sau tìm kiếm.

### 7.2. Tìm theo từng loại

| Chọn “Tìm theo” | Khi có từ khóa | Khi để trống |
|---|---|---|
| Tất cả | Khớp số chính xác, khoảng thời gian; với từ khóa không thuần số còn tìm tên/chuỗi thời gian | Tất cả bản ghi |
| Nhiệt độ | Chỉ dữ liệu TEMPERATURE có giá trị khớp | Tất cả nhiệt độ |
| Độ ẩm | Chỉ HUMIDITY có giá trị khớp | Tất cả độ ẩm |
| Ánh sáng | Chỉ LIGHT có giá trị khớp | Tất cả ánh sáng |
| Thời gian | Kiểm tra cú pháp rồi tìm trong khoảng thời gian | Tất cả bản ghi |

**Ví dụ chính xác của valueMatches ở `api.js:63`:**

- `27` hoặc `27.0`: khớp giá trị số 27, không khớp 27.2 hay 127.
- `27.2` hoặc `27,2`: khớp số 27.2.
- `27.` hoặc `27,`: tìm số có phần nguyên 27 và có phần lẻ; khớp 27.1, 27.9 nhưng **không khớp 27 nguyên**.
- Khi chọn Nhiệt độ, gõ chữ “nhiệt” sẽ không tìm bằng tên. Muốn tìm bằng tên thì chọn Tất cả.
- Khi Tất cả và từ khóa là năm như 2026, code có thể khớp thời gian năm 2026 hoặc giá trị đúng 2026 nếu có.

### 7.3. Gõ rồi bấm Tìm kiếm khác nhau thế nào?

Sự kiện input ở keyword chỉ cập nhật gợi ý thời gian. Bảng chỉ lọc khi submit form: ngăn reload → trim từ khóa → chặn chuỗi toàn khoảng trắng → nếu tìm theo TIME thì kiểm tra parse → ghi state và đặt page=1 → load(). Đổi dropdown chỉ cập nhật gợi ý; vẫn cần bấm Tìm kiếm để áp dụng lên bảng.

Nút Đặt lại xóa keyword, về ALL, xóa lỗi/gợi ý, về trang 1 rồi load. **Không xóa dữ liệu cảm biến và không đặt limit về 10**; số dòng/trang người dùng đang chọn được giữ trong state của trang.

### 7.4. Tổng số ở đầu trang khác tổng số sau lọc

`total-chip` lấy `Api.counts().sensors`: toàn bộ dữ liệu, ban đầu 90 dòng. `count-text` lấy res.total: số dòng thỏa điều kiện. `range-text` là khoảng đang xem, ví dụ 11–20 / 90. Ba chỗ trả lời ba câu hỏi khác nhau.

## 8. Lịch sử hoạt động: bộ lọc phối hợp và cảnh báo

**Mở:** `frontend/action-history.html:17`, `frontend/js/action-history.js:6`, `frontend/js/api.js:125`.

State gồm actuator, action, status, time, page và limit. Người dùng chọn thiết bị LIGHT/FAN, hành động ON/OFF, trạng thái SUCCESS/DISCONNECT và thời gian. Chuỗi rỗng trong dropdown nghĩa là không giới hạn điều kiện đó.

Các điều kiện trong `Api.actions()` nối bằng **AND**: một bản ghi phải thỏa tất cả bộ lọc đã nhập. Ví dụ chọn Quạt + BẬT + Mất kết nối + tháng 2026-10 sẽ chỉ lấy lệnh bật quạt lỗi trong tháng đó. Sau khi lọc, sắp xếp createdAt giảm dần, nếu bằng nhau dùng ID giảm dần, cuối cùng mới phân trang.

Mỗi dòng bảng có ID, thiết bị, hành động, trạng thái, thời gian và phản hồi. Các trường username/result có trong dữ liệu nhưng hiện không được dựng thành cột.

**Cảnh báo:** `action-history.js:10` đánh dấu mất kết nối khi status DISCONNECT **hoặc** responseTimeMs > 5000. CSS thêm row-disconnect và response-warning. Thời gian hiện bằng `(ms / 1000).toFixed(1)`, ví dụ 5600 → 5.6 giây. Đúng 5000 không thỏa điều kiện “>5000”, nhưng vẫn cảnh báo nếu status DISCONNECT.

Nhãn trạng thái trong cột riêng vẫn đọc từ row.status. Nếu dữ liệu được sửa thủ công thành SUCCESS nhưng phản hồi >5000 thì có thể vừa hiện nhãn thành công vừa có cảnh báo phản hồi. Với dữ liệu demo do chương trình tạo, hai thông tin nhất quán.

`Api.actions()` còn trả summary gồm total/success/pending/failed nhưng trang hiện tại không render các thẻ summary. Utils có nhãn PENDING và FAILED nhưng bộ chọn trên giao diện chỉ cho Thành công và Mất kết nối. Đừng nhầm “có tên trong code” với “đã có đầy đủ luồng trên giao diện”.

Các nút Tìm kiếm, Đặt lại, đổi số dòng và phân trang hoạt động tương tự trang cảm biến. Gõ thời gian chỉ đổi gợi ý; submit mới áp dụng. Đặt lại giữ limit, xóa bộ lọc, về trang 1 và không xóa lịch sử.

## 9. Lõi dữ liệu: localStorage, dữ liệu mẫu và phân trang

### 9.1. Dữ liệu lưu ở đâu?

| Khóa | Kho | Nội dung |
|---|---|---|
| sr_demo_data_v2 | localStorage | Object có sensors, actions, devices |
| sr_token | localStorage hoặc sessionStorage | Token demo frontend-demo |
| sr_user | Cùng kho với token | Object user được JSON.stringify |
| sr_theme | localStorage | light hoặc dark |
| sr_project_links | localStorage | Object github, figma, postman |

localStorage giữ dữ liệu qua tải lại và thường qua đóng/mở trình duyệt cho đến khi xóa. sessionStorage gắn với phiên tab, vẫn còn khi reload; thường mất khi kết thúc phiên tab. Trình duyệt có thể có cơ chế khôi phục phiên, nên đừng coi hai kho là bảo mật hoặc cơ chế hết hạn chính xác.

Dữ liệu lưu theo **origin** gồm giao thức, host và cổng. `http://localhost:8080` khác `http://localhost:8081` và khác `http://127.0.0.1:8080`. Nếu đổi cổng thấy dữ liệu hoặc đăng nhập “mất”, có thể đang nhìn một kho khác.

`JSON.stringify(object)` biến object thành chuỗi để lưu. `JSON.parse(text)` biến chuỗi về object để xử lý. Các hàm try/catch xử lý JSON lỗi để tránh dừng ngay ở trường hợp chuỗi không hợp lệ; mã vẫn chưa xử lý toàn diện mọi trường hợp bộ nhớ trình duyệt bị chặn/hết dung lượng.

### 9.2. Dữ liệu mẫu được tạo lúc nào?

**Mở:** `frontend/js/api.js:19`, `frontend/js/api.js:47`.

`read()` thử đọc sr_demo_data_v2. Nếu object có ba mảng sensors/actions/devices thì dùng lại. Nếu không có hoặc đọc JSON lỗi thì gọi seed(), write() và trả dữ liệu mới. Chỉ kiểm tra cấu trúc ba mảng, không kiểm tra sâu mọi trường của từng bản ghi.

seed() tạo:

- 30 mốc thời gian, từ lúc khởi tạo lùi 29 phút đến lúc khởi tạo, mỗi mốc cách 1 phút.
- Mỗi mốc có 3 loại số đo, tổng **90 bản ghi cảm biến**. Giá trị dùng sin/cos và phép làm tròn để tạo đường biến thiên có hình dạng ổn định, không phải lấy ngẫu nhiên liên tục.
- 16 hành động lịch sử mẫu, hai mục DISCONNECT ở chỉ số i=4 và i=11, còn lại SUCCESS.
- Hai thiết bị: Đèn LED id 1 type LIGHT và Quạt id 2 type FAN, ban đầu OFF.

Timestamp ban đầu dựa vào Date.now() khi seed. Sau khi lưu rồi, reload không tự dời mốc thời gian lên ngày mới. Vì vậy mai lọc theo ngày mai có thể không thấy số đo được tạo hôm nay. Hãy lấy ngày đang hiện trong bảng để demo tìm kiếm.

Các hành động ban đầu là bộ mẫu riêng, không phải hệ thống chạy lại tuần tự các lệnh để suy ra trạng thái thiết bị. Đừng dùng lịch sử seed để kết luận trạng thái phần cứng thực.

### 9.3. Ba kiểu bản ghi

```js
// Ví dụ cấu trúc, không phải số đo thực tế của thiết bị
{ id: 1, type: 'TEMPERATURE', name: 'Nhiệt độ',
  unit: '°C', value: 25, recordedAt: '2026-10-21T15:00:00.000Z' }

{ id: 1, name: 'Đèn LED', type: 'LIGHT', reportedState: 'OFF' }

{ id: 17, username: 'admin', actuatorName: 'Đèn LED',
  actuatorType: 'LIGHT', action: 'ON', status: 'SUCCESS',
  responseTimeMs: 800, createdAt: '2026-10-21T15:30:00.000Z',
  result: 'Đã thực hiện' }
```

LIGHT xuất hiện trong hai ngữ cảnh: loại cảm biến ánh sáng và loại thiết bị đèn. Chúng ở các mảng khác nhau. `recordedAt` là thời điểm số đo; `createdAt` là thời điểm hành động; reportedState là trạng thái đang được demo lưu, còn action là lệnh muốn thực hiện. Hai thứ cuối có thể khác nhau khi lệnh thất bại.

### 9.4. Phân trang: hai tầng trách nhiệm

**Lấy dòng:** `api.js:57`, pageOf(). **Vẽ nút:** `pager.js:16`. **Nhớ lựa chọn và gọi lại:** script của từng trang lịch sử.

```js
start = (page - 1) * limit;
items = rows.slice(start, page * limit);
totalPages = Math.ceil(total / limit);
```

Ví dụ có 90 dòng, mỗi trang 10: có 9 trang. Trang 2 lấy slice(10,20), tức phần tử chỉ số 10–19, tương ứng dòng thứ 11–20. slice không sửa mảng gốc, và cận phải không được lấy.

pageOf chặn limit trong 1–100 và ép page vào khoảng hợp lệ. Giao diện còn kiểm tra Number.isInteger và validity trước khi nhận số dòng. Nhập 0, 101 hoặc số lẻ sẽ không áp dụng. Ô input type number hỗ trợ gõ và nút tăng/giảm tùy trình duyệt; không phải dropdown chọn sẵn.

Sự kiện change áp dụng limit → page=1 → load. Nhấn Enter làm blur để kết thúc nhập; không phải form tìm kiếm mới. Khi tìm hoặc đổi số dòng cần về trang 1, vì trang cũ có thể không còn tồn tại sau lọc.

Pager có nút Trước/Sau, vô hiệu hóa ở đầu/cuối. Nếu tối đa 7 trang thì hiện đủ; nhiều hơn thì giữ 1,2,3, trang cuối và vùng quanh trang hiện tại, chèn dấu … vào khoảng trống. Dấu … là span, không bấm được. Nếu chỉ có 0 hoặc 1 trang thì ẩn thanh nút.

**Lưu ý phạm vi:** phân trang ở đây là cắt một mảng đã có trong trình duyệt. Nó giảm số dòng dựng ra DOM; không giảm lượng dữ liệu tải từ backend vì chưa có backend.

## 10. Lọc thời gian thông minh: từ năm đến giây

**Mở:** `frontend/js/utils.js:63`, `frontend/js/api.js:71`.

Ý tưởng: người dùng nhập chính xác đến đâu thì tìm toàn bộ khoảng thời gian tương ứng đến đó. Không phải chỉ so sánh bằng một timestamp.

| Chuỗi nhập | Độ chính xác | Khoảng được hiểu |
|---|---|---|
| 2026 | Năm | Cả năm 2026 |
| 2026-10 | Tháng | Cả tháng 10/2026 |
| 2026-10-21 | Ngày | Cả ngày 21/10/2026 |
| 2026-10-21 10 | Giờ | 10:00:00 đến 10:59:59.999 |
| 2026-10-21 10:30 | Phút | 10:30:00 đến 10:30:59.999 |
| 2026-10-21 10:30:15 | Giây | 10:30:15.000 đến 10:30:15.999 |

parseSmartDatetime làm các bước: trim → đổi dấu / thành - → regex tách năm/tháng/ngày/giờ/phút/giây → phần thiếu lấy đầu kỳ → tạo Date bắt đầu → đối chiếu lại từng thành phần để loại ngày sai → xác định precision → tạo đầu kỳ kế tiếp và trừ 1 ms để có end → trả start/end/precision/label.

Ví dụ 2026-02-30: JavaScript Date có thể tự chuyển ngày vượt tháng sang tháng sau. Hàm so lại tháng/ngày nhập với Date được tạo, thấy khác thì trả null. Đây là lý do chỉ regex kiểm tra cấu trúc chưa đủ. Code cũng nhận tháng/ngày một chữ số, dấu T giữa ngày giờ và dấu / theo bước chuẩn hóa.

Thời điểm dữ liệu lưu bằng toISOString() ở UTC, hậu tố Z. Các hàm fmtDate/fmtTime dùng getHours/getDate của môi trường trình duyệt để hiện giờ địa phương. Bộ lọc tạo Date theo múi giờ địa phương. Ở máy dùng giờ Việt Nam thì 15:00 UTC hiện thành 22:00. Không phải code hardcode múi giờ Việt Nam cho mọi máy.

## 11. Hồ sơ: chỉnh sửa, mật khẩu và liên kết

### 11.1. Thông tin cá nhân

**Mở:** `frontend/profile.html:17`, `frontend/js/profile.js:7`.

`render(u)` lấy tên, email, mã, vai trò điền vào các input; avatar lấy chữ cái đầu và chuyển hoa. Mã tài khoản và vai trò luôn readonly. Tên/email ban đầu cũng readonly, chỉ mở khi bấm Chỉnh sửa.

| Nút | Code | Hành vi |
|---|---|---|
| Chỉnh sửa hồ sơ | `profile.js:24` → edit(true) | Bỏ readonly ở tên/email, đổi nhóm nút, focus tên |
| Hủy chỉnh sửa | `profile.js:25` | render lại object user đã lưu, đóng chế độ sửa |
| Lưu thay đổi | `profile.js:26` | Trim, kiểm tra tên/email, Api.updateProfile, render, toast |

`Api.updateProfile()` tạo object mới bằng `{ ...Auth.user(), fullName, email }`. Dấu ... giữ các trường cũ, hai trường sau ghi đè tên/email. render gọi Auth.setUser nên dữ liệu được lưu theo kho phiên hiện tại.

**Chi tiết giao diện:** sidebar đã dựng trước khi sửa hồ sơ. Hàm render hồ sơ không mount lại sidebar, nên tên trong banner hồ sơ đổi ngay nhưng tên ở sidebar có thể còn cũ đến khi tải lại/chuyển trang. Khi đăng xuất rồi đăng nhập lại, Api.login tạo user demo lại nên thông tin hồ sơ sửa trước đó không phải hồ sơ tài khoản bền vững trên máy chủ.

### 11.2. Hộp thoại đổi mật khẩu

**Mở:** `profile.html:52`, `profile.js:35`.

Nút Thay đổi mật khẩu gọi showModal() trên thẻ dialog. Trình duyệt tạo lớp modal; CSS `profile.css` dùng `dialog::backdrop` làm nền tối phía sau. Nút Hủy gọi close(); Esc thường đóng dialog theo hành vi mặc định của trình duyệt.

Submit kiểm tra mật khẩu hiện tại không rỗng, mật khẩu mới tối thiểu 6 ký tự, xác nhận phải trùng. Hợp lệ thì close(), reset() form và toast “Bản demo frontend không thay đổi mật khẩu”. Không gọi Api.changePassword; hàm đó có trong lớp API nhưng chưa được sử dụng ở luồng này. Không có kiểm tra mật khẩu cũ đúng/sai.

### 11.3. Liên kết GitHub, Figma, Postman

**Mở:** `profile.html:37`, `profile.js:49`.

Ba ô `link-github`, `link-figma`, `link-postman` đọc giá trị từ localStorage sr_project_links. Biến selected ban đầu github; focus vào ô nào thì chọn dịch vụ đó để nút Mở đổi nhãn tương ứng.

Lưu liên kết kiểm tra mỗi URL không rỗng phải bắt đầu bằng http:// hoặc https://, sau đó lưu cả object JSON. Kiểm tra này chỉ là kiểm tra tiền tố, chưa kiểm tra tên miền có tồn tại hoặc URL có đầy đủ cấu trúc hợp lệ.

Nút Mở dùng giá trị hiện có trong ô đang chọn, nên **có thể mở URL vừa gõ trước khi lưu**. window.open mở tab mới với noopener,noreferrer để hạn chế liên hệ với tab gốc và thông tin referrer. Đây chỉ là mở đường dẫn, không phải gọi API ba dịch vụ đó.

## 12. CSS: giải thích bố cục và màu sắc bằng lời dễ hiểu

### 12.1. Muốn sửa giao diện thì bắt đầu đâu?

Tìm class trong HTML hoặc chuỗi HTML do JS tạo → tìm selector tương ứng trong CSS → kiểm tra file nào được tải sau và selector nào ưu tiên cao hơn. `redesign.css` được tải sau các CSS cơ sở nên là nơi cần xem đầu tiên với bố cục hiện tại.

Không phải “CSS cuối luôn thắng” trong mọi trường hợp: còn độ cụ thể của selector và !important. Ví dụ `.hidden { display:none !important; }` trong base.css dùng để ẩn chắc chắn các khối dù có quy tắc display khác. Nhiều class cũ như .stat-grid/.device/.cover không trùng markup hiện tại; thấy selector trong file không có nghĩa đang dùng trên màn hình.

| Cần đổi phần nào? | Selector/nơi tìm |
|---|---|
| Màu nền/chữ/nút toàn hệ thống | Biến :root và :root[data-theme="dark"] ở base.css |
| Sidebar xanh, nền chuyển sắc | .sidebar và --sidebar-blue ở redesign.css:2 |
| Menu đang chọn | .sidebar .side-links a.active |
| Ba thẻ chỉ số | .metric-grid, .metric-card, .metric-temp/.metric-hum/.metric-light |
| Vạch màu đầu thẻ | .metric-card::before, biến --metric |
| Thiết bị bật đổi nền | .device-tile.is-on |
| Công tắc | .switch và .switch[aria-checked="true"] |
| Bố cục thiết bị và chart | .dashboard-grid |
| Vùng bảng cuộn | .table-scroll |
| Tiêu đề bảng bám khi cuộn | .table th { position:sticky; top:0; } |
| Chân bảng và nút trang | .table-foot, .pager |
| Nền xanh hồ sơ | .profile-banner |
| Nền xanh trang login | .auth-hero |
| Căn khối chữ trái login | .auth-hero dùng flex-direction:column; .auth-hero-copy dùng margin:auto 0 |
| Nền sau dialog | dialog::backdrop trong profile.css |
| Toast góc phải dưới | #toast-root, .toast ở base.css |

### 12.2. Flex và Grid được dùng ở đâu?

**Flex** hợp để xếp theo một chiều, như logo cạnh chữ, hai đầu topbar, icon cạnh tên, nút cạnh nhau. **Grid** hợp để chia cột/hàng: ba thẻ cảm biến, hai ô thiết bị, biểu đồ cạnh thiết bị, các ô tìm kiếm.

`grid-template-columns:repeat(3,minmax(0,1fr))` chia ba cột đều nhau; minmax(0,...) giúp cột co xuống mà không bị nội dung ép vượt quá mức mong muốn. `gap` là khoảng giữa phần tử. `padding` là khoảng trong hộp, margin là khoảng ngoài. `box-sizing:border-box` giúp kích thước đã gồm padding và border.

Sidebar desktop dùng sticky, top 0 và height 100vh để bám khi cuộn. SVG dùng currentColor nên đổi màu chữ cha có thể đổi màu nét icon. Border-radius bo góc, box-shadow đổ bóng, linear-gradient/radial-gradient tạo nền chuyển sắc. `::before` tạo chi tiết trang trí mà không cần thêm thẻ HTML.

### 12.3. Responsive: màn hình nhỏ đổi ra sao?

**Mở:** `frontend/css/redesign.css:160` và các media query trong CSS cơ sở.

- Dưới/đúng 1200px: vùng thiết bị/biểu đồ về một cột; bộ lọc hành động đổi cách chia cột.
- Dưới/đúng 900px: sidebar thành thanh menu ngang có thể cuộn; ẩn logo/khối cuối sidebar; hồ sơ về một cột; login về một cột và ẩn phần lời giới thiệu lớn; bảng giới hạn vùng cuộn.
- Dưới/đúng 650px: ẩn đồng hồ và chip demo trên topbar, thẻ cảm biến về một cột, lịch sử gần đây xếp dọc, các ô tìm kiếm đổi cột. Hai ô thiết bị vẫn có thể đứng cạnh nhau.
- CSS profile cơ sở còn mốc 700px để lưới trường hồ sơ về một cột; layout/login cơ sở có mốc 560px để chỉnh khoảng cách và nhãn theme.

Ở bố cục nhỏ hơn 900px, khối side-bottom chứa nút đăng xuất bị ẩn cùng khối cuối sidebar. Đây là giới hạn giao diện hiện tại, không có nút đăng xuất thay thế ở topbar.

`meta viewport` trong HTML giúp trình duyệt di động dùng chiều rộng thiết bị khi bố trí trang. `clamp()` ở tiêu đề login cho cỡ chữ tăng giảm trong giới hạn min/max.

## 13. Sáng/tối, icon, toast và những cú pháp JS thường bị hỏi

### 13.1. Sáng/tối hoạt động thế nào?

**Mở:** `frontend/js/theme.js:2`, `frontend/css/base.css:1`.

1. Khi tải theme.js, đọc sr_theme; chỉ dark được nhận là dark, còn lại light.
2. Đặt `document.documentElement.dataset.theme`, tương đương thuộc tính data-theme trên thẻ html.
3. CSS có bộ biến màu sáng ở :root và tối ở :root[data-theme="dark"]. Các thành phần dùng var(--bg), var(--text), var(--card)… nên đổi theo.
4. Bấm nút → set(mode) → ghi localStorage → đổi icon và nhãn nút → phát themechange.
5. Dashboard nghe themechange và gọi Theme.styleChart(). Chart nằm trong canvas nên cần cập nhật màu ticks/grid/border bằng JavaScript, không chỉ đổi CSS chữ ngoài chart.

Nhãn nút là **chế độ sẽ chuyển sang**, nên đang sáng thì nút ghi Chế độ tối. dataset.themeBound tránh gắn trùng listener khi mount nhiều lần. Theme được nhớ khi đổi trang; việc đổi theme ở tab khác không có listener storage để cập nhật tức thời tab hiện tại.

### 13.2. Các tiện ích chung

| Hàm | Nơi | Hiểu đơn giản |
|---|---|---|
| icon(name) | `utils.js:35` | Lấy đường nét SVG theo tên và bọc thẻ svg |
| hydrateIcons() | `utils.js:40` | Thay i[data-icon] trong HTML thành svg |
| fmtTime/fmtDate/fmtDateTime | `utils.js:51` | Biến timestamp thành chuỗi dễ đọc |
| fmtNumber() | `utils.js:85` | Số nguyên hiện nguyên, số lẻ làm tròn tối đa một chữ số |
| toast() | `utils.js:95` | Tạo thông báo góc màn hình, tự xóa sau 3500 ms |
| esc() | `utils.js:109` | Đổi ký tự đặc biệt thành HTML entity trước khi chèn chuỗi HTML |
| bindPasswordToggles() | `utils.js:114` | Gắn sự kiện đổi loại ô password |
| setFieldError() | `utils.js:126` | Tô ô invalid và ghi lỗi vào ID dạng inputId-error |

**textContent và innerHTML:** textContent hiện văn bản; innerHTML phân tích chuỗi thành thẻ. Code dùng innerHTML để tạo bảng/công tắc có cấu trúc; những nội dung do người dùng nhập cần escape trước khi ghép. esc giúp giảm nguy cơ chèn HTML ở những chỗ được sử dụng, không phải bảo đảm toàn bộ hệ thống đã an toàn. Toast dùng textContent để hiện nội dung thông báo.

### 13.3. Đọc những dòng JavaScript “nhìn hơi lạ”

| Cú pháp | Nghĩa trong bài |
|---|---|
| `(() => { ... })();` | Hàm tạo xong chạy ngay; giữ biến của từng trang trong phạm vi riêng |
| `const $ = id => document.getElementById(id)` | Tự đặt hàm viết tắt, không phải jQuery |
| `const Api = (() => { ... return {...}; })()` | Gom hàm dữ liệu; chỉ những gì return mới gọi được từ bên ngoài |
| `const` và `let` | const không gán lại biến; object const vẫn sửa thuộc tính được; let dùng khi cần gán lại |
| `map()` | Biến mỗi phần tử thành phần tử mới, ví dụ mỗi thiết bị thành một chuỗi HTML |
| `filter()` | Giữ các phần tử thỏa điều kiện |
| `find()` | Lấy phần tử đầu tiên phù hợp |
| `sort()` | Sắp xếp; code thường copy bằng [...] trước để tránh sửa thứ tự mảng gốc |
| `reverse()` | Đảo thứ tự; dùng đưa dữ liệu chart từ cũ đến mới |
| `slice()` | Lấy một đoạn mảng; dùng phân trang/giới hạn lịch sử |
| `join('')` | Ghép các mẩu HTML thành một chuỗi không có dấu phẩy |
| `Object.assign(state, {...})` | Chép các lựa chọn mới vào state hiện có |
| `{ ...u, fullName, email }` | Sao chép trường cũ rồi ghi đè tên/email |
| `a ? b : c` | Nếu a đúng dùng b, không thì c |
| `?.` | Nếu bên trái null/undefined thì dừng truy cập, tránh lỗi tương ứng |
| `??` | Chỉ dùng giá trị dự phòng khi null hoặc undefined |
| Toán tử OR (hai dấu gạch đứng) | Dùng dự phòng với giá trị falsy như rỗng, 0, null |
| `===` | So sánh nghiêm ngặt, không tự ép kiểu như == |
| `!!token()` | Đổi kết quả token sang boolean |
| Template literal | Chuỗi dùng backtick và ${...} để chèn biểu thức |
| `new CustomEvent(...)` | Tín hiệu do ứng dụng tự đặt tên; không phải dữ liệu đẩy từ máy chủ |

`preventDefault()` không chặn sự kiện nổi bọt lên cha; nó chặn hành vi mặc định như gửi form/chuyển href #. Event delegation của công tắc dựa vào sự kiện click nổi bọt.

## 14. Bảng tra nhanh: thầy chỉ vào đâu thì mở gì?

| Thầy hỏi/chỉ vào | Điểm mở đầu tốt nhất |
|---|---|
| Vào website lần đầu đi đâu? | `frontend/index.html:6` |
| Nút Đăng nhập | `frontend/js/login.js:23` |
| So tài khoản/mật khẩu ở đâu? | `frontend/js/api.js:73` — hiện chỉ kiểm tra rỗng |
| Ghi nhớ đăng nhập | `frontend/js/auth.js:10` |
| Chặn dashboard khi chưa login | `frontend/js/auth.js:38`, `frontend/js/dashboard.js:2` |
| Mắt hiện mật khẩu | `frontend/js/utils.js:114` |
| Đăng ký, điều kiện username | `frontend/js/register.js:17` |
| Quên mật khẩu | `frontend/js/login.js:18` |
| Điều khoản/chính sách | `frontend/js/register.js:12` |
| Danh sách menu | `frontend/js/layout.js:3` |
| Mục menu đang sáng | `frontend/js/layout.js:17`, `frontend/css/redesign.css:21` |
| Đồng hồ | `frontend/js/layout.js:47` |
| Nút đăng xuất | `frontend/js/auth.js:46` |
| Đổi theme | `frontend/js/theme.js:21` |
| Màu sáng/tối | `frontend/css/base.css:1` |
| Giá trị/nội dung nhận xét thẻ | `frontend/js/dashboard.js:43` |
| Dữ liệu mới nhất | `frontend/js/api.js:85` |
| Nhãn AHT20/BH1750 | `frontend/dashboard.html:22` |
| HTML của công tắc | `frontend/js/dashboard.js:54` |
| Bấm công tắc chạy gì? | `frontend/js/dashboard.js:66` |
| Ghi trạng thái/lịch sử | `frontend/js/api.js:109` |
| Vì sao không đổi khi lỗi? | `frontend/js/api.js:114` |
| Mất kết nối 5.6 giây | `frontend/js/api.js:113` |
| Khởi tạo biểu đồ | `frontend/js/dashboard.js:6` |
| Nút ẩn/hiện đường biểu đồ | `frontend/js/dashboard.js:34` |
| Nút Tất cả | `frontend/js/dashboard.js:39` |
| Ghép số đo vào chart | `frontend/js/dashboard.js:91` |
| Ba hành động gần đây | `frontend/js/dashboard.js:76` |
| Dữ liệu mẫu sinh ở đâu? | `frontend/js/api.js:19` |
| Lưu dữ liệu/chạy cập nhật | `frontend/js/api.js:17` |
| Kiểm tra dữ liệu đã lưu | `frontend/js/api.js:47` |
| Sắp xếp mới nhất trước | `frontend/js/api.js:56`, `frontend/js/api.js:132` |
| Tìm cảm biến | `frontend/js/sensor-history.js:30` |
| So 27 với 27. | `frontend/js/api.js:63` |
| Phân tích thời gian | `frontend/js/utils.js:63` |
| Lọc nhiều điều kiện hoạt động | `frontend/js/api.js:125` |
| Dòng đỏ/cảnh báo chậm | `frontend/js/action-history.js:10` |
| Số bản ghi mỗi trang | `frontend/js/sensor-history.js:51`, `frontend/js/action-history.js:50` |
| Công thức cắt trang | `frontend/js/api.js:57` |
| Các nút trang và dấu … | `frontend/js/pager.js:3` |
| Chỉnh sửa/Hủy/Lưu hồ sơ | `frontend/js/profile.js:18` |
| Hộp thoại mật khẩu | `frontend/js/profile.js:35` |
| Lưu/mở link dự án | `frontend/js/profile.js:49` |
| Các SVG | `frontend/js/utils.js:3` |
| Toast | `frontend/js/utils.js:95` |
| Thông báo đỏ dưới input | `frontend/js/utils.js:126` |
| Chia cột/căn giữa login | `frontend/css/redesign.css:143` |
| Giao diện điện thoại | `frontend/css/redesign.css:160` |
| Cách chạy và chọn cổng | `run.sh:1` |

## 15. Các giới hạn và câu hỏi bẫy cần trả lời trung thực

1. **Tên Api không đồng nghĩa backend.** Tìm trong api.js sẽ thấy thao tác mảng/localStorage, không có fetch, XMLHttpRequest hay WebSocket.
2. **Có token không có nghĩa bảo mật.** Auth.isLoggedIn chỉ xét token có tồn tại. Người dùng có thể sửa storage; chưa có server xác minh, hết hạn token hay JWT thật.
3. **Đăng ký không ràng buộc đăng nhập.** Đăng ký không lưu tài khoản, nên đăng nhập không tra kết quả đăng ký.
4. **Công tắc thay đổi trên giao diện không chứng minh đèn/quạt vật lý đổi.** Chưa có truyền lệnh/nhận xác nhận từ thiết bị.
5. **5600 ms là dữ liệu gán sẵn.** Không có quá trình đợi phản hồi 5.6 giây.
6. **Chữ live-chart chỉ là tên ID.** Không có dữ liệu realtime, không còn tính năng phát mẫu tự động.
7. **Chấm trạng thái không kiểm tra mạng.** Dòng Demo frontend/Bản trình diễn là nhãn tĩnh.
8. **Bộ lọc/đặt lại không xóa database.** Chúng đổi state và tính lại mảng hiển thị.
9. **Dữ liệu không tách theo tài khoản.** Một khóa demo dùng chung origin; đổi username vẫn thấy cùng dữ liệu thiết bị/lịch sử và liên kết dự án.
10. **Hai tab chưa đồng bộ ngay trên màn hình.** localStorage là kho chung nhưng code không nghe sự kiện storage; demo:data chỉ phát trong document hiện tại. Tải lại trang sẽ đọc kho mới.
11. **Sửa hồ sơ chưa cập nhật ngay sidebar.** Cần chuyển trang/tải lại để Layout lấy tên mới.
12. **README có thông tin cũ.** Bốn tài liệu vẫn trong folder nhưng mục xem/tải đã gỡ khỏi profile; một số CSS/API cũng còn nhánh tương thích cũ như Layout.setMqtt rỗng.
13. **Tên “quản trị viên” là dữ liệu demo.** Không có phân quyền chức năng theo vai trò.
14. **Chưa có tự động bật quạt khi nóng.** Những chữ Lạnh/Ấm/Nóng chỉ mô tả số đo.
15. **Phạm vi kiểm tra hiện tại:** tài liệu được đối chiếu tĩnh với mã nguồn và kiểm tra các hàm dữ liệu trong môi trường tách biệt; không khẳng định đã thử mọi trình duyệt/phần cứng.

Nếu thầy hỏi “sau này nối phần cứng thế nào?”, có thể trả lời: “Em sẽ thay phần dữ liệu demo bằng các lời gọi backend. Backend lưu dữ liệu và xử lý đăng nhập; một luồng nhận số đo từ thiết bị và một luồng gửi lệnh, nhận xác nhận từ thiết bị. Giao diện sẽ cập nhật theo kết quả thật và xử lý pending/timeout. Đó là hướng phát triển, chưa phải phần em đã làm.” Không cần tự khẳng định phải dùng một giao thức cụ thể khi chưa có thiết kế.

## 16. Bộ câu hỏi vấn đáp kèm trả lời ngắn

### 16.1. Tổng quan và HTML

**1. Em dùng công nghệ gì?** HTML tạo cấu trúc, CSS bố trí và màu sắc, JavaScript xử lý sự kiện/dữ liệu; Chart.js vẽ biểu đồ. Python phục vụ tệp tĩnh.

**2. Đây có phải website realtime không?** Chưa. Số đo là bộ mẫu đã lưu; giao diện vẽ lại sau thao tác dữ liệu. Chỉ đồng hồ tự cập nhật mỗi giây.

**3. Tại sao chia nhiều file?** Để tách trách nhiệm. Ví dụ API lo dữ liệu, Auth lo phiên, script dashboard lo cách hiện và nhận thao tác của dashboard. Muốn đổi cách lưu không phải sửa mọi đoạn dựng HTML.

**4. id và class khác nhau thế nào?** ID nhắm một phần tử trong trang, như devices; class áp dụng cho nhóm phần tử, như switch/card. JS dùng ID để tìm vùng, CSS thường dùng class để trang trí.

**5. data-type/data-dataset làm gì?** Lưu thông tin bổ sung ngay trên phần tử. JS đọc bằng dataset.type/dataset.dataset để biết thiết bị hoặc đường biểu đồ.

**6. Vì sao label có for?** Liên kết nhãn với input có ID tương ứng, giúp bấm nhãn focus ô và hỗ trợ công cụ đọc màn hình.

**7. button type button khác submit?** Submit gửi sự kiện submit của form; button thường chỉ làm thao tác riêng. Nút mắt/Đặt lại đặt type button để không vô tình submit.

**8. aria-checked/aria-pressed có tác dụng gì?** Diễn đạt trạng thái công tắc/nút cho công cụ hỗ trợ tiếp cận; trong bài CSS cũng dùng các thuộc tính này để đổi giao diện. Chúng không tự xử lý logic, JS phải cập nhật.

### 16.2. JavaScript và dữ liệu

**9. Bấm nút mà trang không reload vì sao?** Handler submit gọi preventDefault rồi tự xử lý bằng JavaScript.

**10. DOM là gì?** Cây các phần tử của trang mà trình duyệt tạo từ HTML. JavaScript tìm và đổi nội dung/thuộc tính của các phần tử đó.

**11. Tại sao HTML không có sẵn các dòng bảng?** JS lấy dữ liệu rồi sinh tr bằng map/join, gán innerHTML vào tbody; nhờ vậy cùng cấu trúc dùng cho nhiều dữ liệu.

**12. Render nghĩa là gì?** Lấy trạng thái/dữ liệu hiện tại và biến thành nội dung nhìn thấy trên màn hình.

**13. Bấm đèn, lịch sử biết bằng cách nào?** setDevice vừa cập nhật trạng thái vừa thêm action vào cùng object, write lưu và phát demo:data, dashboard render lại từ kho đó.

**14. Có phải bấm một nút là reload toàn trang không?** Không với công tắc/lọc: chỉ cập nhật DOM. Bấm menu href sang HTML khác mới là tải trang mới.

**15. localStorage có phải database không?** Nó là kho key–value trong trình duyệt, dùng lưu dữ liệu demo. Không thay được database máy chủ cho ứng dụng nhiều người dùng và xác thực.

**16. Vì sao dùng JSON?** Storage lưu chuỗi; object/mảng phải stringify trước khi lưu và parse khi đọc.

**17. Tải lại có mất đèn ON không?** Không nếu vẫn cùng origin và storage còn. Dữ liệu devices nằm trong localStorage.

**18. Xóa phiên rồi có mất theme không?** Không. Auth.clear không xóa sr_theme.

**19. Tại sao clone [...rows] trước sort?** sort sửa mảng được gọi. Sao chép trước giúp không đổi thứ tự mảng gốc ở vị trí đó.

**20. new CustomEvent khác gọi mạng chỗ nào?** CustomEvent là thông báo trong trang do code tự phát; không mở kết nối máy chủ và không tự truyền qua tab khác.

**21. async/await làm gì trong đăng nhập?** Giúp viết luồng chờ kết quả theo thứ tự dễ đọc. Hiện Api.login trả object ngay; await vẫn nhận được object đó, không biến nó thành yêu cầu mạng.

**22. try/catch/finally ở login để làm gì?** Try xử lý đăng nhập; catch hiện lỗi và xóa password khi lỗi; finally mở lại nút dù thành công hay thất bại trong luồng xử lý.

### 16.3. Dashboard, lọc và phân trang

**23. Vì sao có 90 bản ghi mà biểu đồ nói 30 mẫu?** Có 30 mốc, mỗi mốc ba loại cảm biến: 30 × 3 = 90 dòng; mỗi đường có 30 điểm.

**24. Lấy “mới nhất” bằng cách nào?** Sắp xếp recordedAt giảm dần rồi lấy bản đầu của mỗi loại. Cùng thời gian thì dùng ID để ổn định thứ tự.

**25. Vì sao hai trục y?** Ánh sáng lux có thang số lớn hơn; dùng trục phải 0–1000, nhiệt độ/độ ẩm dùng trục trái 0–100.

**26. Ẩn một đường có mất dữ liệu không?** Không; chỉ đổi trạng thái hiển thị dataset trong Chart.js.

**27. Nút Tất cả có phải bộ lọc dữ liệu không?** Không; nó bật lại cả ba đường biểu đồ.

**28. Khi mô phỏng mất kết nối thì sao?** Không đổi reportedState, ghi lệnh với DISCONNECT và 5600 ms, hiện toast lỗi.

**29. Thời gian phản hồi có đo thật không?** Chưa. Thành công là số ngẫu nhiên trong khoảng, mất kết nối là 5600 ms gán sẵn.

**30. Tìm 27 có lấy 27.5 không?** Không. Số 27 khớp chính xác; muốn phần lẻ của nhóm 27 thì nhập 27. theo quy ước của demo.

**31. Vì sao nhập 2026-10 tìm cả tháng?** Hàm parse tạo đầu tháng và cuối tháng rồi so timestamp nằm trong khoảng.

**32. Làm sao chặn ngày 30/2?** Tạo Date rồi so ngược từng thành phần với chuỗi nhập. Nếu Date tự chuyển sang tháng khác thì từ chối.

**33. Lọc xong vì sao quay về trang 1?** Số kết quả có thể ít đi, trang cũ có thể không còn hợp lệ.

**34. Phân trang ở đâu?** pageOf trong api.js cắt mảng, Pager.render trong pager.js vẽ nút, script trang cập nhật state.page khi bấm nút.

**35. Có 23 dòng, 10 dòng/trang thì mấy trang?** Math.ceil(23/10) = 3. Trang cuối có 3 dòng.

**36. Chọn Quạt và BẬT là AND hay OR?** AND; phải đồng thời là quạt và lệnh bật.

**37. Tại sao tổng đầu trang không giảm khi tìm?** Tổng đầu trang đếm toàn bộ dữ liệu; số bản ghi phù hợp đếm kết quả lọc.

**38. Đặt lại có xóa lịch sử không?** Không; nó xóa điều kiện tìm kiếm và về trang 1.

### 16.4. CSS, hồ sơ và hướng phát triển

**39. Tại sao đổi theme mọi nơi đổi màu?** Các thành phần dùng biến CSS; đổi data-theme trên html thì bộ biến dark được áp dụng.

**40. Vì sao biểu đồ cũng cần xử lý theme bằng JS?** Chart vẽ trên canvas; màu trục/lưới phải được truyền lại qua cấu hình Chart.js.

**41. Responsive làm bằng gì?** Media query thay số cột, khoảng cách và các phần ẩn/hiện theo chiều rộng màn hình.

**42. Flex và Grid khác gì trong bài?** Flex xếp hàng/cột đơn như topbar; Grid chia nhiều cột/hàng như các thẻ chỉ số và bộ lọc.

**43. Vì sao sửa CSS cũ mà không thấy đổi?** Có thể selector không dùng nữa, bị redesign.css/selector cụ thể hơn ghi đè, hoặc trình duyệt đang cache. Cần xem đúng class và quy tắc đang áp dụng.

**44. ?v=clean1 ở tên CSS/JS làm gì?** Là query phiên bản giúp đổi URL tải tài nguyên khi cần tránh bản cache cũ. Không phải endpoint backend hay chế độ dữ liệu đặc biệt.

**45. Đổi mật khẩu có thật không?** Chưa. Chỉ kiểm tra biểu mẫu và hiện thông báo minh họa, không lưu mật khẩu.

**46. Tại sao ID/vai trò không sửa được?** HTML để readonly và hàm edit chỉ mở tên/email. Đây là giới hạn giao diện, chưa phải bảo vệ quyền bằng server.

**47. Lưu profile xong tên sidebar chưa đổi vì sao?** Sidebar đã được Layout dựng trước đó và không được mount lại khi render profile.

**48. Link GitHub là tích hợp GitHub à?** Chưa; chỉ lưu URL và mở tab mới.

**49. Có thể chạy khi không có internet không?** Các tài nguyên thiết yếu gồm Chart.js đã nằm trong folder; dùng máy chủ tĩnh cục bộ có thể trình diễn mà không cần backend Internet. Các URL ngoài do người dùng mở vẫn cần mạng tùy địa chỉ.

**50. Nếu làm bản thật, phần nào thay trước?** Lớp dữ liệu Api: gọi backend và nhận dữ liệu thật, rồi bổ sung xác thực server, lưu database, gửi lệnh/nhận xác nhận thiết bị và xử lý lỗi bất đồng bộ. Giữ giao diện nhưng điều chỉnh luồng theo phản hồi thật.

## 17. Kịch bản tự luyện và trình diễn

### 17.1. Chuẩn bị trước khi gặp thầy

1. Mở Terminal tại folder project, chạy `./run.sh`, mở đúng địa chỉ in ra. Nếu script không chạy do quyền thực thi, có thể gọi `bash run.sh`. Dừng bằng Ctrl+C.
2. Giữ nhất quán hostname và cổng để dữ liệu demo không bị đổi kho. Script tự chọn 8080–8099 khi chưa chỉ định cổng; có thể chạy `SERVER_PORT=8090 ./run.sh` khi muốn chọn, miễn cổng đó đang trống.
3. Dùng tài khoản minh họa như admin / 123456, không nhập mật khẩu cá nhân thật.
4. Mở sẵn các file: dashboard.js, api.js, auth.js, sensor-history.js, utils.js, redesign.css.
5. Nhìn ngày đang có trong bảng để chọn ví dụ lọc. Không mặc định dữ liệu seed hôm nay sẽ tự chuyển sang ngày mai.
6. Nếu giao diện cũ xuất hiện, tải lại mạnh bằng Cmd+Shift+R trên Mac. Không cần xóa hết storage chỉ để cập nhật CSS/JS.

run.sh dùng lsof tìm cổng trống, chuyển vào frontend rồi chạy `python3 -m http.server ... --bind 127.0.0.1`. Cổng là cửa truy cập dịch vụ trên máy. Bind 127.0.0.1 phục vụ trên máy cục bộ; không phải cấu hình triển khai cho người khác truy cập qua mạng LAN. Máy chủ này không xử lý đăng nhập hay dữ liệu nghiệp vụ.

### 17.2. Demo khoảng 5–7 phút

1. **Đăng nhập:** thử bỏ trống một ô để thấy validation, rồi đăng nhập. Giải thích đoạn submit, Api.login và Auth.save.
2. **Dashboard:** chỉ ba loại số đo và đơn vị; giải thích mới nhất và 30 điểm mỗi đường.
3. **Biểu đồ:** ẩn ánh sáng, quan sát trục phải ẩn; bấm Tất cả để khôi phục.
4. **Thiết bị:** bật đèn, chỉ trạng thái/màu công tắc và mục lịch sử mới xuất hiện. Nói rõ lưu localStorage.
5. **Lỗi:** tích mô phỏng mất kết nối, bấm tắt; chỉ ra đèn vẫn bật và có lịch sử lỗi. Bỏ tích sau demo.
6. **Lịch sử hoạt động:** chọn Đèn LED + Mất kết nối, tìm, giải thích AND và phản hồi 5.6 giây; Đặt lại.
7. **Lịch sử cảm biến:** chọn Nhiệt độ để trống, tìm; chọn một giá trị đang có để tìm chính xác. Đổi sang Thời gian rồi nhập tháng/ngày lấy từ bảng.
8. **Phân trang:** đổi 10 thành 5, thử trang 2 và giải thích slice.
9. **Hồ sơ/theme:** sửa tên, lưu; thử mở dialog mật khẩu và giải thích giới hạn. Chuyển sáng/tối.

Đừng tự xóa dữ liệu trước giờ báo cáo nếu chưa cần: lịch sử thử và ngày dữ liệu đang có giúp chuẩn bị ví dụ. Nếu cần bộ mẫu mới thì chỉ xóa khóa sr_demo_data_v2 trong công cụ trình duyệt rồi tải lại; thao tác này làm mất lịch sử/thiết bị demo cũ ở origin đó. Đây là hướng dẫn tùy chọn, tài liệu không tự thực hiện việc xóa.

### 17.3. Tự kiểm tra mức hiểu

Bạn nên tự nói được mà không nhìn tài liệu: “Bấm đèn → handler ở đâu → trạng thái mới tính thế nào → lưu chỗ nào → lịch sử thêm ở đâu → dashboard cập nhật bằng gì”. Nếu chưa nói trôi, đọc lại mục 6.3 rồi đi theo từng hàm trong code.

Sau đó thử ba bài nhỏ bằng cách suy nghĩ, chưa cần sửa project: muốn tối đa 20 dòng/trang mặc định sửa state.limit và input value ở đâu? Muốn đổi ngưỡng Nóng thì sửa descriptions ở đâu? Muốn thêm một menu thì mảng links và trang đích cần gì? Khi trả lời được, bạn đã hiểu cách nối giao diện với mã nguồn thay vì chỉ nhớ tên file.

## 18. Tờ ôn nhanh trước khi vào phòng

**Một câu về kiến trúc:** HTML dựng khung → JavaScript nhận sự kiện → Api xử lý mảng và storage → hàm render cập nhật DOM; CSS quyết định cách hiển thị.

**Năm điểm neo trong code:** dashboard.js nhận thao tác; api.js giữ logic dữ liệu; utils.js giải thích lọc thời gian; auth.js quản lý phiên; redesign.css quyết định bố cục hiện tại.

**Ba luồng phải kể được:**

- Đăng nhập: submit → validate → Api.login → Auth.save → dashboard.
- Công tắc: click → data-type → tính ON/OFF → Api.setDevice → localStorage + demo:data → render.
- Tìm kiếm: submit → kiểm tra ô → cập nhật state/page=1 → Api.filter/sort/pageOf → dựng tbody + Pager.

**Các con số:** 3 loại cảm biến; 30 mốc × 3 = 90 dòng; 2 thiết bị; 16 hành động seed; tối đa 300 hành động lưu; limit 1–100; phản hồi thành công mô phỏng 400–2500 ms; lỗi 5600 ms; ngưỡng cảnh báo >5000 ms; toast 3500 ms; đồng hồ 1000 ms.

**Khi chưa nhớ dòng nào:** tìm ID/class trên HTML → tìm ID/class đó trong JS → đọc handler addEventListener → đi theo hàm Api được gọi → tìm render/load cập nhật kết quả. Nếu là màu/bố cục, tìm class trong redesign.css trước.

**Cách trả lời khi thầy hỏi phần chưa làm:** “Ở phiên bản này em mới làm …; hiện code xử lý bằng …; để làm thật em cần bổ sung …”. Nói đúng phạm vi rồi chỉ ra đoạn code mình hiểu sẽ vững hơn cố gọi demo là hệ thống IoT hoàn chỉnh.
