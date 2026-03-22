from __future__ import annotations

from fastapi import APIRouter

from ..dependencies import repository
from ..schemas import DashboardData


router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardData)
def get_dashboard() -> DashboardData:
  return repository.build_dashboard()

