CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    failed_attempts INT DEFAULT 0,
    locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE tentative_connexion (
    id_tentative SERIAL PRIMARY KEY,
    date_tentative TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    succes BOOLEAN NOT NULL,
    id_user INTEGER NOT NULL,
    CONSTRAINT fk_tentative_user
        FOREIGN KEY (id_user)
        REFERENCES utilisateur (id)
        ON DELETE CASCADE
);

CREATE TABLE session (
    id_session SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    id_user INTEGER NOT NULL,
    CONSTRAINT fk_session_user
        FOREIGN KEY (id_user)
        REFERENCES utilisateur (id)
        ON DELETE CASCADE
);

CREATE TABLE signalement (
    id_signalement SERIAL PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) NOT NULL DEFAULT 'NOUVEAU'
        CHECK (statut IN ('NOUVEAU', 'EN_COURS', 'TERMINE')),
    surface_m2 DOUBLE PRECISION,
    budget NUMERIC(12,2),
    entreprise VARCHAR(150),
    id_user INTEGER NOT NULL,
    CONSTRAINT fk_signalement_user
        FOREIGN KEY (id_user)
        REFERENCES utilisateur (id)
        ON DELETE CASCADE
);

CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    id_signalement INT REFERENCES signalement(id_signalement) ON DELETE CASCADE,
    image_path TEXT
);

CREATE TABLE synchronisation (
    id_sync SERIAL PRIMARY KEY,
    date_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) CHECK (type IN ('IMPORT', 'EXPORT')),
    statut VARCHAR(20) CHECK (statut IN ('SUCCES', 'ECHEC'))
);

INSERT INTO utilisateur (email, password, role, locked, failed_attempts) VALUES ('manager@email.com', '1234', 'manager', false, 0);

INSERT INTO signalement (budget, date_signalement, description, entreprise, latitude, longitude, statut, surface_m2, titre, id_user)
VALUES
  (12000, '2026-01-10 09:00:00', 'Nid de poule important', 'Colas', -18.8792, 47.5079, 'NOUVEAU', 15, 'Route dégradée', 1),
  (5000, '2026-01-15 14:30:00', 'Signalement de fissures', 'Eiffage', -18.9100, 47.5200, 'EN_COURS', 8, 'Fissures chaussée', 1),
  (8000, '2026-01-20 11:00:00', 'Trous sur la route', 'Vinci', -18.9000, 47.5100, 'TERMINE', 10, 'Trous route', 1),
  (15000, '2026-01-22 16:00:00', 'Effondrement partiel', 'Colas', -18.8800, 47.5000, 'NOUVEAU', 20, 'Effondrement', 1),
  (7000, '2026-01-25 10:00:00', 'Déformation de la chaussée', 'Eiffage', -18.8850, 47.5050, 'EN_COURS', 12, 'Déformation', 1),
  (9500, '2026-01-26 13:00:00', 'Problème de drainage', 'Vinci', -18.8880, 47.5080, 'NOUVEAU', 9, 'Drainage', 1),
  (20000, '2026-01-27 08:30:00', 'Route barrée', 'Colas', -18.8920, 47.5120, 'TERMINE', 25, 'Route barrée', 1);

