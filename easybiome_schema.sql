-- ============================================================
--  EasyBiome — Schema MySQL
-- ============================================================

-- ------------------------------------------------------------
-- ESPECIE
-- Perfis predefinidos de temperatura e humidade por espécie.
-- O utilizador escolhe um ao criar o terrário e os valores
-- são usados como ponto de partida, podendo ajustar depois.
-- ------------------------------------------------------------
CREATE TABLE especie (
    id_especie        BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_especie      VARCHAR(100) NOT NULL UNIQUE,
    descricao_especie VARCHAR(255),
    temp_minima       FLOAT NOT NULL,
    temp_maxima       FLOAT NOT NULL,
    humidade_minima   FLOAT NOT NULL,
    humidade_maxima   FLOAT NOT NULL,
    CONSTRAINT chk_especie_temp CHECK (temp_minima < temp_maxima),
    CONSTRAINT chk_especie_hum  CHECK (humidade_minima < humidade_maxima)
);

-- ------------------------------------------------------------
-- UTILIZADOR
-- ------------------------------------------------------------
CREATE TABLE utilizador (
    id_utilizador            BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_utilizador          VARCHAR(100) NOT NULL,
    email_utilizador         VARCHAR(150) NOT NULL UNIQUE,
    password_hash_utilizador VARCHAR(255) NOT NULL,
    tipo_utilizador          VARCHAR(20)  NOT NULL DEFAULT 'UTILIZADOR'
                             CHECK (tipo_utilizador IN ('ADMIN', 'UTILIZADOR')),
    ativo_utilizador         BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TERRARIO
-- id_especie é opcional (NULL = configuração personalizada).
-- hora_ligar_iluminacao e hora_desligar_iluminacao definem
-- o agendamento fixo diário da lâmpada de iluminação.
-- NULL = sem agendamento, controlo manual.
-- imagem_terrario guarda o nome do ficheiro em /uploads/.
-- NULL = app usa a imagem predefinida da espécie.
-- ------------------------------------------------------------
CREATE TABLE terrario (
    id_terrario              BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_especie               BIGINT,
    nome_terrario            VARCHAR(100) NOT NULL,
    descricao_terrario       VARCHAR(255),
    imagem_terrario          VARCHAR(255),
    temp_terrario_min        FLOAT NOT NULL DEFAULT 20.0,
    temp_terrario_max        FLOAT NOT NULL DEFAULT 35.0,
    humidade_terrario_min    FLOAT NOT NULL DEFAULT 40.0,
    humidade_terrario_max    FLOAT NOT NULL DEFAULT 80.0,
    hora_ligar_iluminacao    TIME,
    hora_desligar_iluminacao TIME,
    criado_em                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_terrario_especie FOREIGN KEY (id_especie)
        REFERENCES especie(id_especie) ON DELETE SET NULL,
    CONSTRAINT chk_terrario_temp CHECK (temp_terrario_min < temp_terrario_max),
    CONSTRAINT chk_terrario_hum  CHECK (humidade_terrario_min < humidade_terrario_max)
);

-- ------------------------------------------------------------
-- UTILIZADOR_TERRARIO  (N:M — partilha de terrários)
-- DONO    → criador, acesso total
-- EDITOR  → pode controlar dispositivos
-- LEITOR  → só visualiza dados
-- ------------------------------------------------------------
CREATE TABLE utilizador_terrario (
    id_utilizador_terrario BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_utilizador          BIGINT NOT NULL,
    id_terrario            BIGINT NOT NULL,
    permissao_terrario     VARCHAR(20) NOT NULL DEFAULT 'LEITOR'
                           CHECK (permissao_terrario IN ('DONO', 'EDITOR', 'LEITOR')),
    convidado_em           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_utilizador, id_terrario),
    CONSTRAINT fk_ut_utilizador FOREIGN KEY (id_utilizador)
        REFERENCES utilizador(id_utilizador) ON DELETE CASCADE,
    CONSTRAINT fk_ut_terrario FOREIGN KEY (id_terrario)
        REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- LEITURA_SENSOR
-- Histórico de leituras de temperatura e humidade enviadas
-- pelo ESP32. Uma linha por leitura.
-- ------------------------------------------------------------
CREATE TABLE leitura_sensor (
    id_leitura_sensor BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_terrario       BIGINT NOT NULL,
    temperatura       FLOAT  NOT NULL,
    humidade          FLOAT  NOT NULL,
    registado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leitura_terrario FOREIGN KEY (id_terrario)
        REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

CREATE INDEX idx_leitura_terrario_data
    ON leitura_sensor (id_terrario, registado_em DESC);

-- ------------------------------------------------------------
-- DISPOSITIVO
-- Um registo por dispositivo físico. estado_atual reflete
-- sempre o estado mais recente. O histórico fica em log_comando.
-- ------------------------------------------------------------
CREATE TABLE dispositivo (
    id_dispositivo   BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_terrario      BIGINT NOT NULL,
    nome_dispositivo VARCHAR(100) NOT NULL,
    tipo_dispositivo VARCHAR(30)  NOT NULL
                     CHECK (tipo_dispositivo IN (
                         'VENTOINHA',
                         'LAMPADA_AQUECIMENTO',
                         'LAMPADA_ILUMINACAO',
                         'HUMIDIFICADOR'
                     )),
    estado_atual  BOOLEAN   NOT NULL DEFAULT FALSE,
    modo_manual BOOLEAN NOT NULL DEFAULT FALSE,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispositivo_terrario FOREIGN KEY (id_terrario)
        REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- LOG_COMANDO
-- Registo histórico de cada mudança de estado de qualquer
-- dispositivo. id_utilizador é NULL quando a origem é
-- AUTOMATICO (agendamento) ou ESP32.
-- ------------------------------------------------------------
CREATE TABLE log_comando (

    id_log BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    id_dispositivo BIGINT NOT NULL,
    id_utilizador BIGINT,

    estado_anterior BOOLEAN NOT NULL,
    estado_novo BOOLEAN NOT NULL,

    origem_log VARCHAR(20) NOT NULL
        CHECK (origem_log IN ('APP','AUTOMATICO','ESP32')),

    acao VARCHAR(30) NOT NULL
        CHECK (acao IN (
            'LIGAR',
            'DESLIGAR',
            'MODO_MANUAL',
            'MODO_AUTOMATICO'
        )),

    descricao VARCHAR(255),

    executado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_dispositivo
        FOREIGN KEY (id_dispositivo)
        REFERENCES dispositivo(id_dispositivo)
        ON DELETE CASCADE,

    CONSTRAINT fk_log_utilizador
        FOREIGN KEY (id_utilizador)
        REFERENCES utilizador(id_utilizador)
        ON DELETE SET NULL
);

CREATE INDEX idx_log_dispositivo
    ON log_comando (id_dispositivo, executado_em DESC);

-- ------------------------------------------------------------
-- ALERTA
-- Gerado automaticamente pelo backend quando temperatura ou
-- humidade saem dos limites definidos, ou quando um dispositivo
-- falha. resolvido_alerta = TRUE quando o utilizador confirma.
-- ------------------------------------------------------------
CREATE TABLE alerta (
    id_alerta        BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_terrario      BIGINT NOT NULL,
    tipo_alerta      VARCHAR(30) NOT NULL
                     CHECK (tipo_alerta IN (
                         'TEMPERATURA_ALTA',
                         'TEMPERATURA_BAIXA',
                         'HUMIDADE_ALTA',
                         'HUMIDADE_BAIXA',
                         'DISPOSITIVO_FALHA'
                     )),
    mensagem_alerta  VARCHAR(255) NOT NULL,
    resolvido_alerta BOOLEAN   NOT NULL DEFAULT FALSE,
    criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_terrario FOREIGN KEY (id_terrario)
        REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

CREATE INDEX idx_alerta_terrario
    ON alerta (id_terrario, resolvido_alerta, criado_em DESC);

-- ============================================================
--  DADOS INICIAIS
-- ============================================================

INSERT INTO especie (nome_especie, descricao_especie, temp_minima, temp_maxima, humidade_minima, humidade_maxima) VALUES
    ('Python Regius',  'Cobra real',                                   27.0, 30.0, 55.0, 65.0),
    ('Corn Snake',     'Pantherophis guttatus — temperatura moderada', 25.0, 29.0, 45.0, 55.0),
    ('Gecko Leopardo', 'Eublepharis macularius — zonas semi-áridas',   27.0, 31.0, 30.0, 40.0),
    ('Dragão Barbudo', 'Pogona vitticeps',                             30.0, 34.0, 30.0, 40.0);

INSERT INTO utilizador (nome_utilizador, email_utilizador, password_hash_utilizador, tipo_utilizador) VALUES
    ('Admin',    'admin@easybiome.pt',  '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'ADMIN'),
    ('Rodrigo',  'rodrigo@gmail.pt',    '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR'),
    ('Belchior', 'belchior@gmail.pt',   '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR'),
    ('Matheus',  'matheus@gmail.pt',    '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR'),
    ('Rogerio',  'rogerio@gmail.pt',    '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR');

INSERT INTO terrario (
    id_utilizador, id_especie, nome_terrario, descricao_terrario,
    temp_terrario_min, temp_terrario_max, humidade_terrario_min, humidade_terrario_max,
    hora_ligar_iluminacao, hora_desligar_iluminacao
) VALUES (
    1, 4, 'Terrário Exposição', 'Terrário de teste com ESP32',
    30.0, 34.0, 30.0, 40.0,
    '08:00:00', '20:00:00'
);

INSERT INTO utilizador_terrario (id_utilizador, id_terrario, permissao_terrario) VALUES
    (1, 1, 'DONO'),
    (2, 1, 'EDITOR'),
    (3, 1, 'LEITOR');

INSERT INTO dispositivo (id_terrario, nome_dispositivo, tipo_dispositivo) VALUES
    (1, 'Ventoinha',           'VENTOINHA'),
    (1, 'Lâmpada Aquecimento', 'LAMPADA_AQUECIMENTO'),
    (1, 'Lâmpada Iluminação',  'LAMPADA_ILUMINACAO'),
    (1, 'Humidificador',       'HUMIDIFICADOR');