-- ============================================================
--  EasyBiome — Schema MySQL
-- ============================================================

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
    ativo_utilizador         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em                TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TERRARIO
-- ------------------------------------------------------------
CREATE TABLE terrario (
    id_terrario        BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_utilizador      BIGINT       NOT NULL,
    nome_terrario      VARCHAR(100) NOT NULL,
    descricao_terrario VARCHAR(255),
    criado_em          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_terrario_utilizador FOREIGN KEY (id_utilizador) REFERENCES utilizador(id_utilizador) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- UTILIZADOR_TERRARIO  (N:M — partilha de terrários)
-- ------------------------------------------------------------
CREATE TABLE utilizador_terrario (
    id_utilizador_terrario BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_utilizador          BIGINT      NOT NULL,
    id_terrario            BIGINT      NOT NULL,
    permissao_terrario     VARCHAR(20) NOT NULL DEFAULT 'LEITOR'
                           CHECK (permissao_terrario IN ('DONO', 'EDITOR', 'LEITOR')),
    UNIQUE (id_utilizador, id_terrario),
    CONSTRAINT fk_ut_utilizador FOREIGN KEY (id_utilizador) REFERENCES utilizador(id_utilizador) ON DELETE CASCADE,
    CONSTRAINT fk_ut_terrario FOREIGN KEY (id_terrario) REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- LEITURA_SENSOR
-- ------------------------------------------------------------
CREATE TABLE leitura_sensor (
    id_leitura_sensor BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_terrario       BIGINT    NOT NULL,
    temperatura       FLOAT     NOT NULL,
    humidade          FLOAT     NOT NULL,
    registado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leitura_terrario FOREIGN KEY (id_terrario) REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

CREATE INDEX idx_leitura_terrario_data
    ON leitura_sensor (id_terrario, registado_em DESC);

-- ------------------------------------------------------------
-- DISPOSITIVO
-- ------------------------------------------------------------
CREATE TABLE dispositivo (
    id_dispositivo   BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_terrario      BIGINT    NOT NULL,
    nome_dispositivo VARCHAR(100) NOT NULL,
    tipo_dispositivo VARCHAR(30)  NOT NULL
                     CHECK (tipo_dispositivo IN (
                         'VENTOINHA',
                         'LAMPADA_AQUECIMENTO',
                         'LAMPADA_ILUMINACAO',
                         'RELE'
                     )),
    estado_atual     BOOLEAN      NOT NULL DEFAULT FALSE,
    atualizado_em    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispositivo_terrario FOREIGN KEY (id_terrario) REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ESTADO_LAMPADA
-- ------------------------------------------------------------
CREATE TABLE estado_lampada (
    id_estado_lampada          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_dispositivo             BIGINT      NOT NULL,
    ligada_estado_lampada      BOOLEAN     NOT NULL DEFAULT FALSE,
    modo_estado_lampada        VARCHAR(20) NOT NULL
                               CHECK (modo_estado_lampada IN ('AQUECIMENTO', 'ILUMINACAO')),
    intensidade_estado_lampada INT         NOT NULL DEFAULT 100
                               CHECK (intensidade_estado_lampada BETWEEN 0 AND 100),
    rele_estado                BOOLEAN     NOT NULL DEFAULT FALSE,
    registado_em               TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_estado_dispositivo FOREIGN KEY (id_dispositivo) REFERENCES dispositivo(id_dispositivo) ON DELETE CASCADE
);

CREATE INDEX idx_estado_lampada_dispositivo
    ON estado_lampada (id_dispositivo, registado_em DESC);

-- ------------------------------------------------------------
-- LOG_COMANDO
-- ------------------------------------------------------------
CREATE TABLE log_comando (
    id_log          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_dispositivo  BIGINT      NOT NULL,
    id_utilizador   BIGINT,
    estado_anterior BOOLEAN     NOT NULL,
    estado_novo     BOOLEAN     NOT NULL,
    origem_log      VARCHAR(20) NOT NULL
                    CHECK (origem_log IN ('APP', 'AUTOMATICO', 'ESP32')),
    executado_em    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_dispositivo FOREIGN KEY (id_dispositivo) REFERENCES dispositivo(id_dispositivo) ON DELETE CASCADE,
    CONSTRAINT fk_log_utilizador FOREIGN KEY (id_utilizador) REFERENCES utilizador(id_utilizador) ON DELETE SET NULL
);

CREATE INDEX idx_log_dispositivo
    ON log_comando (id_dispositivo, executado_em DESC);

-- ------------------------------------------------------------
-- ALERTA
-- ------------------------------------------------------------
CREATE TABLE alerta (
    id_alerta        BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_terrario      BIGINT       NOT NULL,
    tipo_alerta      VARCHAR(30)  NOT NULL
                     CHECK (tipo_alerta IN (
                         'TEMPERATURA_ALTA',
                         'TEMPERATURA_BAIXA',
                         'HUMIDADE_ALTA',
                         'HUMIDADE_BAIXA',
                         'DISPOSITIVO_FALHA'
                     )),
    mensagem_alerta  VARCHAR(255) NOT NULL,
    resolvido_alerta BOOLEAN      NOT NULL DEFAULT FALSE,
    criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_terrario FOREIGN KEY (id_terrario) REFERENCES terrario(id_terrario) ON DELETE CASCADE
);

CREATE INDEX idx_alerta_terrario
    ON alerta (id_terrario, resolvido_alerta, criado_em DESC);

-- ============================================================
--  DADOS INICIAIS
-- ============================================================

INSERT INTO utilizador (nome_utilizador, email_utilizador, password_hash_utilizador, tipo_utilizador) VALUES 
    ('Admin', 'admin@easybiome.pt', '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'ADMIN'),
    ('Rodigo', 'rodrigo@gmail.pt', '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR'),
    ('Belchior', 'belchior@gmail.pt', '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR'),
    ('Matheus', 'matheus@gmail.pt', '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR'),
    ('Rogerio', 'rogerio@gmail.pt', '$2a$10$wX1234exampleHashAqui567890abcdefghijklmnop', 'UTILIZADOR');

INSERT INTO terrario (id_utilizador, nome_terrario, descricao_terrario)
VALUES (1, 'Terrário Exposição', 'Terrário de teste com ESP32');

INSERT INTO dispositivo (id_terrario, nome_dispositivo, tipo_dispositivo) VALUES
    (1, 'Ventoinha',           'VENTOINHA'),
    (1, 'Lâmpada Aquecimento', 'LAMPADA_AQUECIMENTO'),
    (1, 'Lâmpada Iluminação',  'LAMPADA_ILUMINACAO'),
    (1, 'Relé Aquecimento',    'RELE');