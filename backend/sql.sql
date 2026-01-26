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
-- Table des points routiers (issues)
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    date DATE,
    surface DOUBLE PRECISION,
    budget DOUBLE PRECISION,
    entreprise VARCHAR(255)
);

INSERT INTO users (email, password, role, locked, failed_attempts)
VALUES ('manager@email.com', '$2a$10$9dxcPHsi9d7TXsii8jjzHedSLP3XSVt6Un4LEnqx3QW7nbXZFBrlO', 'manager', false, 0);


INSERT INTO issues (budget, date, entreprise, latitude, longitude, status, surface, titre)
VALUES
  (1000, '2026-01-15', 'ABC Construction', -18.8792, 47.5079, 'en cours', 20, 'Route endommagée'),
  (3000, '2026-01-20', 'XYZ Travaux', -18.9100, 47.5250, 'nouveau', 50, 'Travaux de revêtement'),
  (5000, '2026-01-10', 'InfraPlus', -18.8650, 47.5350, 'termine', 100, 'Réparation de pont');

DOCKERISATION-tEST
demarrage reel
docker compose up -d
>> docker compose up -d
verifier 
docker ps

