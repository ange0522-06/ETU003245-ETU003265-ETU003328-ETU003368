-- ================================
-- TABLE : utilisateur
-- ================================
CREATE TABLE utilisateur (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('UTILISATEUR', 'MANAGER')),
    statut_compte VARCHAR(20) NOT NULL DEFAULT 'ACTIF'
        CHECK (statut_compte IN ('ACTIF', 'BLOQUE')),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLE : session
-- ================================
CREATE TABLE session (
    id_session SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    id_user INTEGER NOT NULL,
    CONSTRAINT fk_session_user
        FOREIGN KEY (id_user)
        REFERENCES utilisateur (id_user)
        ON DELETE CASCADE
);

-- ================================
-- TABLE : tentative_connexion
-- ================================
CREATE TABLE tentative_connexion (
    id_tentative SERIAL PRIMARY KEY,
    date_tentative TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    succes BOOLEAN NOT NULL,
    id_user INTEGER NOT NULL,
    CONSTRAINT fk_tentative_user
        FOREIGN KEY (id_user)
        REFERENCES utilisateur (id_user)
        ON DELETE CASCADE
);

-- ================================
-- TABLE : signalement
-- ================================
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
        REFERENCES utilisateur (id_user)
        ON DELETE CASCADE
);

-- ================================
-- TABLE : synchronisation (optionnelle)
-- ================================
CREATE TABLE synchronisation (
    id_sync SERIAL PRIMARY KEY,
    date_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) CHECK (type IN ('IMPORT', 'EXPORT')),
    statut VARCHAR(20) CHECK (statut IN ('SUCCES', 'ECHEC'))
);
---------------------Nampiana--------------

INSERT INTO users (email, password, role, locked, failed_attempts) VALUES ('manager@email.com', '1234', 'manager', false, 0);

INSERT INTO signalement (budget, date_signalement, description, entreprise, latitude, longitude, statut, surface_m2, titre, id_user)
VALUES
  (12000, '2026-01-10 09:00:00', 'Nid de poule important', 'Colas', -18.8792, 47.5079, 'nouveau', 15, 'Route dégradée', 1),
  (5000, '2026-01-15 14:30:00', 'Signalement de fissures', 'Eiffage', -18.9100, 47.5200, 'en cours', 8, 'Fissures chaussée', 2),
  (8000, '2026-01-20 11:00:00', 'Trous sur la route', 'Vinci', -18.9000, 47.5100, 'termine', 10, 'Trous route', 3),
  (15000, '2026-01-22 16:00:00', 'Effondrement partiel', 'Colas', -18.8800, 47.5000, 'nouveau', 20, 'Effondrement', 4),
  (7000, '2026-01-25 10:00:00', 'Déformation de la chaussée', 'Eiffage', -18.8850, 47.5050, 'en cours', 12, 'Déformation', 5),
  (9500, '2026-01-26 13:00:00', 'Problème de drainage', 'Vinci', -18.8880, 47.5080, 'nouveau', 9, 'Drainage', 6),
  (20000, '2026-01-27 08:30:00', 'Route barrée', 'Colas', -18.8920, 47.5120, 'termine', 25, 'Route barrée', 7);


UPDATE users 
SET failed_attempts = 0, locked = false 
WHERE email = 'manager@email.com';


DOCKERISATION-tEST
demarrage reel
docker compose up -d
>> docker compose up -d
verifier 
docker ps

INSERT INTO users (username, email, password, role, locked, failed_attempts) VALUES ('manager1', 'manager1@email.com', '12345', 'manager1', false, 0);