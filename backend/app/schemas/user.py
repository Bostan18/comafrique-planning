from pydantic import BaseModel, EmailStr

from app.models.user import RoleEnum


class UserBase(BaseModel):
    nom: str
    email: EmailStr
    role: RoleEnum = RoleEnum.lecteur


class UserCreate(UserBase):
    mot_de_passe: str


class UserUpdate(BaseModel):
    nom: str | None = None
    role: RoleEnum | None = None
    actif: bool | None = None


class UserOut(UserBase):
    id: int
    actif: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str
