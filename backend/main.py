from fastapi import FastAPI
from app.db.session import Base, engine
from app.api import auth , medicine
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediScan API")
origins = settings.FRONTEND_URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["http://localhost:5173"] for stricter
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(medicine.router)