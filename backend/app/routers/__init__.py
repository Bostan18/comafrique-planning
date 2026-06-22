from app.routers.referentiels import (
    clients_router,
    equipements_router,
    router as referentiels_router,
    supports_router,
    techniciens_router,
    types_router,
)
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.interventions import router as interventions_router
from app.routers.export import router as export_router

__all__ = [
    "auth_router",
    "users_router",
    "interventions_router",
    "referentiels_router",
    "techniciens_router",
    "supports_router",
    "clients_router",
    "types_router",
    "equipements_router",
    "export_router",
]
