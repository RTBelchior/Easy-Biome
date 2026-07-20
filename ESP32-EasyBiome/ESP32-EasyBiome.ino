#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include "Adafruit_SHT4x.h"
  
//=========================
// WiFi
//=========================

const char* ssid = "BELCHIOR";
const char* password = "rodrigoerita0";
const int ID_TERRARIO = 3;
//=========================
// API
//=========================

const char* leituraURL =
  "http://192.168.68.73:8080/api/leituras";

const String dispositivosURL =
    "http://192.168.68.73:8080/api/dispositivos/terrario/" + String(ID_TERRARIO);

//=========================
// GPIO
//=========================

#define LAMPADA_AQUECIMENTO 26
#define VENTOINHA 27
#define HUMIDIFICADOR 25
#define LAMPADA_ILUMINACAO 33

Adafruit_SHT4x sht4;

void setup() {

  Serial.begin(115200);

  pinMode(LAMPADA_AQUECIMENTO, OUTPUT);
  pinMode(VENTOINHA, OUTPUT);
  pinMode(HUMIDIFICADOR, OUTPUT);
  pinMode(LAMPADA_ILUMINACAO, OUTPUT);

  // Relés desligados (ativos em LOW)
  digitalWrite(LAMPADA_AQUECIMENTO, HIGH);
  digitalWrite(VENTOINHA, HIGH);
  digitalWrite(HUMIDIFICADOR, LOW);
  digitalWrite(LAMPADA_ILUMINACAO, HIGH);

  if (!sht4.begin()) {
    Serial.println("Erro ao iniciar o SHT40.");
    while (1)
      ;
  }

  Serial.println("SHT40 iniciado.");

  WiFi.begin(ssid, password);

  Serial.print("A ligar ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi ligado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  sensors_event_t humidity, temp;

  sht4.getEvent(&humidity, &temp);

  float temperatura = temp.temperature;
  float humidade = humidity.relative_humidity;

  Serial.println();
  Serial.println("==============");

  Serial.print("Temperatura: ");
  Serial.println(temperatura);

  Serial.print("Humidade: ");
  Serial.println(humidade);

  if (WiFi.status() == WL_CONNECTED) {

    //-------------------------
    // Enviar leitura
    //-------------------------

    HTTPClient http;

    http.begin(leituraURL);

    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"idTerrario\":" + String(ID_TERRARIO) + ",";
    json += "\"temperatura\":" + String(temperatura, 2) + ",";
    json += "\"humidade\":" + String(humidade, 2);
    json += "}";

    int resposta = http.POST(json);

    Serial.print("POST Leituras -> ");
    Serial.println(resposta);

    http.end();

    //-------------------------
    // Ler dispositivos
    //-------------------------

    HTTPClient http2;

    http2.begin(dispositivosURL);

    int codigo = http2.GET();

    if (codigo == 200) {

      String payload = http2.getString();

      Serial.println(payload);

      DynamicJsonDocument doc(4096);

      deserializeJson(doc, payload);

      for (JsonObject dispositivo : doc.as<JsonArray>()) {

        String tipo = dispositivo["tipoDispositivo"];
        bool estado = dispositivo["estadoAtual"];

        if (tipo == "VENTOINHA") {

          digitalWrite(VENTOINHA, estado ? LOW : HIGH);

          Serial.print("Ventoinha: ");
          Serial.println(estado ? "Ligada" : "Desligada");
        }

        else if (tipo == "LAMPADA_AQUECIMENTO") {

          digitalWrite(LAMPADA_AQUECIMENTO, estado ? LOW : HIGH);

          Serial.print("Lâmpada Aquecimento: ");
          Serial.println(estado ? "Ligada" : "Desligada");
        }

        else if (tipo == "LAMPADA_ILUMINACAO") {

          digitalWrite(LAMPADA_ILUMINACAO, estado ? LOW : HIGH);

          Serial.print("Lâmpada Iluminação: ");
          Serial.println(estado ? "Ligada" : "Desligada");
        }

        else if (tipo == "HUMIDIFICADOR") {

          // Humidificador é ativo em HIGH
          digitalWrite(HUMIDIFICADOR, estado ? HIGH : LOW);

          Serial.print("Humidificador: ");
          Serial.println(estado ? "Ligado" : "Desligado");
        }
      }

    } else {

      Serial.print("Erro GET dispositivos: ");
      Serial.println(codigo);
    }

    http2.end();
  }

  delay(5000);
}