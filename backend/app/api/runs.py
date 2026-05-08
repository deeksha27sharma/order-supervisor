from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from temporalio.service import RPCError

from app.database import get_db
from app.schemas.activity import ActivityResponse
from app.schemas.run import EventInject, InstructionAdd, RunCreate, RunResponse
from app.services.run_service import (
    create_run,
    get_run,
    get_run_activities,
    list_runs,
)
from app.services.supervisor_service import get_supervisor
from app.temporal.client import get_temporal_client
from app.temporal.workflows.order_supervisor import OrderSupervisorWorkflow

router = APIRouter(prefix="/api/runs", tags=["runs"])


@router.post("", response_model=RunResponse, status_code=201)
async def start_run(data: RunCreate, db: Session = Depends(get_db)):
    supervisor = get_supervisor(db, data.supervisor_id)
    if not supervisor:
        raise HTTPException(status_code=404, detail="Supervisor not found")

    run = create_run(db, data)

    supervisor_config = {
        "id": supervisor.id,
        "name": supervisor.name,
        "base_instruction": supervisor.base_instruction,
        "available_actions": supervisor.available_actions,
        "wakeup_interval_seconds": supervisor.wakeup_interval_seconds,
        "wakeup_aggressiveness": supervisor.wakeup_aggressiveness,
        "model": supervisor.model,
    }

    client = await get_temporal_client()
    workflow_id = f"order-supervisor-{run.id}"

    handle = await client.start_workflow(
        OrderSupervisorWorkflow.run,
        args=[run.id, data.order_context, supervisor_config],
        id=workflow_id,
        task_queue="order-supervisor",
    )

    run.temporal_workflow_id = workflow_id
    run.temporal_run_id = handle.result_run_id
    run.status = "running"
    db.commit()
    db.refresh(run)

    return run


@router.get("", response_model=list[RunResponse])
def list_all(db: Session = Depends(get_db)):
    return list_runs(db)


@router.get("/{run_id}", response_model=RunResponse)
def get_one(run_id: str, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.get("/{run_id}/activities", response_model=list[ActivityResponse])
def get_activities(run_id: str, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return get_run_activities(db, run_id)


@router.post("/{run_id}/events", status_code=200)
async def inject_event(run_id: str, data: EventInject, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if not run.temporal_workflow_id:
        raise HTTPException(status_code=400, detail="Workflow not started")

    try:
        client = await get_temporal_client()
        handle = client.get_workflow_handle(run.temporal_workflow_id)
        await handle.signal(OrderSupervisorWorkflow.order_event, args=[data.event_type, data.payload])
    except RPCError as e:
        if "already completed" in str(e) or "not found" in str(e).lower():
            raise HTTPException(status_code=400, detail="Run has already ended — events cannot be injected.")
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "event sent", "event_type": data.event_type}


@router.post("/{run_id}/instructions", status_code=200)
async def add_instruction(
    run_id: str, data: InstructionAdd, db: Session = Depends(get_db)
):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if not run.temporal_workflow_id:
        raise HTTPException(status_code=400, detail="Workflow not started")

    try:
        client = await get_temporal_client()
        handle = client.get_workflow_handle(run.temporal_workflow_id)
        await handle.signal(OrderSupervisorWorkflow.add_instruction, data.instruction)
    except RPCError as e:
        if "already completed" in str(e) or "not found" in str(e).lower():
            raise HTTPException(status_code=400, detail="Run has already ended — instructions cannot be added.")
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "instruction added"}


@router.post("/{run_id}/interrupt", status_code=200)
async def interrupt_run(run_id: str, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    try:
        client = await get_temporal_client()
        handle = client.get_workflow_handle(run.temporal_workflow_id)
        await handle.signal(OrderSupervisorWorkflow.interrupt)
    except RPCError as e:
        if "already completed" in str(e) or "not found" in str(e).lower():
            run.status = "terminated"
            db.commit()
            return {"status": "already ended — DB synced"}
        raise HTTPException(status_code=500, detail=str(e))

    run.status = "interrupted"
    db.commit()

    return {"status": "interrupted"}


@router.post("/{run_id}/resume", status_code=200)
async def resume_run(run_id: str, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    try:
        client = await get_temporal_client()
        handle = client.get_workflow_handle(run.temporal_workflow_id)
        await handle.signal(OrderSupervisorWorkflow.resume)
    except RPCError as e:
        if "already completed" in str(e) or "not found" in str(e).lower():
            run.status = "terminated"
            db.commit()
            return {"status": "already ended — DB synced"}
        raise HTTPException(status_code=500, detail=str(e))

    run.status = "running"
    db.commit()

    return {"status": "resumed"}


@router.post("/{run_id}/terminate", status_code=200)
async def terminate_run(run_id: str, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    try:
        client = await get_temporal_client()
        handle = client.get_workflow_handle(run.temporal_workflow_id)
        await handle.signal(OrderSupervisorWorkflow.terminate)
    except RPCError as e:
        if "already completed" in str(e) or "not found" in str(e).lower():
            pass  # Workflow already done, sync DB below
        else:
            raise HTTPException(status_code=500, detail=str(e))

    run.status = "terminated"
    db.commit()

    return {"status": "terminated"}

@router.delete("/{run_id}", status_code=200)
def delete_run(run_id: str, db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    db.delete(run)
    db.commit()
    return {"message": "Run deleted successfully"}