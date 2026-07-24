#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include "Adafruit_SHT4x.h"


#include <Crypto.h>
#include <DES.h>
#include "mbedtls/base64.h"

// ========================================
// CHAVE 3DES PARTILHADA COM O SERVIDOR
// ========================================
const uint8_t CHAVE_3DES[24] = {
  0x10, 0x23, 0x45, 0x67,
  0x89, 0xAB, 0xCD, 0xEF,
  0x01, 0x12, 0x23, 0x34,
  0x45, 0x56, 0x67, 0x78,
  0x89, 0x9A, 0xAB, 0xBC,
  0xCD, 0xDE, 0xEF, 0xF0
};
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
  "http://192.168.68.70:8080/api/leituras";

const String dispositivosURL =
  "http://192.168.68.70:8080/api/dispositivos/terrario/" + String(ID_TERRARIO);

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

    String json = "{";
    json += "\"idTerrario\":" + String(ID_TERRARIO) + ",";
    json += "\"temperatura\":" + String(temperatura, 2) + ",";
    json += "\"humidade\":" + String(humidade, 2);
    json += "}";

    // Encriptar o JSON
    String mensagemCifrada = encriptar(json);

    http.addHeader("Content-Type", "text/plain");

    int resposta = http.POST(mensagemCifrada);

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

      String payloadCifrado = http2.getString();

      Serial.println("Mensagem cifrada recebida:");
      Serial.println(payloadCifrado);

      // Decifrar
      String payload = desencriptar(payloadCifrado);

      if (payload.length() == 0) {

        Serial.println(
          "ERRO: Não foi possível desencriptar a mensagem.");

        http2.end();

        delay(1000);

        return;
      }

      Serial.println("Mensagem decifrada:");
      Serial.println(payload);

      DynamicJsonDocument doc(4096);

      DeserializationError erro =
        deserializeJson(doc, payload);

      if (erro) {

        Serial.print("Erro ao decifrar JSON: ");
        Serial.println(erro.c_str());

        http2.end();

        return;
      }

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

uint32_t calcularCRC32(
  const uint8_t* dados,
  size_t tamanho) {

  uint32_t crc =
    0xFFFFFFFF;

  for (
    size_t i = 0;
    i < tamanho;
    i++) {

    crc ^= dados[i];

    for (
      uint8_t j = 0;
      j < 8;
      j++) {

      if (
        crc & 1) {

        crc =
          (crc >> 1)
          ^ 0xEDB88320;

      } else {

        crc >>=
          1;
      }
    }
  }

  return ~crc;
}


// ============================================================
// ENCRIPTAR
// 3DES + CRC32 + Base64
// Formato final:
// [CRC32][DADOS JSON] -> 3DES -> Base64
// ============================================================

String encriptar(String mensagem) {

  // ============================================================
  // 1. Converter JSON para bytes
  // ============================================================

  const uint8_t* dados =
    (const uint8_t*)mensagem.c_str();

  size_t tamanho =
    mensagem.length();

  // ============================================================
  // 2. Calcular CRC32 dos dados originais
  // ============================================================

  uint32_t crc =
    calcularCRC32(
      dados,
      tamanho);

  // ============================================================
  // 3. Criar mensagem:
  //
  // [CRC32 - 4 bytes] + [JSON]
  // ============================================================

  size_t tamanhoTotal =
    4 + tamanho;

  // 3DES trabalha com blocos de 8 bytes
  size_t tamanhoPadded =
    ((tamanhoTotal + 7) / 8) * 8;

  uint8_t dadosEntrada[tamanhoPadded];

  memset(
    dadosEntrada,
    0,
    tamanhoPadded);

  // ============================================================
  // 4. Guardar CRC32 nos primeiros 4 bytes
  // ============================================================

  dadosEntrada[0] =
    (crc >> 24) & 0xFF;

  dadosEntrada[1] =
    (crc >> 16) & 0xFF;

  dadosEntrada[2] =
    (crc >> 8) & 0xFF;

  dadosEntrada[3] =
    crc & 0xFF;

  // ============================================================
  // 5. Copiar JSON
  // ============================================================

  memcpy(
    dadosEntrada + 4,
    dados,
    tamanho);

  // ============================================================
  // 6. Criar objeto DES
  // ============================================================

  DES des;

  // ============================================================
  // 7. Encriptar com 3DES
  //
  // A função tripleEncrypt() trabalha apenas com
  // um bloco de 8 bytes de cada vez.
  //
  // A chave tem 24 bytes = 3 chaves DES.
  // ============================================================

  uint8_t dadosCifrados[tamanhoPadded];

  for (
    size_t i = 0;
    i < tamanhoPadded;
    i += 8) {

    des.tripleEncrypt(
      dadosCifrados + i,
      dadosEntrada + i,
      CHAVE_3DES);
  }

  // ============================================================
  // 8. Converter resultado para Base64
  // ============================================================

  size_t tamanhoBase64 =
    4 * ((tamanhoPadded + 2) / 3);

  unsigned char resultadoBase64[tamanhoBase64 + 1];

  size_t tamanhoCodificado = 0;

  int resultado =
    mbedtls_base64_encode(
      resultadoBase64,
      tamanhoBase64 + 1,
      &tamanhoCodificado,
      dadosCifrados,
      tamanhoPadded);

  if (resultado != 0) {

    Serial.println(
      "Erro ao codificar Base64.");

    return "";
  }

  resultadoBase64[tamanhoCodificado] = '\0';

  return String(
    (char*)resultadoBase64);
}


// ============================================================
// DESENCRIPTAR
// Base64 + 3DES + CRC32
// ============================================================

String desencriptar(String mensagemCifrada) {

  // ============================================================
  // 1. Validar mensagem
  // ============================================================

  if (mensagemCifrada.length() == 0) {

    Serial.println(
      "Erro: mensagem cifrada vazia.");

    return "";
  }


  // ============================================================
  // 2. Calcular tamanho máximo necessário
  // ============================================================

  size_t tamanhoBase64 =
    mensagemCifrada.length();

  size_t tamanhoMaximo =
    (tamanhoBase64 * 3) / 4 + 4;


  // ============================================================
  // 3. Alocar memória dinamicamente
  // ============================================================

  uint8_t* dadosCifrados =
    new uint8_t[tamanhoMaximo];

  uint8_t* dadosOriginais =
    new uint8_t[tamanhoMaximo];


  if (
    dadosCifrados == nullptr || dadosOriginais == nullptr) {

    Serial.println(
      "Erro: memória insuficiente.");

    delete[] dadosCifrados;
    delete[] dadosOriginais;

    return "";
  }


  // ============================================================
  // 4. Decodificar Base64
  // ============================================================

  size_t tamanhoBinario = 0;

  int resultado =
    mbedtls_base64_decode(
      dadosCifrados,
      tamanhoMaximo,
      &tamanhoBinario,
      (const unsigned char*)
        mensagemCifrada.c_str(),
      tamanhoBase64);


  if (
    resultado != 0) {

    Serial.println(
      "Erro ao descodificar Base64.");

    delete[] dadosCifrados;
    delete[] dadosOriginais;

    return "";
  }


  // ============================================================
  // 5. Validar tamanho 3DES
  // ============================================================

  if (
    tamanhoBinario == 0 || tamanhoBinario % 8 != 0) {

    Serial.println(
      "Erro: tamanho dos dados 3DES inválido.");

    delete[] dadosCifrados;
    delete[] dadosOriginais;

    return "";
  }


  Serial.print(
    "Tamanho dados cifrados: ");

  Serial.println(
    tamanhoBinario);


  // ============================================================
  // 6. Desencriptar
  // ============================================================

  DES des;


  for (
    size_t i = 0;
    i < tamanhoBinario;
    i += 8) {

    des.tripleDecrypt(
      dadosOriginais + i,
      dadosCifrados + i,
      CHAVE_3DES);
  }


  // ============================================================
  // 7. Validar tamanho mínimo
  // ============================================================

  if (
    tamanhoBinario < 5) {

    Serial.println(
      "Erro: mensagem demasiado pequena.");

    delete[] dadosCifrados;
    delete[] dadosOriginais;

    return "";
  }


  // ============================================================
  // 8. Extrair CRC32
  // ============================================================

  uint32_t crcRecebido =

    ((uint32_t)
       dadosOriginais[0]
     << 24)

    |

    ((uint32_t)
       dadosOriginais[1]
     << 16)

    |

    ((uint32_t)
       dadosOriginais[2]
     << 8)

    |

    ((uint32_t)
       dadosOriginais[3]);


  // ============================================================
  // 9. Localizar fim do JSON
  //
  // O JSON pode ser:
  //   Objeto: {...}
  //   Array:  [{...},{...}]
  //
  // Por isso procuramos o último '}' OU ']'
  // ============================================================

  size_t tamanhoJSON =
    tamanhoBinario - 4;

  int posicaoFim = -1;

  for (
    int i = tamanhoJSON - 1;
    i >= 0;
    i--) {

    if (
      dadosOriginais[i + 4] == '}' || dadosOriginais[i + 4] == ']') {

      posicaoFim =
        i + 1;

      break;
    }
  }


  if (
    posicaoFim == -1) {

    Serial.println(
      "Erro: JSON inválido.");

    delete[] dadosCifrados;
    delete[] dadosOriginais;

    return "";
  }


  // ============================================================
  // 10. Calcular CRC32
  // ============================================================

  uint32_t crcCalculado =
    calcularCRC32(
      dadosOriginais + 4,
      posicaoFim);


  Serial.print(
    "CRC recebido: 0x");

  Serial.println(
    crcRecebido,
    HEX);


  Serial.print(
    "CRC calculado: 0x");

  Serial.println(
    crcCalculado,
    HEX);


  // ============================================================
  // 11. Validar CRC
  // ============================================================

  if (
    crcRecebido != crcCalculado) {

    Serial.println(
      "ERRO: CRC32 inválido!");

    delete[] dadosCifrados;
    delete[] dadosOriginais;

    return "";
  }


  Serial.println(
    "CRC32 válido!");


  // ============================================================
  // 12. Criar String apenas depois de validar
  // ============================================================

  String json;

  json.reserve(
    posicaoFim + 1);


  for (
    size_t i = 0;
    i < posicaoFim;
    i++) {

    json +=
      (char)
        dadosOriginais[i + 4];
  }


  // ============================================================
  // 13. Libertar memória
  // ============================================================

  delete[] dadosCifrados;
  delete[] dadosOriginais;


  // ============================================================
  // 14. Devolver JSON
  // ============================================================

  return json;
}