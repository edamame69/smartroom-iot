package com.smartroom.mqtt;

import com.smartroom.service.TelemetryService;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MqttGateway implements MqttCallback {
    private final TelemetryService telemetry;
    private final String url, username, password;
    private volatile MqttClient client;

    public MqttGateway(TelemetryService telemetry, @Value("${smartroom.mqtt.url}") String url,
            @Value("${smartroom.mqtt.username}") String username,
            @Value("${smartroom.mqtt.password}") String password) {
        this.telemetry = telemetry;
        this.url = url;
        this.username = username;
        this.password = password;
    }

    @EventListener(ApplicationReadyEvent.class)
    void start() {
        Thread thread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    if (client == null || !client.isConnected()) {
                        MqttClient next = new MqttClient(url, "smartroom-backend-" + UUID.randomUUID());
                        next.setCallback(this);
                        MqttConnectOptions options = new MqttConnectOptions();
                        options.setCleanSession(true);
                        options.setConnectionTimeout(3);
                        if (!username.isBlank()) {
                            options.setUserName(username);
                            options.setPassword(password.toCharArray());
                        }
                        next.connect(options);
                        next.subscribe(new String[] { "smartroom/sensor/temperature", "smartroom/sensor/humidity",
                                "smartroom/sensor/light", "smartroom/fan/status", "smartroom/light/status" });
                        client = next;
                        System.out.println("MQTT connected: " + url);
                    }
                    Thread.sleep(3000);
                } catch (Exception e) {
                    try { Thread.sleep(5000); }
                    catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); }
                }
            }
        }, "smartroom-mqtt");
        thread.setDaemon(true);
        thread.start();
    }

    public void publish(String type, String state) throws MqttException {
        MqttClient active = client;
        if (active == null || !active.isConnected())
            throw new MqttException(MqttException.REASON_CODE_CLIENT_NOT_CONNECTED);
        MqttMessage message = new MqttMessage(state.getBytes(StandardCharsets.UTF_8));
        message.setQos(1);
        message.setRetained(true);
        active.publish("smartroom/" + type.toLowerCase() + "/control", message);
    }

    @Override public void connectionLost(Throwable cause) { client = null; }
    @Override public void deliveryComplete(IMqttDeliveryToken token) { }
    @Override public void messageArrived(String topic, MqttMessage message) {
        telemetry.received(topic, new String(message.getPayload(), StandardCharsets.UTF_8).trim(), message.isRetained());
    }
}
