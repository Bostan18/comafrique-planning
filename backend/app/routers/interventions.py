from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_editeur
from app.models.intervention import Intervention
from app.models.user import User
from app.schemas.intervention import (
    InterventionCreate,
    InterventionOut,
    InterventionUpdate,
)

router = APIRouter(prefix="/interventions", tags=["Interventions"])

_RELATIONS = [
    joinedload(Intervention.technicien),
    joinedload(Intervention.support),
    joinedload(Intervention.client),
    joinedload(Intervention.type_intervention),
    joinedload(Intervention.equipement),
    joinedload(Intervention.priorite),
    joinedload(Intervention.statut),
]


@router.get("/", response_model=list[InterventionOut])
def list_interventions(
    date_debut: date | None = Query(None),
    date_fin: date | None = Query(None),
    technicien_id: int | None = Query(None),
    statut_id: int | None = Query(None),
    client_id: int | None = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Intervention).options(*_RELATIONS)

    if date_debut:
        query = query.filter(Intervention.date_planification >= date_debut)
    if date_fin:
        query = query.filter(Intervention.date_planification <= date_fin)
    if technicien_id:
        query = query.filter(Intervention.technicien_id == technicien_id)
    if statut_id:
        query = query.filter(Intervention.statut_id == statut_id)
    if client_id:
        query = query.filter(Intervention.client_id == client_id)

    return query.order_by(Intervention.date_planification.desc()).all()


@router.get("/{intervention_id}", response_model=InterventionOut)
def get_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    intervention = (
        db.query(Intervention)
        .options(*_RELATIONS)
        .filter(Intervention.id == intervention_id)
        .first()
    )
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    return intervention


@router.post("/", response_model=InterventionOut, status_code=status.HTTP_201_CREATED)
def create_intervention(
    payload: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editeur),
):
    intervention = Intervention(**payload.model_dump(), cree_par_id=current_user.id)
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention


@router.patch("/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: int,
    payload: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editeur),
):
    intervention = (
        db.query(Intervention).filter(Intervention.id == intervention_id).first()
    )
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention introuvable")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(intervention, field, value)
    intervention.modifie_par_id = current_user.id

    db.commit()
    db.refresh(intervention)
    return intervention


@router.delete("/{intervention_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_editeur),
):
    intervention = (
        db.query(Intervention).filter(Intervention.id == intervention_id).first()
    )
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention introuvable")
    db.delete(intervention)
    db.commit()
