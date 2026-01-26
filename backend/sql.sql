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

DOCKERISATION-tEST
demarrage reel
docker compose up -d
>> docker compose up -d
verifier 
docker ps

