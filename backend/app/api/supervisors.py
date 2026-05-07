from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.supervisor import SupervisorCreate, SupervisorResponse
from app.services.supervisor_service import (
    create_supervisor,
    get_supervisor,
    list_supervisors,
)

router = APIRouter(prefix="/api/supervisors", tags=["supervisors"])


@router.post("", response_model=SupervisorResponse, status_code=201)
def create(data: SupervisorCreate, db: Session = Depends(get_db)):
    return create_supervisor(db, data)


@router.get("", response_model=list[SupervisorResponse])
def list_all(db: Session = Depends(get_db)):
    return list_supervisors(db)


@router.get("/{supervisor_id}", response_model=SupervisorResponse)
def get_one(supervisor_id: str, db: Session = Depends(get_db)):
    supervisor = get_supervisor(db, supervisor_id)
    if not supervisor:
        raise HTTPException(status_code=404, detail="Supervisor not found")
    return supervisor