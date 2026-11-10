package com.smartroom.service;

import com.smartroom.ApiException;
import com.smartroom.mqtt.MqttGateway;
import com.smartroom.repository.SmartRoomRepository;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RoomService {
    private static final DateTimeFormatter DISPLAY_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private final SmartRoomRepository repository;
    private final MqttGateway mqtt;
    private final TelemetryService telemetry;

    public RoomService(SmartRoomRepository repository, MqttGateway mqtt, TelemetryService telemetry) {
        this.repository = repository;
        this.mqtt = mqtt;
        this.telemetry = telemetry;
    }

    public Map<String, Object> state() {
        return Map.of("sensors", repository.sensors(), "actions", repository.actions(), "devices", repository.devices(),
                "online", telemetry.deviceOnline());
    }

    public Map<String, Object> latest() {
        List<Map<String, Object>> rows = repository.sensors();
        return Map.of("temperature", rows.stream().filter(r -> r.get("type").equals("TEMPERATURE")).findFirst().orElse(Map.of()),
                "humidity", rows.stream().filter(r -> r.get("type").equals("HUMIDITY")).findFirst().orElse(Map.of()),
                "light", rows.stream().filter(r -> r.get("type").equals("LIGHT")).findFirst().orElse(Map.of()));
    }

    private static String displayTime(Object value) { return DISPLAY_TIME.format(Instant.parse((String) value)); }

    private static boolean valueMatches(Object value, String term) {
        String numeric = term.replace(',', '.');
        double measured = ((Number) value).doubleValue();
        if (numeric.matches("[+-]?\\d+\\."))
            return (int) measured == Double.parseDouble(numeric) && measured != Math.floor(measured);
        if (!numeric.matches("[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)")) return false;
        return measured == Double.parseDouble(numeric);
    }

    private static Map<String, Object> page(List<Map<String, Object>> rows, int page, int limit) {
        int size = Math.min(100, Math.max(1, limit));
        int total = rows.size();
        int number = Math.min(Math.max(1, page), Math.max(1, (total + size - 1) / size));
        return Map.of("items", rows.subList((number - 1) * size, Math.min(number * size, total)),
                "page", number, "limit", size, "total", total);
    }

    public Map<String, Object> sensorHistory(String searchType, String keyword, int page, int limit) {
        ApiException.require(List.of("ALL", "TIME", "TEMPERATURE", "HUMIDITY", "LIGHT").contains(searchType),
                HttpStatus.BAD_REQUEST, "Loại cảm biến không hợp lệ");
        String term = keyword.trim().toLowerCase();
        List<Map<String, Object>> rows = repository.sensors().stream().filter(r -> {
            if (!searchType.equals("ALL") && !searchType.equals("TIME") && !r.get("type").equals(searchType)) return false;
            if (term.isEmpty()) return true;
            if (searchType.equals("TIME")) return displayTime(r.get("recordedAt")).contains(term);
            if (valueMatches(r.get("value"), term)) return true;
            return searchType.equals("ALL") && (String.valueOf(r.get("name")).toLowerCase().contains(term)
                    || displayTime(r.get("recordedAt")).contains(term));
        }).toList();
        Map<String, Object> result = new HashMap<>(page(rows, page, limit));
        result.put("chart", rows.stream().limit(90).toList());
        return result;
    }

    public List<Map<String, Object>> actuators() { return repository.devices(); }

    public Map<String, Object> actuator(int id) {
        return repository.devices().stream().filter(r -> ((Number) r.get("id")).intValue() == id).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị"));
    }

    public Map<String, Object> nodeStatus() {
        return Map.of("isOnline", telemetry.deviceOnline(), "lastSeen",
                java.util.Optional.ofNullable(repository.nodeLastSeen()).orElse(""));
    }

    public Map<String, Object> actions(String actuator, String action, String status, String time, String date,
            int page, int limit) {
        List<Map<String, Object>> rows = repository.actions().stream()
                .filter(r -> (actuator.isEmpty() || r.get("actuatorType").equals(actuator))
                        && (action.isEmpty() || r.get("action").equals(action))
                        && (status.isEmpty() || r.get("status").equals(status))
                        && (time.isEmpty() || displayTime(r.get("createdAt")).contains(time.trim()))
                        && (date.isEmpty() || displayTime(r.get("createdAt")).startsWith(date.trim())))
                .toList();
        Map<String, Object> result = new HashMap<>(page(rows, page, limit));
        result.put("summary", Map.of("total", rows.size(),
                "success", rows.stream().filter(r -> r.get("status").equals("SUCCESS")).count(),
                "pending", rows.stream().filter(r -> r.get("status").equals("PENDING")).count(),
                "failed", rows.stream().filter(r -> r.get("status").equals("FAILED")).count()));
        return result;
    }

    public Map<String, Object> command(int userId, String type, String state) {
        ApiException.require(type.equals("FAN") || type.equals("LIGHT"), HttpStatus.BAD_REQUEST, "Thiết bị không hợp lệ");
        ApiException.require(state != null && (state.equals("ON") || state.equals("OFF")),
                HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        ApiException.require(!repository.hasPending(type), HttpStatus.CONFLICT, "Thiết bị đang xử lý lệnh khác");
        int actuatorId = repository.actuatorId(type);
        String now = Instant.now().toString();
        repository.setDesired(actuatorId, state, now);
        int actionId = repository.createAction(userId, actuatorId, state, now);
        try { mqtt.publish(type, state); }
        catch (Exception e) {
            repository.failPublish(actionId);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không kết nối được MQTT broker");
        }
        return Map.of("actionId", actionId, "status", "PENDING");
    }
}
