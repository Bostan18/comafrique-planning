"""
Script de seed initial de la base de données.
Injecte les référentiels extraits de l'onglet ⚙️ Référentiels du fichier
Planning_Interventions_Comafrique.xlsx, ainsi qu'un premier compte admin.

Usage:
    python -m app.seed
"""

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import settings
from app.models.referentiels import (
    Client,
    Equipement,
    Priorite,
    Statut,
    Support,
    Technicien,
    TypeIntervention,
)
from app.models.user import RoleEnum, User

TECHNICIENS = [
    "Batiémoko OUATTARA",
    "Gérard YAYI",
    "Abdoulaye OUATTARA",
    "Waliou ADELEKE",
    "Alimta SANGARE",
    "Armand GOULEHI",
]

SUPPORTS = [
    "Rovencia EDI",
    "Melissa KOUGBO",
    "Esaïe KOUAKOU",
    "Marie-claude EZAN",
    "Jean-luc KOFFI",
    "Marthe YAVO",
]

CLIENTS = [
    "Moov Africa Cote d'Ivoire",
    "BOACI",
    "SUCRIVOIRE",
    "PALMCI",
    "SGS",
    "ORANGE",
    "ADVANS CI",
    "APM TERMINALS",
]

TYPES_INTERVENTION = [
    "Installation",
    "Révision",
    "Vérification",
    "Désinstallation",
    "Basculement",
    "Dépannage",
    "Récupération",
]

EQUIPEMENTS = [
    "Balise",
    "Caméra",
    "Clé d'identification",
    "Capteur carburant",
    "Accessoire",
]

# (libellé, ordre d'affichage)
STATUTS = [
    ("Planifiée", 1),
    ("En cours", 2),
    ("Terminée", 3),
    ("Annulée", 4),
    ("Reportée", 5),
]

PRIORITES = [
    ("Haute", 1),
    ("Normale", 2),
    ("Basse", 3),
]


def seed_referentiel(db, model, values, field="nom"):
    for value in values:
        exists = db.query(model).filter(getattr(model, field) == value).first()
        if not exists:
            db.add(model(**{field: value}))
    db.commit()


def seed_statuts_priorites(db, model, values):
    for libelle, ordre in values:
        exists = db.query(model).filter(model.libelle == libelle).first()
        if not exists:
            db.add(model(libelle=libelle, ordre_affichage=ordre))
    db.commit()


def seed_admin(db, email: str, mot_de_passe: str, nom: str = "Administrateur"):
    exists = db.query(User).filter(User.email == email).first()
    if exists:
        print(f"Compte admin {email} déjà existant, ignoré.")
        return
    admin = User(
        nom=nom,
        email=email,
        mot_de_passe_hash=hash_password(mot_de_passe),
        role=RoleEnum.admin,
        actif=True,
    )
    db.add(admin)
    db.commit()
    print(f"Compte admin créé: {email}")


def run():
    db = SessionLocal()
    try:
        seed_referentiel(db, Technicien, TECHNICIENS)
        seed_referentiel(db, Support, SUPPORTS)
        seed_referentiel(db, Client, CLIENTS)
        seed_referentiel(db, TypeIntervention, TYPES_INTERVENTION, field="libelle")
        seed_referentiel(db, Equipement, EQUIPEMENTS, field="libelle")
        seed_statuts_priorites(db, Statut, STATUTS)
        seed_statuts_priorites(db, Priorite, PRIORITES)

        seed_admin(
            db,
            email="timite@comafrique.ci",
            mot_de_passe=settings.seed_admin_password or "ADMIN_PASSWORD_CHANGE_ME",
            nom="TIMITÉ",
        )

        print("Seed terminé avec succès.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
