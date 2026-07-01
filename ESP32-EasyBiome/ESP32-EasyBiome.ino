#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "Adafruit_SHT4x.h"

// Wi-Fi
const char* ssid = "BELCHIOR";
const char* password = "rodrigoerita0";

// API
const char* serverName = "http://192.168.68.73:8080/api/leituras";

// Pinos
#define RELAY1 26      // Lâmpada
#define RELAY2 27      // Ventoinha
#define ATOMIZADOR 25  // Atomizador

Adafruit_SHT4x sht4 = Adafruit_SHT4x();

void setup() {

  Serial.begin(115200);

  pinMode(RELAY1, OUTPUT);
  pinMode(RELAY2, OUTPUT);
  pinMode(ATOMIZADOR, OUTPUT);

  // Estado inicial
  digitalWrite(RELAY1, HIGH);
  digitalWrite(RELAY2, HIGH);
  digitalWrite(ATOMIZADOR, LOW);

  if (!sht4.begin()) {
    Serial.println("Sensor não encontrado!");
    while (1) delay(1);
  }

  Serial.println("SHT40 iniciado");

  // Liga ao Wi-Fi
  WiFi.begin(ssid, password);

  Serial.print("A ligar ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi ligado!");
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  sensors_event_t humidity, temp;

  sht4.getEvent(&humidity, &temp);

  float temperatura = temp.temperature;
  float humidade = humidity.relative_humidity;

  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.println(" °C");

  Serial.print("Humidade: ");
  Serial.print(humidade);
  Serial.println(" %");

  // ----------------------------
  // Lâmpada e Ventoinha
  // ----------------------------

  if (temperatura < 25.0) {

    digitalWrite(RELAY1, LOW);
    digitalWrite(RELAY2, HIGH);

    Serial.println("Lâmpada LIGADA");
    Serial.println("Ventoinha DESLIGADA");

  }
  else if (temperatura > 27.0) {

    digitalWrite(RELAY1, HIGH);
    digitalWrite(RELAY2, LOW);

    Serial.println("Lâmpada DESLIGADA");
    Serial.println("Ventoinha LIGADA");

  }
  else {

    digitalWrite(RELAY1, HIGH);
    digitalWrite(RELAY2, HIGH);

    Serial.println("Lâmpada DESLIGADA");
    Serial.println("Ventoinha DESLIGADA");
  }

  // ----------------------------
  // Atomizador
  // ----------------------------

  if (humidade < 50.0) {

    digitalWrite(ATOMIZADOR, HIGH);
    Serial.println("Atomizador LIGADO");

  }
  else if (humidade > 70.0) {

    digitalWrite(ATOMIZADOR, LOW);
    Serial.println("Atomizador DESLIGADO");
  }

  // ----------------------------
  // Enviar para a API
  // ----------------------------

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"idTerrario\":1,";
    json += "\"temperatura\":" + String(temperatura, 2) + ",";
    json += "\"humidade\":" + String(humidade, 2);
    json += "}";

    int httpResponseCode = http.POST(json);

    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.println("Erro ao enviar dados.");
    }

    http.end();
  }

  Serial.println("-------------------------");

  delay(30000);
}