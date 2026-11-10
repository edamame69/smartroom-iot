package com.smartroom.repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import jakarta.annotation.PostConstruct;

@Repository
public class SmartRoomRepository {
    private final JdbcTemplate db;

    public SmartRoomRepository(JdbcTemplate db) {
        this.db = db;
    }

    @PostConstruct
    void init() {
        db.execute(
                "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, full_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'USER', created_at TEXT NOT NULL)");
        db.execute(
                "CREATE TABLE IF NOT EXISTS iot_node (id INTEGER PRIMARY KEY, name TEXT NOT NULL, device_type TEXT NOT NULL, mac_address TEXT, is_online INTEGER NOT NULL DEFAULT 0, last_seen TEXT, created_at TEXT NOT NULL)");
        db.execute(
                "CREATE TABLE IF NOT EXISTS sensor (id INTEGER PRIMARY KEY, iot_node_id INTEGER NOT NULL REFERENCES iot_node(id), name TEXT NOT NULL, type TEXT NOT NULL UNIQUE, unit TEXT NOT NULL, mqtt_topic TEXT NOT NULL UNIQUE, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)");
        db.execute(
                "CREATE TABLE IF NOT EXISTS sensor_data (id INTEGER PRIMARY KEY AUTOINCREMENT, sensor_id INTEGER NOT NULL REFERENCES sensor(id), value REAL NOT NULL, recorded_at TEXT NOT NULL)");
        db.execute("CREATE INDEX IF NOT EXISTS sensor_data_time ON sensor_data(recorded_at DESC)");
        db.execute(
                "CREATE TABLE IF NOT EXISTS actuator (id INTEGER PRIMARY KEY, iot_node_id INTEGER NOT NULL REFERENCES iot_node(id), name TEXT NOT NULL, type TEXT NOT NULL UNIQUE, desired_state TEXT NOT NULL DEFAULT 'OFF', reported_state TEXT NOT NULL DEFAULT 'OFF', mqtt_control_topic TEXT NOT NULL UNIQUE, mqtt_status_topic TEXT NOT NULL UNIQUE, updated_at TEXT NOT NULL)");
        db.execute(
                "CREATE TABLE IF NOT EXISTS action_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES user(id), actuator_id INTEGER NOT NULL REFERENCES actuator(id), action TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, response_time_ms INTEGER, result TEXT)");
        db.execute("CREATE INDEX IF NOT EXISTS action_history_time ON action_history(created_at DESC)");
        String now = Instant.now().toString();
        db.update(
                "INSERT OR IGNORE INTO iot_node(id,name,device_type,created_at) VALUES(1,'ESP8266 Room Controller','ESP8266',?)",
                now);
        List<Object[]> sensors = List.of(
                new Object[] { 1, "Nhiệt độ", "TEMPERATURE", "°C", "smartroom/sensor/temperature" },
                new Object[] { 2, "Độ ẩm", "HUMIDITY", "%", "smartroom/sensor/humidity" },
                new Object[] { 3, "Ánh sáng", "LIGHT", "ADC", "smartroom/sensor/light" });
        for (Object[] row : sensors)
            db.update(
                    "INSERT OR IGNORE INTO sensor(id,iot_node_id,name,type,unit,mqtt_topic,created_at) VALUES(?,1,?,?,?,?,?)",
                    row[0], row[1], row[2], row[3], row[4], now);
        db.update(
                "INSERT OR IGNORE INTO actuator(id,iot_node_id,name,type,mqtt_control_topic,mqtt_status_topic,updated_at) VALUES(1,1,'Đèn LED','LIGHT','smartroom/light/control','smartroom/light/status',?)",
                now);
        db.update(
                "INSERT OR IGNORE INTO actuator(id,iot_node_id,name,type,mqtt_control_topic,mqtt_status_topic,updated_at) VALUES(2,1,'Quạt','FAN','smartroom/fan/control','smartroom/fan/status',?)",
                now);
    }

    public List<Map<String, Object>> sensors() {
        return db.queryForList(
                "SELECT d.id,s.name,s.type,s.unit,d.value,d.recorded_at AS recordedAt FROM sensor_data d JOIN sensor s ON s.id=d.sensor_id ORDER BY d.recorded_at DESC,d.id DESC");
    }

    public List<Map<String, Object>> devices() {
        return db.queryForList(
                "SELECT id,name,type,desired_state AS desiredState,reported_state AS reportedState FROM actuator ORDER BY id");
    }

    public List<Map<String, Object>> actions() {
        return db.queryForList(
                "SELECT h.id,COALESCE(u.username,'Tài khoản đã xóa') AS username,a.name AS actuatorName,a.type AS actuatorType,h.action,h.status,h.response_time_ms AS responseTimeMs,h.created_at AS createdAt,h.result FROM action_history h LEFT JOIN user u ON u.id=h.user_id JOIN actuator a ON a.id=h.actuator_id ORDER BY h.created_at DESC,h.id DESC");
    }

    public Map<String, Object> profile(int id) {
        return db.queryForMap("SELECT id,printf('USR%03d',id) AS code,username,email,full_name AS fullName,role FROM user WHERE id=?", id);
    }

    public boolean userExists(int id) {
        return db.queryForObject("SELECT count(*) FROM user WHERE id=?", Integer.class, id) > 0;
    }

    public List<Map<String, Object>> findUser(String login) {
        return db.queryForList("SELECT id,password_hash FROM user WHERE username=? OR email=? LIMIT 1", login, login);
    }

    public int usernameCount(String username) {
        return db.queryForObject("SELECT count(*) FROM user WHERE username=?", Integer.class, username);
    }

    public int emailCount(String email, int excludeUserId) {
        return db.queryForObject("SELECT count(*) FROM user WHERE email=? AND id<>?", Integer.class, email, excludeUserId);
    }

    public void createUser(String username, String email, String hash) {
        db.update("INSERT INTO user(username,email,password_hash,full_name,role,created_at) VALUES(?,?,?,?,?,?)",
                username, email, hash, username, "USER", Instant.now().toString());
    }

    public void updateProfile(int id, String fullName, String email) {
        db.update("UPDATE user SET full_name=?,email=? WHERE id=?", fullName, email, id);
    }

    public String passwordHash(int id) {
        return db.queryForObject("SELECT password_hash FROM user WHERE id=?", String.class, id);
    }

    public void updatePassword(int id, String hash) {
        db.update("UPDATE user SET password_hash=? WHERE id=?", hash, id);
    }

    public String nodeLastSeen() {
        return db.queryForObject("SELECT last_seen FROM iot_node WHERE id=1", String.class);
    }

    public boolean hasPending(String type) {
        return db.queryForObject("SELECT count(*) FROM action_history WHERE actuator_id=(SELECT id FROM actuator WHERE type=?) AND status='PENDING'", Integer.class, type) > 0;
    }

    public int actuatorId(String type) {
        return db.queryForObject("SELECT id FROM actuator WHERE type=?", Integer.class, type);
    }

    public void setDesired(int actuatorId, String state, String now) {
        db.update("UPDATE actuator SET desired_state=?,updated_at=? WHERE id=?", state, now, actuatorId);
    }

    public int createAction(int userId, int actuatorId, String state, String now) {
        return db.queryForObject("INSERT INTO action_history(user_id,actuator_id,action,status,created_at,result) VALUES(?,?,?,'PENDING',?,'Đang xử lý') RETURNING id",
                Integer.class, userId, actuatorId, state, now);
    }

    public void failPublish(int actionId) {
        db.update("UPDATE action_history SET status='FAILED',result='Không gửi được MQTT' WHERE id=?", actionId);
    }

    public void recordSensor(String topic, double value, String now) {
        db.update("INSERT INTO sensor_data(sensor_id,value,recorded_at) SELECT id,?,? FROM sensor WHERE mqtt_topic=?", value, now, topic);
    }

    public void recordReported(String type, String state, String now) {
        db.update("UPDATE actuator SET reported_state=?,updated_at=? WHERE type=?", state, now, type);
    }

    public List<Map<String, Object>> latestAction(String type) {
        return db.queryForList("SELECT h.id,h.user_id,h.actuator_id,h.action,h.status,h.result,h.created_at,a.desired_state FROM action_history h JOIN actuator a ON a.id=h.actuator_id WHERE a.type=? ORDER BY h.id DESC LIMIT 1", type);
    }

    public void confirmAction(Object id, long elapsed) {
        db.update("UPDATE action_history SET status='SUCCESS',response_time_ms=?,result='ESP8266 đã xác nhận' WHERE id=?", elapsed, id);
    }

    public void timeoutAction(Object id) {
        db.update("UPDATE action_history SET status='FAILED',response_time_ms=10000,result='ESP8266 không xác nhận trong 10 giây' WHERE id=? AND status='PENDING'", id);
    }

    public void recordLateSuccess(Map<String, Object> command, String now, long elapsed) {
        db.update("INSERT INTO action_history(user_id,actuator_id,action,status,created_at,response_time_ms,result) VALUES(?,?,?,'SUCCESS',?,?,'ESP8266 xác nhận sau khi kết nối lại')",
                command.get("user_id"), command.get("actuator_id"), command.get("action"), now, elapsed);
    }

    public void markSeen(String now) {
        db.update("UPDATE iot_node SET last_seen=?,is_online=1 WHERE id=1", now);
    }

    public void expireActions(String cutoff) {
        db.update("UPDATE action_history SET status='FAILED',response_time_ms=10000,result='ESP8266 không xác nhận trong 10 giây' WHERE status='PENDING' AND created_at<?", cutoff);
    }

    public void markOffline() {
        db.update("UPDATE iot_node SET is_online=0 WHERE id=1 AND is_online<>0");
    }
}
