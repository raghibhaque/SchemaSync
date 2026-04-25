"""
Pipeline service — async job runner for reconciliation tasks.
"""

import asyncio
from dataclasses import dataclass, field
from enum import Enum
from functools import partial
from typing import Optional
import uuid

from backend.core.ir.models import Schema
from backend.core.reconciliation.engine import ReconciliationEngine

_engine = ReconciliationEngine()


class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    ERROR = "error"


@dataclass
class Job:
    id: str = ""
    status: JobStatus = JobStatus.PENDING
    progress: float = 0.0
    step: str = "pending"
    result: Optional[dict] = None
    error: Optional[str] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())[:8]

    def to_dict(self) -> dict:
        return {
            "job_id": self.id,
            "status": self.status.value,
            "progress": self.progress,
            "step": self.step,
            "result": self.result,
            "error": self.error,
        }


_jobs: dict[str, Job] = {}


def create_job() -> Job:
    job = Job()
    _jobs[job.id] = job
    return job


def get_job(job_id: str) -> Optional[Job]:
    return _jobs.get(job_id)


def update_job(job_id: str, **kwargs) -> None:
    job = _jobs.get(job_id)
    if job:
        for k, v in kwargs.items():
            setattr(job, k, v)


async def run_reconciliation_job(job_id: str, source: Schema, target: Schema) -> None:
    loop = asyncio.get_event_loop()

    def _on_progress(progress: float, step: str) -> None:
        update_job(job_id, progress=progress, step=step)

    update_job(job_id, status=JobStatus.RUNNING, step="starting", progress=0.0)
    try:
        result = await loop.run_in_executor(
            None,
            partial(_engine.reconcile, source, target, on_progress=_on_progress),
        )
        update_job(
            job_id,
            status=JobStatus.COMPLETE,
            step="complete",
            progress=1.0,
            result=result.to_dict(),
        )
    except Exception as exc:
        update_job(job_id, status=JobStatus.ERROR, step="error", error=str(exc))
