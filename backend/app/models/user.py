import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, func

from app.core.database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    editeur = "editeur"
    lecteur = "lecteur"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mot_de_passe_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.lecteur)
    actif = Column(Boolean, default=True, nullable=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
