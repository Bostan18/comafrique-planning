# Planning Interventions — Comafrique Technologies

Application web collaborative pour la gestion du planning des interventions
terrain, en remplacement du fichier `Planning_Interventions_Comafrique.xlsx`.

Voir `Plan_Projet_App_Planning_Comafrique.md` pour le plan de projet complet
(sprints, architecture, risques).

## Structure du repo

```
comafrique-planning/
├── backend/     API FastAPI + PostgreSQL (SQLAlchemy + Alembic)
└── frontend/    Application Next.js (App Router)
```

## Démarrage en local

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# éditer .env : renseigner DATABASE_URL (Supabase ou Postgres local) et SECRET_KEY

# Créer les tables (première fois)
python3 -c "from app.core.database import Base, engine; from app.models import *; Base.metadata.create_all(bind=engine)"

# Injecter les référentiels + le compte admin initial
python3 -m app.seed
# ⚠️ Changer le mot de passe admin par défaut (voir app/seed.py) avant tout déploiement réel

# Démarrer le serveur
uvicorn app.main:app --reload
```

L'API est disponible sur `http://localhost:8000`, documentation interactive
sur `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# éditer .env.local si l'API n'est pas sur localhost:8000

npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Déploiement (gratuit)

| Composant | Service | Notes |
|---|---|---|
| Base de données | [Supabase](https://supabase.com) | Créer un projet, copier la `Connection string` (mode `URI`) dans `DATABASE_URL` |
| Backend | [Render](https://render.com) | Nouveau "Web Service" depuis le repo Git, dossier racine `backend/`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Frontend | [Vercel](https://vercel.com) | Nouveau projet depuis le repo Git, dossier racine `frontend/`, variable d'env `NEXT_PUBLIC_API_URL` = URL Render |

Penser à mettre à jour `CORS_ORIGINS` côté backend avec l'URL Vercel finale.

### Anti-pause Supabase / anti-veille Render

Les plans gratuits se mettent en veille après inactivité. Mettre en place un
ping automatique (ex: [cron-job.org](https://cron-job.org), gratuit) qui
appelle `GET /` toutes les 10 minutes en journée pour garder le backend
réveillé, et qui exécute une requête sur Supabase au moins une fois par
semaine.

## Comptes et rôles

Trois rôles : `admin` (tout + gestion référentiels/utilisateurs), `editeur`
(lecture/écriture sur les interventions), `lecteur` (lecture seule + export
Excel). Le premier compte admin est créé par `app/seed.py` — pense à changer
l'email et le mot de passe par défaut avant la mise en production.

## État du scaffolding (Sprint 0/1)

- [x] Backend FastAPI : auth JWT, CRUD interventions, CRUD référentiels,
      gestion utilisateurs, export Excel — testé de bout en bout
- [x] Frontend Next.js : connexion, liste interventions filtrable,
      formulaire CRUD, vue planning hebdo, dashboard KPI, gestion référentiels
- [x] Build de production validé (`npm run build` sans erreur)
- [ ] Migrations Alembic à générer (`alembic revision --autogenerate`) une
      fois connecté à une vraie base Supabase
- [ ] Déploiement réel sur Render/Vercel/Supabase (Sprint 5 du plan)
- [ ] Migration des données existantes depuis le fichier Excel (Sprint 5)

## Note sur les dépendances

`npm audit` signale des vulnérabilités résiduelles sur Next.js 14.2.x liées à
des fonctionnalités non utilisées ici (Image Optimization, Middleware,
i18n routing). Un correctif complet nécessite un passage à Next.js 16
(changement majeur, non appliqué automatiquement). À évaluer avant mise en
production si le périmètre évolue.
