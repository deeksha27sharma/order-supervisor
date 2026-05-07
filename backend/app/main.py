from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import runs, supervisors
from app.database import create_all_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup if they don't exist
    create_all_tables()
    yield


app = FastAPI(
    title="Order Supervisor API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(supervisors.router)
app.include_router(runs.router)


@app.get("/health")
def health():
    return {"status": "ok"}