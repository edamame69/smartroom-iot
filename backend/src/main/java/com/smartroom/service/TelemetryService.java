package com.smartroom.service;

import com.smartroom.repository.SmartRoomRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TelemetryService {
    private final SmartRoomRepository repository;

    public TelemetryService(SmartRoomRepository repository) { this.repository = repository; }

    public boolean deviceOnline() {
        String last = repository.nodeLastSeen();
        return last != null && Duration.between(Instant.parse(last), Instant.now()).getSeconds() < 12;
    }

    @Transactional
    public void received(String topic, String value, boolean retained) {
        String now = Instant.now().toString();
        try {
            if (topic.startsWith("smartroom/sensor/")) {
                double number = Double.parseDouble(value);
                if (!Double.isFinite(number)) return;
                if (topic.endsWith("/humidity") && (number < 0 || number > 100)) return;
                if (topic.endsWith("/light") && (number < 0 || number > 1023)) return;
                if (topic.endsWith("/temperature") && (number < -40 || number > 80)) return;
                repository.recordSensor(topic, number, now);
            } else if (topic.endsWith("/status") && (value.equals("ON") || value.equals("OFF"))) {
                String type = topic.contains("/fan/") ? "FAN" : "LIGHT";
                repository.recordReported(type, value, now);
                List<Map<String, Object>> latest = repository.latestAction(type);
                if (!retained && !latest.isEmpty() && value.equals(latest.get(0).get("action"))
                        && value.equals(latest.get(0).get("desired_state"))) {
                    Map<String, Object> row = latest.get(0);
                    long elapsed = Duration.between(Instant.parse((String) row.get("created_at")), Instant.now()).toMillis();
                    if (row.get("status").equals("PENDING") && elapsed < 10_000) {
                        repository.confirmAction(row.get("id"), elapsed);
                    } else if (row.get("status").equals("PENDING") ||
                            (row.get("status").equals("FAILED") && "ESP8266 không xác nhận trong 10 giây".equals(row.get("result")))) {
                        if (row.get("status").equals("PENDING")) repository.timeoutAction(row.get("id"));
                        repository.recordLateSuccess(row, now, elapsed);
                    }
                }
            } else return;
            if (!retained) repository.markSeen(now);
        } catch (NumberFormatException e) { /* Bỏ bản tin sai định dạng. */ }
    }

    @Scheduled(fixedDelay = 1000)
    void expire() {
        repository.expireActions(Instant.now().minusSeconds(10).toString());
        if (!deviceOnline()) repository.markOffline();
    }
}
