from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    auth_router,
    clients_router,
    equipements_router,
    export_router,
    interventions_router,
    referentiels_router,
    supports_router,
    techniciens_router,
    types_router,
    users_router,
)

app = FastAPI(
    title="API Planning Interventions Comafrique",
    description="API de gestion collaborative du planning des interventions terrain",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(interventions_router)
app.include_router(referentiels_router)
app.include_router(techniciens_router, prefix="/referentiels")
app.include_router(supports_router, prefix="/referentiels")
app.include_router(clients_router, prefix="/referentiels")
app.include_router(types_router, prefix="/referentiels")
app.include_router(equipements_router, prefix="/referentiels")
app.include_router(export_router)


@app.get("/", tags=["Santé"])
def health_check():
    return {"status": "ok", "service": "comafrique-planning-api"}
