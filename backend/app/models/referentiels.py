from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Technicien(Base):
    __tablename__ = "techniciens"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False, unique=True)
    actif = Column(Boolean, default=True, nullable=False)


class Support(Base):
    __tablename__ = "supports"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False, unique=True)
    actif = Column(Boolean, default=True, nullable=False)


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False, unique=True)
    actif = Column(Boolean, default=True, nullable=False)


class TypeIntervention(Base):
    __tablename__ = "types_intervention"

    id = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(150), nullable=False, unique=True)
    actif = Column(Boolean, default=True, nullable=False)


class Equipement(Base):
    __tablename__ = "equipements"

    id = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(150), nullable=False, unique=True)
    actif = Column(Boolean, default=True, nullable=False)


class Statut(Base):
    __tablename__ = "statuts"

    id = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(50), nullable=False, unique=True)
    ordre_affichage = Column(Integer, default=0)


class Priorite(Base):
    __tablename__ = "priorites"

    id = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(50), nullable=False, unique=True)
    ordre_affichage = Column(Integer, default=0)
