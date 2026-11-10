package com.smartroom.controller;

import com.smartroom.ApiException;
import com.smartroom.service.AuthService;
import com.smartroom.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final AuthService auth;
    private final RoomService room;
    private final SecureRandom random = new SecureRandom();

    public ApiController(AuthService auth, RoomService room) {
        this.auth = auth;
        this.room = room;
    }

    record Credentials(String username, String password) { }
    record Registration(String username, String email, String password) { }
    record Profile(String fullName, String email) { }
    record PasswordChange(String current, String next) { }
    record Command(String state) { }

    private int user(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        ApiException.require(session != null && session.getAttribute("userId") != null,
                HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        return (int) session.getAttribute("userId");
    }

    private void csrf(HttpServletRequest request) {
        user(request);
        ApiException.require(request.getHeader("X-SR-CSRF") != null
                && request.getHeader("X-SR-CSRF").equals(request.getSession(false).getAttribute("csrf")),
                HttpStatus.FORBIDDEN, "Phiên xác thực không hợp lệ");
    }

    @PostMapping("/auth/register")
    Map<String, Object> register(@RequestBody Registration input) {
        ApiException.require(input != null, HttpStatus.BAD_REQUEST, "Dữ liệu đăng ký không hợp lệ");
        auth.register(input.username(), input.email(), input.password());
        return Map.of("message", "Đăng ký thành công");
    }

    @PostMapping("/auth/login")
    Map<String, Object> login(@RequestBody Credentials input, HttpServletRequest request) {
        ApiException.require(input != null, HttpStatus.BAD_REQUEST, "Vui lòng nhập tài khoản và mật khẩu");
        int id = auth.authenticate(input.username(), input.password());
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        session.setAttribute("userId", id);
        session.setAttribute("csrf", token);
        return Map.of("token", token, "user", auth.profile(id));
    }

    @PostMapping("/auth/logout")
    Map<String, Object> logout(HttpServletRequest request) {
        csrf(request);
        request.getSession(false).invalidate();
        return Map.of("message", "Đã đăng xuất");
    }

    @GetMapping("/auth/me") Map<String, Object> me(HttpServletRequest request) { return auth.profile(user(request)); }

    @PutMapping("/profile")
    Map<String, Object> update(@RequestBody Profile input, HttpServletRequest request) {
        csrf(request);
        ApiException.require(input != null, HttpStatus.BAD_REQUEST, "Dữ liệu hồ sơ không hợp lệ");
        return auth.updateProfile(user(request), input.fullName(), input.email());
    }

    @PutMapping("/profile/password")
    Map<String, Object> password(@RequestBody PasswordChange input, HttpServletRequest request) {
        csrf(request);
        ApiException.require(input != null, HttpStatus.BAD_REQUEST, "Dữ liệu mật khẩu không hợp lệ");
        auth.changePassword(user(request), input.current(), input.next());
        return Map.of("message", "Đã đổi mật khẩu");
    }

    @GetMapping("/state") Map<String, Object> state(HttpServletRequest request) { user(request); return room.state(); }
    @GetMapping("/sensors/latest") Map<String, Object> latest(HttpServletRequest request) { user(request); return room.latest(); }

    @GetMapping("/sensors/history")
    Map<String, Object> sensorHistory(@RequestParam(defaultValue = "ALL") String searchType,
            @RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit, HttpServletRequest request) {
        user(request);
        return room.sensorHistory(searchType, keyword, page, limit);
    }

    @GetMapping("/actuators") List<Map<String, Object>> actuators(HttpServletRequest request) {
        user(request); return room.actuators();
    }

    @GetMapping("/actuators/{id}") Map<String, Object> actuator(@PathVariable int id, HttpServletRequest request) {
        user(request); return room.actuator(id);
    }

    @PutMapping("/actuators/{id}/state")
    ResponseEntity<Map<String, Object>> actuatorCommand(@PathVariable int id, @RequestBody Command input,
            HttpServletRequest request) {
        csrf(request);
        ApiException.require(input != null, HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        String type = (String) room.actuator(id).get("type");
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(room.command(user(request), type, input.state()));
    }

    @GetMapping("/iot-node/status") Map<String, Object> nodeStatus(HttpServletRequest request) {
        user(request); return room.nodeStatus();
    }

    @GetMapping("/actions")
    Map<String, Object> actions(@RequestParam(defaultValue = "") String actuator,
            @RequestParam(defaultValue = "") String action, @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String time, @RequestParam(defaultValue = "") String date,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int limit,
            HttpServletRequest request) {
        user(request);
        return room.actions(actuator, action, status, time, date, page, limit);
    }

    @PostMapping("/devices/{type}")
    ResponseEntity<Map<String, Object>> command(@PathVariable String type, @RequestBody Command input,
            HttpServletRequest request) {
        csrf(request);
        ApiException.require(input != null, HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(room.command(user(request), type, input.state()));
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, String>> error(ApiException exception) {
        return ResponseEntity.status(exception.status).body(Map.of("message", exception.getMessage()));
    }
}
