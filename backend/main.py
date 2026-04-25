"""
SchemaSync Backend — FastAPI application.

Run with: uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import upload, reconcile, export
from backend.config import CORS_ORIGINS, DEBUG

app = FastAPI(
    title="SchemaSync",
    description="Zero-Config Cross-Product Data Model Reconciliation",
    version="0.1.0",
    debug=DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(reconcile.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/")
async def root():
    return {"message": "SchemaSync API", "docs": "/docs"}