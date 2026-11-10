package com.smartroom.service;

import com.smartroom.ApiException;
import com.smartroom.repository.SmartRoomRepository;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Pattern USERNAME = Pattern.compile("[A-Za-z0-9_.]{3,30}");
    private static final Pattern EMAIL = Pattern.compile("[^\\s@]+@[^\\s@]+\\.[^\\s@]+");
    private final SmartRoomRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(SmartRoomRepository repository) { this.repository = repository; }

    private static boolean validEmail(String value) {
        return value != null && value.length() <= 255 && EMAIL.matcher(value).matches();
    }

    public void register(String username, String email, String password) {
        ApiException.require(username != null && USERNAME.matcher(username).matches(), HttpStatus.BAD_REQUEST, "Tên đăng nhập không hợp lệ");
        ApiException.require(validEmail(email), HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        ApiException.require(password != null && password.length() >= 6, HttpStatus.BAD_REQUEST, "Mật khẩu tối thiểu 6 ký tự");
        ApiException.require(repository.usernameCount(username) == 0, HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại");
        ApiException.require(repository.emailCount(email, -1) == 0, HttpStatus.CONFLICT, "Email đã tồn tại");
        repository.createUser(username, email, encoder.encode(password));
    }

    public int authenticate(String login, String password) {
        ApiException.require(login != null && password != null, HttpStatus.BAD_REQUEST, "Vui lòng nhập tài khoản và mật khẩu");
        List<Map<String, Object>> rows = repository.findUser(login);
        ApiException.require(!rows.isEmpty() && encoder.matches(password, (String) rows.get(0).get("password_hash")),
                HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không đúng");
        return ((Number) rows.get(0).get("id")).intValue();
    }

    public Map<String, Object> profile(int id) { return repository.profile(id); }

    public Map<String, Object> updateProfile(int id, String name, String email) {
        ApiException.require(name != null && !name.isBlank() && name.length() <= 100, HttpStatus.BAD_REQUEST, "Họ tên không hợp lệ");
        ApiException.require(validEmail(email), HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        ApiException.require(repository.emailCount(email, id) == 0, HttpStatus.CONFLICT, "Email đã tồn tại");
        repository.updateProfile(id, name.trim(), email);
        return repository.profile(id);
    }

    public void changePassword(int id, String current, String next) {
        ApiException.require(current != null && encoder.matches(current, repository.passwordHash(id)),
                HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        ApiException.require(next != null && next.length() >= 6, HttpStatus.BAD_REQUEST, "Mật khẩu mới tối thiểu 6 ký tự");
        repository.updatePassword(id, encoder.encode(next));
    }
}
