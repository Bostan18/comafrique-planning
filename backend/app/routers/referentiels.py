from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.referentiels import (
    Client,
    Equipement,
    Priorite,
    Statut,
    Support,
    Technicien,
    TypeIntervention,
)
from app.schemas.referentiels import (
    ClientCreate,
    ClientOut,
    EquipementCreate,
    EquipementOut,
    PrioriteOut,
    StatutOut,
    SupportCreate,
    SupportOut,
    TechnicienCreate,
    TechnicienOut,
    TypeInterventionCreate,
    TypeInterventionOut,
)

router = APIRouter(prefix="/referentiels", tags=["Référentiels"])


def _build_crud(
    sub_router: APIRouter,
    model,
    schema_create,
    schema_out,
    name_field: str,
):
    @sub_router.get("/", response_model=list[schema_out])
    def list_items(
        db: Session = Depends(get_db), _=Depends(get_current_user)
    ):
        return db.query(model).filter(model.actif == True).order_by(  # noqa: E712
            getattr(model, name_field)
        ).all()

    @sub_router.post(
        "/",
        response_model=schema_out,
        status_code=status.HTTP_201_CREATED,
        dependencies=[Depends(require_admin)],
    )
    def create_item(payload: schema_create, db: Session = Depends(get_db)):
        item = model(**payload.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @sub_router.patch(
        "/{item_id}/desactiver",
        response_model=schema_out,
        dependencies=[Depends(require_admin)],
    )
    def deactivate_item(item_id: int, db: Session = Depends(get_db)):
        item = db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Élément introuvable")
        item.actif = False
        db.commit()
        db.refresh(item)
        return item


techniciens_router = APIRouter(prefix="/techniciens", tags=["Référentiels"])
_build_crud(techniciens_router, Technicien, TechnicienCreate, TechnicienOut, "nom")

supports_router = APIRouter(prefix="/supports", tags=["Référentiels"])
_build_crud(supports_router, Support, SupportCreate, SupportOut, "nom")

clients_router = APIRouter(prefix="/clients", tags=["Référentiels"])
_build_crud(clients_router, Client, ClientCreate, ClientOut, "nom")

types_router = APIRouter(prefix="/types-intervention", tags=["Référentiels"])
_build_crud(
    types_router, TypeIntervention, TypeInterventionCreate, TypeInterventionOut, "libelle"
)

equipements_router = APIRouter(prefix="/equipements", tags=["Référentiels"])
_build_crud(equipements_router, Equipement, EquipementCreate, EquipementOut, "libelle")


@router.get("/statuts", response_model=list[StatutOut])
def list_statuts(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Statut).order_by(Statut.ordre_affichage).all()


@router.get("/priorites", response_model=list[PrioriteOut])
def list_priorites(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Priorite).order_by(Priorite.ordre_affichage).all()
