# Plan de projet — Application de Planning des Interventions Comafrique

**Porteur du projet :** Ahmed Abdoul-Razak TIMITÉ — Responsable Support & Tracking
**Entreprise :** Comafrique Technologies, Abidjan
**Date :** Juin 2026
**Origine :** Migration du fichier `Planning_Interventions_Comafrique.xlsx` vers une application web collaborative

---

## 1. Contexte et objectifs

### 1.1 Constat de départ
Le planning des interventions terrain est aujourd'hui géré dans un fichier Excel (`Planning_Interventions_Comafrique.xlsx`) structuré en 5 onglets :

| Onglet | Rôle |
|---|---|
| 📅 Planning Hebdo | Vue calendrier par jour / technicien / intervention |
| 📅 Planning Hebdo 1 | Variante simplifiée de la vue hebdo |
| 📋 Suivi des Interventions | Table de données brute (1 ligne = 1 intervention) |
| 📊 Dashboard | KPI calculés (COUNTIF/COUNTA) à partir du suivi |
| ⚙️ Référentiels | Listes de référence (techniciens, supports, types, statuts...) |

**Limites actuelles :**
- Un seul fichier modifiable à la fois → conflits si plusieurs personnes l'éditent (OneDrive/Teams atténue mais ne supprime pas le risque)
- Pas de traçabilité fine de qui modifie quoi
- Pas de gestion de droits (tout le monde peut tout modifier, y compris les référentiels)
- Dashboard recalculé manuellement (formules figées sur 50 lignes)

### 1.2 Objectif du projet
Construire une application web qui :
1. Stocke les données dans une **vraie base de données** (plus de fichier unique)
2. Permet à **2 à 5 utilisateurs** de consulter/modifier **en simultané**
3. Applique des **droits différenciés** : lecture seule pour certains profils, lecture/écriture pour d'autres
4. Garde un **export Excel à la demande**, fidèle au format actuel, pour le partage avec la direction ou des tiers qui n'ont pas accès à l'appli
5. Est hébergée **gratuitement** (aucun coût d'infrastructure récurrent)

### 1.3 Hors périmètre (V1)
- Application mobile native (le web responsive suffit pour 2-5 utilisateurs)
- Notifications automatiques (email/SMS) — éventuel lot V2
- Import automatique depuis Excel vers la base (la bascule initiale se fait manuellement, voir Sprint 0)
- Géolocalisation temps réel des techniciens

---

## 2. Utilisateurs et droits

| Profil | Exemple | Droits |
|---|---|---|
| **Admin** | TIMITÉ | Lecture/écriture sur tout, gestion des référentiels (techniciens, clients, types...) et des comptes utilisateurs |
| **Éditeur** | Support planning / techniciens responsables | Lecture/écriture sur les interventions, lecture seule sur les référentiels |
| **Lecteur** | Direction, clients internes | Lecture seule sur tout, accès à l'export Excel |

Authentification simple par email + mot de passe (pas de SSO en V1 — non nécessaire pour 5 comptes).

---

## 3. Architecture technique

### 3.1 Stack retenue

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | Next.js (React) | Interface web classique (formulaires + listes), déploiement Vercel natif |
| Backend / API | FastAPI (Python) | Cohérent avec ta stack actuelle (BI Analytics, ERP EKO, Outlook Agent) |
| Base de données | PostgreSQL | Gère nativement les accès concurrents (contrairement à SQLite) |
| Auth | JWT (JSON Web Token) | Simple, sans dépendance externe payante |
| Export Excel | openpyxl (Python) | Génère un .xlsx fidèle au format existant, à la demande |
| Hébergement frontend | Vercel (plan gratuit) | Déploiement Next.js natif, CDN inclus |
| Hébergement backend | Render (plan gratuit) | Déploiement FastAPI simple via Docker/Git |
| Hébergement base de données | Supabase (plan gratuit, 500 Mo) | PostgreSQL managé, gratuit, interface d'administration incluse |

### 3.2 Limites connues du tout-gratuit (à accepter consciemment)
- **Render gratuit** : le service backend se met en veille après ~15 min d'inactivité → premier appel du matin peut prendre 30-50 secondes à répondre. Acceptable pour un usage interne quotidien, pas pour un usage critique 24/7.
- **Supabase gratuit** : le projet est mis en pause après 7 jours sans requête. Un ping automatique (cron) résout ce point.
- **500 Mo de base de données** : largement suffisant pour des années de données d'interventions (texte/dates, pas de fichiers binaires stockés en base).
- Si ces limites deviennent gênantes, la bascule vers un plan payant (quelques dollars/mois) reste possible sans réécriture.

### 3.3 Modèle de données (schéma relationnel)

```
users
  id, nom, email, mot_de_passe_hash, role (admin/editeur/lecteur), actif, créé_le

techniciens
  id, nom, actif

supports
  id, nom, actif

clients
  id, nom, actif

types_intervention
  id, libellé, actif

équipements
  id, libellé, actif

statuts
  id, libellé (Planifiée/En cours/Terminée/Annulée/Reportée), ordre_affichage

priorités
  id, libellé (Haute/Normale/Basse)

interventions
  id
  date_planification
  technicien_id → techniciens
  support_id → supports
  client_id → clients
  type_intervention_id → types_intervention
  équipement_id → équipements
  nb_véhicules
  priorité_id → priorités
  statut_id → statuts
  date_réalisation
  durée_heures
  commentaires
  preuve_bl_url (lien fichier, optionnel)
  créé_par → users
  modifié_le, modifié_par → users
```

Ce schéma reprend 1:1 les colonnes de l'onglet **Suivi des Interventions**, qui est la vraie source de vérité du fichier actuel. Les onglets **Planning Hebdo** et **Dashboard** deviennent des **vues calculées** côté application (requêtes SQL groupées), plus besoin de les maintenir manuellement.

### 3.4 Fonctionnalités par écran

| Écran | Fonction |
|---|---|
| Connexion | Email + mot de passe |
| Liste des interventions | Filtrable par date, technicien, statut, client — éditable selon les droits |
| Formulaire intervention | Création/modification d'une intervention |
| Vue planning hebdomadaire | Vue calendrier par technicien/jour, équivalent à l'onglet actuel |
| Dashboard | KPI temps réel (total, par statut, par technicien, top clients) |
| Référentiels (admin uniquement) | Gestion des listes techniciens/clients/types/équipements |
| Export Excel | Bouton de téléchargement, génère un .xlsx au format actuel |
| Gestion des utilisateurs (admin) | Créer/désactiver des comptes, attribuer les rôles |

---

## 4. Plan de sprints

Découpage en sprints d'**1 semaine**, adapté à un développement en solo avec accompagnement IA (toi + Claude Code pour l'implémentation). Durée totale estimée : **6 semaines**, compatible avec ta charge actuelle (poste + Master + projets parallèles).

### Sprint 0 — Cadrage et préparation (avant développement)
**Objectif :** Tout est prêt pour coder sans interruption.

- [ ] Créer les comptes : Supabase, Render, Vercel, GitHub (repo dédié)
- [ ] Définir la liste exacte des 5 utilisateurs et leurs rôles
- [ ] Valider le schéma de données (section 3.3) — ajuster si des colonnes manquent
- [ ] Extraire les référentiels actuels (techniciens, clients, types, équipements) depuis l'onglet ⚙️ Référentiels pour les pré-charger en base
- [ ] Décider du nom de domaine / sous-domaine (ou URL Vercel par défaut)

**Livrable :** Repo Git initialisé, comptes cloud créés, schéma de données validé.

---

### Sprint 1 — Fondations backend (Semaine 1)
**Objectif :** API fonctionnelle avec base de données et authentification.

- [ ] Initialiser le projet FastAPI (structure modulaire : `models/`, `routers/`, `schemas/`, `core/`)
- [ ] Configurer la connexion PostgreSQL (Supabase) via SQLAlchemy
- [ ] Créer les migrations de base de données (Alembic) pour toutes les tables (section 3.3)
- [ ] Implémenter l'authentification JWT (inscription admin initiale, login, hash des mots de passe)
- [ ] Implémenter le middleware de contrôle des droits (lecture/écriture par rôle)
- [ ] Script de seed : injecter les référentiels extraits au Sprint 0

**Livrable :** API déployée sur Render, testable via Swagger (`/docs`), login fonctionnel.

---

### Sprint 2 — CRUD interventions (Semaine 2)
**Objectif :** Les interventions sont gérables de bout en bout via l'API.

- [ ] Endpoints CRUD `interventions` (créer, lire, modifier, supprimer/annuler)
- [ ] Endpoints CRUD référentiels (techniciens, clients, types, équipements) — accès admin uniquement en écriture
- [ ] Filtres et recherche (par date, technicien, statut, client) côté API
- [ ] Endpoints `users` (admin : créer/désactiver, soi-même : changer son mot de passe)
- [ ] Tests automatisés des endpoints critiques (création intervention, contrôle des droits)

**Livrable :** API complète et testée, prête à être consommée par le frontend.

---

### Sprint 3 — Frontend, écrans principaux (Semaine 3)
**Objectif :** Une personne peut se connecter et gérer les interventions depuis le navigateur.

- [ ] Initialiser le projet Next.js, connexion à l'API
- [ ] Écran de connexion
- [ ] Écran liste des interventions (tableau filtrable, pagination)
- [ ] Formulaire de création/modification d'intervention (listes déroulantes alimentées par les référentiels)
- [ ] Gestion des droits côté interface (masquer les boutons d'édition pour les lecteurs)

**Livrable :** Application utilisable pour le cœur du besoin (créer/consulter des interventions), déployée sur Vercel.

---

### Sprint 4 — Vue planning, dashboard, export Excel (Semaine 4)
**Objectif :** Parité fonctionnelle avec le fichier Excel actuel.

- [ ] Vue planning hebdomadaire (grille jour × technicien, équivalent onglet 📅 Planning Hebdo)
- [ ] Dashboard avec KPI temps réel (équivalent onglet 📊 Dashboard) : total, par statut, par technicien, top clients
- [ ] Bouton export Excel : génération d'un `.xlsx` reprenant la mise en forme du fichier actuel (couleurs de statut, en-têtes)
- [ ] Écran admin de gestion des référentiels et des utilisateurs

**Livrable :** Application fonctionnellement équivalente au fichier Excel, avec export pour partage externe.

---

### Sprint 5 — Tests, migration des données, mise en production (Semaine 5)
**Objectif :** Bascule réelle depuis le fichier Excel actuel.

- [ ] Script de migration : importer les interventions existantes de l'onglet 📋 Suivi des Interventions vers la base
- [ ] Tests utilisateurs avec 2-3 membres de l'équipe (retours à chaud)
- [ ] Corrections des bugs remontés
- [ ] Vérification des droits (un lecteur ne peut pas modifier, etc.)
- [ ] Mise en place du ping automatique anti-pause Supabase (cron gratuit, ex: cron-job.org)
- [ ] Documentation rapide d'utilisation (1 page) pour l'équipe

**Livrable :** Application en production, données migrées, équipe formée.

---

### Sprint 6 — Stabilisation et bascule définitive (Semaine 6)
**Objectif :** L'Excel devient secondaire, l'application devient la source de vérité.

- [ ] Période de double-saisie courte (3-5 jours) si besoin de confiance avant bascule complète
- [ ] Corrections finales selon usage réel
- [ ] Export Excel final de l'ancien fichier archivé comme référence historique
- [ ] Décision officielle : l'application devient l'unique outil de gestion du planning

**Livrable :** Bascule complète, fichier Excel archivé en lecture seule.

---

## 5. Risques et points de vigilance

| Risque | Impact | Mitigation |
|---|---|---|
| Réveil lent du backend (Render gratuit) | Léger délai au premier accès du matin | Ping automatique programmé avant l'heure de prise de poste |
| Résistance au changement de l'équipe terrain | Sous-utilisation de l'outil | Sprint 5 avec tests utilisateurs et formation courte |
| Données mal migrées depuis l'Excel | Perte d'historique | Script de migration testé sur copie avant bascule réelle, Excel archivé |
| Charge de travail personnelle (poste + Master) | Retard sur le planning | Sprints volontairement courts et indépendants ; possibilité d'étaler sans tout bloquer |

---

## 6. Prochaine étape immédiate

Démarrage du **Sprint 0** : scaffolding du repo (structure de dossiers backend + frontend), schéma SQL initial, et squelette de l'API FastAPI.
