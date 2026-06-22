from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)

    date_planification = Column(Date, nullable=False)
    date_realisation = Column(Date, nullable=True)

    technicien_id = Column(Integer, ForeignKey("techniciens.id"), nullable=False)
    support_id = Column(Integer, ForeignKey("supports.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    type_intervention_id = Column(
        Integer, ForeignKey("types_intervention.id"), nullable=True
    )
    equipement_id = Column(Integer, ForeignKey("equipements.id"), nullable=True)
    priorite_id = Column(Integer, ForeignKey("priorites.id"), nullable=True)
    statut_id = Column(Integer, ForeignKey("statuts.id"), nullable=False)

    nb_vehicules = Column(Integer, nullable=True)
    duree_heures = Column(Float, nullable=True)
    commentaires = Column(Text, nullable=True)
    preuve_bl_url = Column(String(500), nullable=True)

    cree_par_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    modifie_le = Column(DateTime(timezone=True), onupdate=func.now())
    modifie_par_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    technicien = relationship("Technicien")
    support = relationship("Support")
    client = relationship("Client")
    type_intervention = relationship("TypeIntervention")
    equipement = relationship("Equipement")
    priorite = relationship("Priorite")
    statut = relationship("Statut")
