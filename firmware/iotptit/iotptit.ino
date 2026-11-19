#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include "secrets.h"

// =====================================================
// WIFI CONFIG
// =====================================================



// =====================================================
// MQTT CONFIG
// =====================================================

const int MQTT_PORT = 1884;




// =====================================================
// MQTT TOPICS
// =====================================================

// ---------- SENSOR ----------

const char* TEMPERATURE_TOPIC =
  "smartroom/sensor/temperature";

const char* HUMIDITY_TOPIC =
  "smartroom/sensor/humidity";

const char* LIGHT_SENSOR_TOPIC =
  "smartroom/sensor/light";

const char* RANDOM_SENSOR_TOPIC = "smartroom/sensor/random";


// ---------- FAN ----------

const char* FAN_CONTROL_TOPIC =
  "smartroom/fan/control";

const char* FAN_STATUS_TOPIC =
  "smartroom/fan/status";


// ---------- LIGHT ----------

const char* LIGHT_CONTROL_TOPIC =
  "smartroom/light/control";

const char* LIGHT_STATUS_TOPIC =
  "smartroom/light/status";

const char* LED3_CONTROL_TOPIC = "smartroom/led3/control";
const char* LED3_STATUS_TOPIC = "smartroom/led3/status";
const char* LED4_CONTROL_TOPIC = "smartroom/led4/control";
const char* LED4_STATUS_TOPIC = "smartroom/led4/status";


// =====================================================
// PIN CONFIG
// =====================================================

// DHT11
#define DHTPIN D2
#define DHTTYPE DHT11

// LED xanh = FAN
#define FAN_LED D6

// LED trắng = LIGHT
#define LIGHT_LED D7

// Hai LED bổ sung.
#define LED3_PIN D1
#define LED4_PIN D0

// Light Sensor
#define LIGHT_SENSOR_PIN A0


// =====================================================
// OBJECTS
// =====================================================

DHT dht(DHTPIN, DHTTYPE);

WiFiClient wifiClient;

PubSubClient mqttClient(wifiClient);


// =====================================================
// TIMER
// =====================================================

unsigned long lastSensorPublish = 0;

// Publish sensor data every 3 seconds
const unsigned long SENSOR_INTERVAL = 3000;

void applyExtraLed(const String& topic, const String& message,
                   const char* controlTopic, const char* statusTopic, uint8_t pin) {
  if (topic != controlTopic || (message != "ON" && message != "OFF")) return;
  digitalWrite(pin, message == "ON" ? HIGH : LOW);
  mqttClient.publish(statusTopic, message.c_str(), true);
}


// =====================================================
// CONNECT WIFI
// =====================================================

void connectWiFi() {

  WiFi.mode(WIFI_STA);
  int networkCount = WiFi.scanNetworks();
  bool targetVisible = false;
  for (int i = 0; i < networkCount; i++) {
    if (WiFi.SSID(i) == WIFI_SSID) targetVisible = true;
  }
  WiFi.scanDelete();
  Serial.print("Configured WiFi visible: ");
  Serial.println(targetVisible ? "yes" : "no");

  Serial.print("Connecting to WiFi");

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  unsigned int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
    if (++attempts % 20 == 0) {
      Serial.print(" status=");
      Serial.println(WiFi.status());
    }
  }

  Serial.println();

  Serial.println("WiFi connected!");

  Serial.print("ESP8266 IP: ");
  Serial.println(WiFi.localIP());
}


// =====================================================
// MQTT CALLBACK
// =====================================================

void mqttCallback(
  char* topic,
  byte* payload,
  unsigned int length
) {

  // ---------------------------------------------------
  // Convert MQTT payload to String
  // ---------------------------------------------------

  String message = "";

  for (
    unsigned int i = 0;
    i < length;
    i++
  ) {

    message += (char)payload[i];
  }


  // ---------------------------------------------------
  // Print received MQTT message
  // ---------------------------------------------------

  Serial.print("MQTT received: ");
  Serial.print(topic);
  Serial.print(" -> ");
  Serial.println(message);


  // ===================================================
  // FAN CONTROL
  // ===================================================

  if (
    String(topic) ==
    FAN_CONTROL_TOPIC
  ) {

    // -------------------------------------------------
    // FAN ON
    // -------------------------------------------------

    if (message == "ON") {

      digitalWrite(
        FAN_LED,
        HIGH
      );

      Serial.println("Fan LED: ON");


      // -----------------------------------------------
      // Publish actual status
      // -----------------------------------------------

      bool success = mqttClient.publish(
        FAN_STATUS_TOPIC,
        "ON",
        true
      );

      Serial.print("Fan status publish: ");
      Serial.println(
        success ? "SUCCESS" : "FAILED"
      );
    }


    // -------------------------------------------------
    // FAN OFF
    // -------------------------------------------------

    else if (
      message == "OFF"
    ) {

      digitalWrite(
        FAN_LED,
        LOW
      );

      Serial.println("Fan LED: OFF");


      // -----------------------------------------------
      // Publish actual status
      // -----------------------------------------------

      bool success = mqttClient.publish(
        FAN_STATUS_TOPIC,
        "OFF",
        true
      );

      Serial.print("Fan status publish: ");
      Serial.println(
        success ? "SUCCESS" : "FAILED"
      );
    }
  }


  // ===================================================
  // LIGHT CONTROL
  // ===================================================

  if (
    String(topic) ==
    LIGHT_CONTROL_TOPIC
  ) {

    // -------------------------------------------------
    // LIGHT ON
    // -------------------------------------------------

    if (message == "ON") {

      digitalWrite(
        LIGHT_LED,
        HIGH
      );

      Serial.println("Light LED: ON");


      // -----------------------------------------------
      // Publish actual status
      // -----------------------------------------------

      bool success = mqttClient.publish(
        LIGHT_STATUS_TOPIC,
        "ON",
        true
      );

      Serial.print("Light status publish: ");
      Serial.println(
        success ? "SUCCESS" : "FAILED"
      );
    }


    // -------------------------------------------------
    // LIGHT OFF
    // -------------------------------------------------

    else if (
      message == "OFF"
    ) {

      digitalWrite(
        LIGHT_LED,
        LOW
      );

      Serial.println("Light LED: OFF");


      // -----------------------------------------------
      // Publish actual status
      // -----------------------------------------------

      bool success = mqttClient.publish(
        LIGHT_STATUS_TOPIC,
        "OFF",
        true
      );

      Serial.print("Light status publish: ");
      Serial.println(
        success ? "SUCCESS" : "FAILED"
      );
    }
  }

  applyExtraLed(String(topic), message, LED3_CONTROL_TOPIC, LED3_STATUS_TOPIC, LED3_PIN);
  applyExtraLed(String(topic), message, LED4_CONTROL_TOPIC, LED4_STATUS_TOPIC, LED4_PIN);
}


// =====================================================
// CONNECT MQTT
// =====================================================

void connectMQTT() {

  while (
    !mqttClient.connected()
  ) {

    Serial.print("Connecting to MQTT...");


    // -------------------------------------------------
    // Create unique client ID
    // -------------------------------------------------

    String clientId =
      "ESP8266-" +
      String(
        ESP.getChipId()
      );


    // -------------------------------------------------
    // Connect using username/password
    // -------------------------------------------------

    if (
      mqttClient.connect(
        clientId.c_str(),
        MQTT_USERNAME,
        MQTT_PASSWORD
      )
    ) {

      Serial.println("connected!");


      // ===============================================
      // SUBSCRIBE FAN CONTROL
      // ===============================================

      bool fanSubscribed =
        mqttClient.subscribe(
          FAN_CONTROL_TOPIC
        );


      // ===============================================
      // SUBSCRIBE LIGHT CONTROL
      // ===============================================

      bool lightSubscribed =
        mqttClient.subscribe(
          LIGHT_CONTROL_TOPIC
        );

      bool led3Subscribed = mqttClient.subscribe(LED3_CONTROL_TOPIC);
      bool led4Subscribed = mqttClient.subscribe(LED4_CONTROL_TOPIC);


      // -------------------------------------------------
      // Print subscription result
      // -------------------------------------------------

      Serial.println("Subscribed:");

      Serial.print("  ");
      Serial.print(FAN_CONTROL_TOPIC);
      Serial.print(" -> ");
      Serial.println(
        fanSubscribed ? "SUCCESS" : "FAILED"
      );

      Serial.print("  ");
      Serial.print(LIGHT_CONTROL_TOPIC);
      Serial.print(" -> ");
      Serial.println(
        lightSubscribed ? "SUCCESS" : "FAILED"
      );

      Serial.print("  "); Serial.print(LED3_CONTROL_TOPIC);
      Serial.println(led3Subscribed ? " -> SUCCESS" : " -> FAILED");
      Serial.print("  "); Serial.print(LED4_CONTROL_TOPIC);
      Serial.println(led4Subscribed ? " -> SUCCESS" : " -> FAILED");
    }


    // -------------------------------------------------
    // MQTT CONNECTION FAILED
    // -------------------------------------------------

    else {

      Serial.print(
        "failed, rc="
      );

      Serial.println(
        mqttClient.state()
      );

      Serial.println(
        "Retrying in 10 seconds..."
      );

      delay(10000);
    }
  }
}


// =====================================================
// PUBLISH SENSOR DATA
// =====================================================

void publishSensorData() {

  // ===================================================
  // READ DHT11
  // ===================================================

  float humidity =
    dht.readHumidity();

  float temperature =
    dht.readTemperature();


  // ===================================================
  // READ LIGHT SENSOR
  // ===================================================

  int lightValue =
    analogRead(
      LIGHT_SENSOR_PIN
    );


  // ===================================================
  // CHECK DHT11
  // ===================================================

  if (
    isnan(humidity) ||
    isnan(temperature)
  ) {

    Serial.println(
      "Failed to read DHT11!"
    );
  }

  else {

    // -------------------------------------------------
    // Convert temperature to String
    // -------------------------------------------------

    char temperatureString[10];

    dtostrf(
      temperature,
      1,
      2,
      temperatureString
    );


    // -------------------------------------------------
    // Convert humidity to String
    // -------------------------------------------------

    char humidityString[10];

    dtostrf(
      humidity,
      1,
      2,
      humidityString
    );


    // =================================================
    // PUBLISH TEMPERATURE
    // =================================================

    bool temperatureSuccess =
      mqttClient.publish(
        TEMPERATURE_TOPIC,
        temperatureString
      );

    Serial.print(
      "Temperature publish: "
    );

    Serial.println(
      temperatureSuccess
        ? "SUCCESS"
        : "FAILED"
    );


    // =================================================
    // PUBLISH HUMIDITY
    // =================================================

    bool humiditySuccess =
      mqttClient.publish(
        HUMIDITY_TOPIC,
        humidityString
      );

    Serial.print(
      "Humidity publish: "
    );

    Serial.println(
      humiditySuccess
        ? "SUCCESS"
        : "FAILED"
    );


    // =================================================
    // PRINT TEMPERATURE
    // =================================================

    Serial.print(
      "Temperature: "
    );

    Serial.print(
      temperature
    );

    Serial.println(
      " C"
    );


    // =================================================
    // PRINT HUMIDITY
    // =================================================

    Serial.print(
      "Humidity: "
    );

    Serial.print(
      humidity
    );

    Serial.println(
      " %"
    );
  }


  // ===================================================
  // LIGHT SENSOR
  // ===================================================

  char lightString[10];

  sprintf(
    lightString,
    "%d",
    lightValue
  );


  // ===================================================
  // PUBLISH LIGHT SENSOR VALUE
  // ===================================================

  bool lightSuccess =
    mqttClient.publish(
      LIGHT_SENSOR_TOPIC,
      lightString
    );

  Serial.print(
    "Light sensor publish: "
  );

  Serial.println(
    lightSuccess
      ? "SUCCESS"
      : "FAILED"
  );


  // ===================================================
  // PRINT LIGHT VALUE
  // ===================================================

  Serial.print(
    "Light ADC: "
  );

  Serial.println(
    lightValue
  );

  // Giá trị thứ tư là dữ liệu mô phỏng, không phải cảm biến vật lý.
  char randomString[5];
  snprintf(randomString, sizeof(randomString), "%ld", random(0, 101));
  mqttClient.publish(RANDOM_SENSOR_TOPIC, randomString);

  Serial.println(
    "-----------------------"
  );
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  // ===================================================
  // SERIAL MONITOR
  // ===================================================

  Serial.begin(115200);

  delay(1000);


  // ===================================================
  // INITIALIZE DHT11
  // ===================================================

  dht.begin();
  randomSeed(micros() ^ analogRead(LIGHT_SENSOR_PIN));


  // ===================================================
  // LED OUTPUTS
  // ===================================================

  pinMode(
    FAN_LED,
    OUTPUT
  );

  pinMode(
    LIGHT_LED,
    OUTPUT
  );

  pinMode(LED3_PIN, OUTPUT);
  pinMode(LED4_PIN, OUTPUT);

  // ===================================================
  // DEFAULT OFF
  // ===================================================

  digitalWrite(
    FAN_LED,
    LOW
  );

  digitalWrite(
    LIGHT_LED,
    LOW
  );

  digitalWrite(LED3_PIN, LOW);
  digitalWrite(LED4_PIN, LOW);


  Serial.println();
  Serial.println(
    "================================"
  );
  Serial.println(
    " Smart Room ESP8266"
  );
  Serial.println(
    "================================"
  );


  // ===================================================
  // CONNECT WIFI
  // ===================================================

  connectWiFi();


  // ===================================================
  // MQTT CONFIG
  // ===================================================

  mqttClient.setServer(
    MQTT_BROKER,
    MQTT_PORT
  );

  mqttClient.setCallback(
    mqttCallback
  );
}


// =====================================================
// LOOP
// =====================================================

void loop() {

  // ===================================================
  // RECONNECT WIFI
  // ===================================================

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    Serial.println(
      "WiFi disconnected!"
    );

    connectWiFi();
  }


  // ===================================================
  // RECONNECT MQTT
  // ===================================================

  if (
    !mqttClient.connected()
  ) {

    connectMQTT();
  }


  // ===================================================
  // PROCESS MQTT MESSAGES
  // ===================================================

  mqttClient.loop();


  // ===================================================
  // PUBLISH SENSOR DATA
  // ===================================================

  unsigned long currentMillis =
    millis();


  if (
    currentMillis -
    lastSensorPublish >=
    SENSOR_INTERVAL
  ) {

    lastSensorPublish =
      currentMillis;

    publishSensorData();
  }
}
