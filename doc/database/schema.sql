-- ============================================================================
-- App BiT — DDL PostgreSQL 15+
-- Convenciones: snake_case, PK UUID, timestamps created_at/updated_at
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. usuario
-- ----------------------------------------------------------------------------
CREATE TABLE usuario (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email                    VARCHAR(255) NOT NULL UNIQUE,
  password_hash            VARCHAR(255) NOT NULL,
  nombre                   VARCHAR(120) NOT NULL,
  fecha_nacimiento         DATE         NOT NULL,
  genero                   VARCHAR(40),
  escolaridad              VARCHAR(80)  NOT NULL,
  continente               VARCHAR(60)  NOT NULL,
  pais                     VARCHAR(60)  NOT NULL,
  estado                   VARCHAR(60),
  ciudad                   VARCHAR(120) NOT NULL,
  whatsapp                 VARCHAR(30),
  idioma_preferido         VARCHAR(5)   NOT NULL DEFAULT 'pt',
  nivel_profesional        VARCHAR(40)  NOT NULL,
  area_tecnologia          VARCHAR(80),
  objetivo                 VARCHAR(40)  NOT NULL,
  lat                      DECIMAL(9,6),
  lng                      DECIMAL(9,6),
  -- Identificadores regionales (cifrados a nivel de aplicación)
  cpf                      VARCHAR(11)  UNIQUE,
  documento_nacional_tipo  VARCHAR(20),
  documento_nacional_numero VARCHAR(40),
  documento_nacional_pais  VARCHAR(60),
  onboarding_completo      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. empresa
-- ----------------------------------------------------------------------------
CREATE TABLE empresa (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(160) NOT NULL,
  sitio_web  VARCHAR(255),
  pais       VARCHAR(60)  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. vacante
-- ----------------------------------------------------------------------------
CREATE TABLE vacante (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID         NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  titulo      VARCHAR(160) NOT NULL,
  descripcion TEXT         NOT NULL,
  requisitos  JSONB        NOT NULL,
  nivel       VARCHAR(40)  NOT NULL,
  area        VARCHAR(80)  NOT NULL,
  idioma      VARCHAR(5)   NOT NULL DEFAULT 'pt',
  activa      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vacante_feed ON vacante (activa, area, nivel);

-- ----------------------------------------------------------------------------
-- 4. aplicacion
-- ----------------------------------------------------------------------------
CREATE TABLE aplicacion (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id     UUID        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  vacante_id     UUID        NOT NULL REFERENCES vacante(id) ON DELETE CASCADE,
  gap_porcentual SMALLINT    NOT NULL CHECK (gap_porcentual BETWEEN 0 AND 100),
  estado         VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, vacante_id)
);

CREATE INDEX idx_aplicacion_usuario ON aplicacion (usuario_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. curso
-- ----------------------------------------------------------------------------
CREATE TABLE curso (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           VARCHAR(200) NOT NULL,
  proveedor        VARCHAR(120) NOT NULL,
  url              VARCHAR(500) NOT NULL,
  es_gratuito      BOOLEAN      NOT NULL,
  duracion_horas   INT,
  nivel            VARCHAR(40)  NOT NULL,
  area             VARCHAR(80)  NOT NULL,
  skills_impartidos JSONB       NOT NULL,
  idioma           VARCHAR(5)   NOT NULL DEFAULT 'pt',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_curso_busqueda ON curso (area, nivel, es_gratuito);

-- ----------------------------------------------------------------------------
-- 6. trayectoria
-- ----------------------------------------------------------------------------
CREATE TABLE trayectoria (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  gap_items       JSONB       NOT NULL,
  cursos_sugeridos JSONB      NOT NULL,
  generada_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activa          BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_trayectoria_usuario ON trayectoria (usuario_id, activa);

-- ----------------------------------------------------------------------------
-- 7. checkin_emocional
-- ----------------------------------------------------------------------------
CREATE TABLE checkin_emocional (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id           UUID         NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  humor                VARCHAR(20)  NOT NULL,
  humor_codigo         VARCHAR(20),  -- SNOMED, ej: 44054006 (tristeza)
  nota_semanal         SMALLINT     CHECK (nota_semanal BETWEEN 0 AND 10),
  escala_usada         VARCHAR(40),  -- PHQ-9, GAD-7, WHO-5, libre
  escala_codigo_loinc  VARCHAR(20),  -- LOINC, ej: 44261-6 (PHQ-9)
  escala_items_json    JSONB,        -- items individuales {"q1": 2, "q2": 3}
  puntuacion_total     DECIMAL(5,2), -- puntuación estandarizada
  interpretacion       VARCHAR(40),  -- leve, moderado, severo
  contexto             JSONB,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkin_usuario ON checkin_emocional (usuario_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. recurso_bienestar
-- ----------------------------------------------------------------------------
CREATE TABLE recurso_bienestar (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              VARCHAR(30)  NOT NULL,
  titulo            VARCHAR(200) NOT NULL,
  url               VARCHAR(500),
  descripcion       TEXT         NOT NULL,
  humor_asociado    JSONB        NOT NULL,
  categoria_clinica VARCHAR(40),  -- SNOMED categoria
  indicaciones_json JSONB,        -- [{sistema, codigo}, ...]
  region            VARCHAR(60),
  idioma            VARCHAR(5)   NOT NULL DEFAULT 'pt',
  descargable       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. derivacion_cvv
-- ----------------------------------------------------------------------------
CREATE TABLE derivacion_cvv (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id            UUID        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  checkin_id            UUID        NOT NULL REFERENCES checkin_emocional(id) ON DELETE CASCADE,
  nota_detectada        SMALLINT    NOT NULL,
  motivo_clinico_codigo VARCHAR(20),  -- CID-10 o SNOMED del motivo
  servicio_destino      VARCHAR(80),  -- CVV, CAPS, SUS-emergencia, hospital
  urgencia              VARCHAR(20),  -- inmediata, 24h, 1-semana
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. experiencia_evento
-- ----------------------------------------------------------------------------
CREATE TABLE experiencia_evento (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT         NOT NULL,
  fecha_evento TIMESTAMPTZ,
  es_en_vivo   BOOLEAN      NOT NULL,
  url          VARCHAR(500),
  idioma       VARCHAR(5)   NOT NULL DEFAULT 'pt',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. testimonio
-- ----------------------------------------------------------------------------
CREATE TABLE testimonio (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id           UUID         REFERENCES experiencia_evento(id) ON DELETE SET NULL,
  nombre              VARCHAR(160) NOT NULL,
  rol_actual          VARCHAR(200) NOT NULL,
  trayectoria_resumida TEXT        NOT NULL,
  url_video           VARCHAR(500),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. mentor
-- ----------------------------------------------------------------------------
CREATE TABLE mentor (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID         NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  area            VARCHAR(80)  NOT NULL,
  biografia       TEXT         NOT NULL,
  ofrece_practica BOOLEAN      NOT NULL DEFAULT TRUE,
  disponibilidad  JSONB        NOT NULL,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. mentoria_invitacion
-- ----------------------------------------------------------------------------
CREATE TABLE mentoria_invitacion (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id      UUID        NOT NULL REFERENCES mentor(id) ON DELETE CASCADE,
  usuario_id     UUID        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tipo           VARCHAR(20) NOT NULL,
  mensaje        TEXT,
  estado         VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  agendada_para  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentoria_bandeja ON mentoria_invitacion (usuario_id, estado);

-- ----------------------------------------------------------------------------
-- 14. zona_visent
-- ----------------------------------------------------------------------------
CREATE TABLE zona_visent (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  lat                    DECIMAL(9,6) NOT NULL,
  lng                    DECIMAL(9,6) NOT NULL,
  concentracion_personas INT          NOT NULL,
  cobertura_red          VARCHAR(10)  NOT NULL
);

CREATE INDEX idx_zona_visent_geo ON zona_visent (lat, lng);

-- ----------------------------------------------------------------------------
-- 15. evento_visent
-- ----------------------------------------------------------------------------
CREATE TABLE evento_visent (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id    UUID         NOT NULL REFERENCES zona_visent(id) ON DELETE CASCADE,
  titulo     VARCHAR(200) NOT NULL,
  descripcion TEXT        NOT NULL,
  lat        DECIMAL(9,6) NOT NULL,
  lng        DECIMAL(9,6) NOT NULL,
  fecha      TIMESTAMPTZ,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evento_visent_zona ON evento_visent (zona_id, fecha);

-- ----------------------------------------------------------------------------
-- 16. terminologia_clinica — vocabularios clínicos controlados
--     (LOINC, SNOMED CT, CID-10, CIAP-2) para interoperabilidad clínica
--     regional (Brasil + LATAM). Ver seguridad-compliance.md §16.
-- ----------------------------------------------------------------------------
CREATE TABLE terminologia_clinica (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sistema     VARCHAR(20)  NOT NULL,  -- 'LOINC' | 'SNOMED' | 'CID-10' | 'CIAP-2'
  codigo      VARCHAR(40)  NOT NULL,
  descripcion TEXT         NOT NULL,
  categoria   VARCHAR(80),
  padre       VARCHAR(40),            -- para jerarquías SNOMED
  idioma      VARCHAR(5)   NOT NULL DEFAULT 'pt',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (sistema, codigo, idioma)
);

CREATE INDEX idx_terminologia_sistema_codigo ON terminologia_clinica (sistema, codigo);
CREATE INDEX idx_terminologia_categoria       ON terminologia_clinica (categoria);

-- ----------------------------------------------------------------------------
-- 17. outbox_events — outbox pattern para garantizar publicación de eventos
--     cross-service. Vive en la misma DB que el agregado, en la misma
--     transacción ACID. Ver topologia-servicios.md §7.2.
-- ----------------------------------------------------------------------------
CREATE TABLE outbox_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id    UUID        NOT NULL,
  aggregate_type  VARCHAR(40) NOT NULL,
  event_type      VARCHAR(80) NOT NULL,
  payload         JSONB       NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  attempts        INT         NOT NULL DEFAULT 0,
  last_error      TEXT
);

CREATE INDEX idx_outbox_pending ON outbox_events (created_at) WHERE published_at IS NULL;

-- ----------------------------------------------------------------------------
-- 18. sagas — estado visible al usuario durante transacciones cross-service.
--     Permite a la UI mostrar "procesando..." con timeout explícito y
--     rollback si es necesario. Ver topologia-servicios.md §7.6.
-- ----------------------------------------------------------------------------
CREATE TABLE sagas (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo         VARCHAR(80) NOT NULL,
  usuario_id   UUID        NOT NULL,
  estado       VARCHAR(20) NOT NULL,  -- pending|processing|completed|rolling_back|rolled_back
  metadata     JSONB,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error        TEXT
);

CREATE INDEX idx_sagas_usuario ON sagas (usuario_id, started_at DESC);
CREATE INDEX idx_sagas_activas ON sagas (estado) WHERE estado NOT IN ('completed', 'rolled_back');

-- ----------------------------------------------------------------------------
-- Trigger genérico para updated_at en usuario
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuario_updated_at
  BEFORE UPDATE ON usuario
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sagas_updated_at
  BEFORE UPDATE ON sagas
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
