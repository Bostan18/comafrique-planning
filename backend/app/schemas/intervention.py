from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.referentiels import (
    ClientOut,
    EquipementOut,
    PrioriteOut,
    StatutOut,
    SupportOut,
    TechnicienOut,
    TypeInterventionOut,
)


class InterventionBase(BaseModel):
    date_planification: date
    date_realisation: date | None = None
    technicien_id: int
    support_id: int | None = None
    client_id: int | None = None
    type_intervention_id: int | None = None
    equipement_id: int | None = None
    priorite_id: int | None = None
    statut_id: int
    nb_vehicules: int | None = None
    duree_heures: float | None = None
    commentaires: str | None = None
    preuve_bl_url: str | None = None


class InterventionCreate(InterventionBase):
    pass


class InterventionUpdate(BaseModel):
    date_planification: date | None = None
    date_realisation: date | None = None
    technicien_id: int | None = None
    support_id: int | None = None
    client_id: int | None = None
    type_intervention_id: int | None = None
    equipement_id: int | None = None
    priorite_id: int | None = None
    statut_id: int | None = None
    nb_vehicules: int | None = None
    duree_heures: float | None = None
    commentaires: str | None = None
    preuve_bl_url: str | None = None


class InterventionOut(InterventionBase):
    id: int
    cree_le: datetime
    modifie_le: datetime | None = None

    technicien: TechnicienOut | None = None
    support: SupportOut | None = None
    client: ClientOut | None = None
    type_intervention: TypeInterventionOut | None = None
    equipement: EquipementOut | None = None
    priorite: PrioriteOut | None = None
    statut: StatutOut | None = None

    class Config:
        from_attributes = True
