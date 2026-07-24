package pt.easybiome.easybiome_api.service;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.zip.CRC32;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

@Service
public class CryptoService {

    // ==========================================================
    // CHAVE 3DES PARTILHADA COM O ESP32
    // ==========================================================

    private static final byte[] CHAVE_3DES = {
            (byte) 0x10, (byte) 0x23, (byte) 0x45, (byte) 0x67,
            (byte) 0x89, (byte) 0xAB, (byte) 0xCD, (byte) 0xEF,
            (byte) 0x01, (byte) 0x12, (byte) 0x23, (byte) 0x34,
            (byte) 0x45, (byte) 0x56, (byte) 0x67, (byte) 0x78,
            (byte) 0x89, (byte) 0x9A, (byte) 0xAB, (byte) 0xBC,
            (byte) 0xCD, (byte) 0xDE, (byte) 0xEF, (byte) 0xF0
    };

    // 3DES trabalha com blocos de 8 bytes
    private static final int TAMANHO_BLOCO = 8;


    // ==========================================================
    // ENCRIPTAR
    //
    // Formato:
    //
    // [CRC32][JSON][PADDING]
    //
    // Depois:
    //
    // 3DES
    //
    // Depois:
    //
    // Base64
    // ==========================================================

    public String encriptar(String mensagem) {

        try {

            // --------------------------------------------------
            // 1. Converter JSON para bytes
            // --------------------------------------------------

            byte[] dadosJson =
                    mensagem.getBytes(StandardCharsets.UTF_8);


            // --------------------------------------------------
            // 2. Calcular CRC32
            // --------------------------------------------------

            long crc =
                    calcularCRC32(dadosJson);


            // --------------------------------------------------
            // 3. Criar dados com CRC32 + JSON
            // --------------------------------------------------

            int tamanhoTotal =
                    4 + dadosJson.length;


            // --------------------------------------------------
            // 4. Calcular padding
            //
            // 3DES precisa de múltiplos de 8 bytes
            // --------------------------------------------------

            int tamanhoPadded =
                    ((tamanhoTotal + 7) / 8) * 8;


            byte[] dadosEntrada =
                    new byte[tamanhoPadded];


            // --------------------------------------------------
            // 5. Guardar CRC32 nos primeiros 4 bytes
            //
            // Big Endian
            // --------------------------------------------------

            dadosEntrada[0] =
                    (byte) ((crc >> 24) & 0xFF);

            dadosEntrada[1] =
                    (byte) ((crc >> 16) & 0xFF);

            dadosEntrada[2] =
                    (byte) ((crc >> 8) & 0xFF);

            dadosEntrada[3] =
                    (byte) (crc & 0xFF);


            // --------------------------------------------------
            // 6. Copiar JSON
            // --------------------------------------------------

            System.arraycopy(
                    dadosJson,
                    0,
                    dadosEntrada,
                    4,
                    dadosJson.length
            );


            // --------------------------------------------------
            // 7. Criar Cipher 3DES
            //
            // ECB + NoPadding
            //
            // O padding é feito manualmente para ficar
            // compatível com o ESP32.
            // --------------------------------------------------

            Cipher cipher =
                    Cipher.getInstance(
                            "DESede/ECB/NoPadding"
                    );


            SecretKeySpec chave =
                    new SecretKeySpec(
                            CHAVE_3DES,
                            "DESede"
                    );


            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    chave
            );


            // --------------------------------------------------
            // 8. Encriptar
            // --------------------------------------------------

            byte[] dadosCifrados =
                    cipher.doFinal(
                            dadosEntrada
                    );


            // --------------------------------------------------
            // 9. Converter para Base64
            // --------------------------------------------------

            return Base64.getEncoder()
                    .encodeToString(
                            dadosCifrados
                    );


        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao encriptar mensagem com 3DES",
                    e
            );
        }
    }


    // ==========================================================
    // DESENCRIPTAR
    //
    // Base64
    // ↓
    // 3DES
    // ↓
    // CRC32 + JSON
    // ↓
    // Validar CRC32
    // ==========================================================

    public String desencriptar(
            String mensagemCifrada) {

        try {

            // --------------------------------------------------
            // 1. Validar mensagem
            // --------------------------------------------------

            if (
                    mensagemCifrada == null ||
                            mensagemCifrada.isBlank()
            ) {

                throw new IllegalArgumentException(
                        "Mensagem cifrada vazia"
                );
            }


            // --------------------------------------------------
            // 2. Decodificar Base64
            // --------------------------------------------------

            byte[] dadosCifrados =
                    Base64.getDecoder()
                            .decode(
                                    mensagemCifrada.trim()
                            );


            // --------------------------------------------------
            // 3. Validar tamanho
            //
            // 3DES usa blocos de 8 bytes
            // --------------------------------------------------

            if (
                    dadosCifrados.length == 0 ||
                            dadosCifrados.length % TAMANHO_BLOCO != 0
            ) {

                throw new IllegalArgumentException(
                        "Dados 3DES inválidos"
                );
            }


            // --------------------------------------------------
            // 4. Criar Cipher 3DES
            // --------------------------------------------------

            Cipher cipher =
                    Cipher.getInstance(
                            "DESede/ECB/NoPadding"
                    );


            SecretKeySpec chave =
                    new SecretKeySpec(
                            CHAVE_3DES,
                            "DESede"
                    );


            cipher.init(
                    Cipher.DECRYPT_MODE,
                    chave
            );


            // --------------------------------------------------
            // 5. Desencriptar
            // --------------------------------------------------

            byte[] dadosOriginais =
                    cipher.doFinal(
                            dadosCifrados
                    );


            // --------------------------------------------------
            // 6. Verificar tamanho mínimo
            //
            // 4 bytes CRC32
            // + pelo menos 1 byte JSON
            // --------------------------------------------------

            if (
                    dadosOriginais.length < 5
            ) {

                throw new IllegalArgumentException(
                        "Mensagem desencriptada demasiado pequena"
                );
            }


            // --------------------------------------------------
            // 7. Extrair CRC32 recebido
            // --------------------------------------------------

            long crcRecebido =
                    ((dadosOriginais[0] & 0xFFL) << 24)
                            |
                            ((dadosOriginais[1] & 0xFFL) << 16)
                            |
                            ((dadosOriginais[2] & 0xFFL) << 8)
                            |
                            (dadosOriginais[3] & 0xFFL);


            // --------------------------------------------------
            // 8. Extrair JSON + padding
            // --------------------------------------------------

            byte[] dadosComPadding =
                    Arrays.copyOfRange(
                            dadosOriginais,
                            4,
                            dadosOriginais.length
                    );


            // --------------------------------------------------
            // 9. Remover padding
            //
            // O ESP32 adiciona zeros no final.
            // O JSON termina com "}".
            // --------------------------------------------------

            int posicaoFim = -1;


            for (
                    int i = dadosComPadding.length - 1;
                    i >= 0;
                    i--
            ) {

                if (
                        dadosComPadding[i] == '}'
                ) {

                    posicaoFim =
                            i + 1;

                    break;
                }
            }


            if (
                    posicaoFim == -1
            ) {

                throw new IllegalArgumentException(
                        "JSON inválido"
                );
            }


            // --------------------------------------------------
            // 10. Extrair JSON sem padding
            // --------------------------------------------------

            byte[] jsonBytes =
                    Arrays.copyOf(
                            dadosComPadding,
                            posicaoFim
                    );


            String json =
                    new String(
                            jsonBytes,
                            StandardCharsets.UTF_8
                    );


            // --------------------------------------------------
            // 11. Calcular CRC32 novamente
            // --------------------------------------------------

            long crcCalculado =
                    calcularCRC32(
                            jsonBytes
                    );


            System.out.println(
                    "CRC recebido: 0x"
                            + Long.toHexString(
                            crcRecebido
                    )
            );

            System.out.println(
                    "CRC calculado: 0x"
                            + Long.toHexString(
                            crcCalculado
                    )
            );


            // --------------------------------------------------
            // 12. Verificar integridade
            // --------------------------------------------------

            if (
                    crcRecebido != crcCalculado
            ) {

                throw new SecurityException(
                        "CRC32 inválido! Os dados podem ter sido alterados."
                );
            }


            System.out.println(
                    "CRC32 válido!"
            );


            // --------------------------------------------------
            // 13. Devolver JSON original
            // --------------------------------------------------

            return json;


        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao desencriptar mensagem com 3DES",
                    e
            );
        }
    }


    // ==========================================================
    // CALCULAR CRC32
    // ==========================================================

    private long calcularCRC32(
            byte[] dados) {

        CRC32 crc =
                new CRC32();

        crc.update(
                dados,
                0,
                dados.length
        );

        return crc.getValue();
    }
}