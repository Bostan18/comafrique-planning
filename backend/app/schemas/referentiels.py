from pydantic import BaseModel


class RefBase(BaseModel):
    actif: bool = True


class TechnicienCreate(BaseModel):
    nom: str


class TechnicienOut(TechnicienCreate, RefBase):
    id: int

    class Config:
        from_attributes = True


class SupportCreate(BaseModel):
    nom: str


class SupportOut(SupportCreate, RefBase):
    id: int

    class Config:
        from_attributes = True


class ClientCreate(BaseModel):
    nom: str


class ClientOut(ClientCreate, RefBase):
    id: int

    class Config:
        from_attributes = True


class TypeInterventionCreate(BaseModel):
    libelle: str


class TypeInterventionOut(TypeInterventionCreate, RefBase):
    id: int

    class Config:
        from_attributes = True


class EquipementCreate(BaseModel):
    libelle: str


class EquipementOut(EquipementCreate, RefBase):
    id: int

    class Config:
        from_attributes = True


class StatutOut(BaseModel):
    id: int
    libelle: str
    ordre_affichage: int

    class Config:
        from_attributes = True


class PrioriteOut(BaseModel):
    id: int
    libelle: str
    ordre_affichage: int

    class Config:
        from_attributes = True
