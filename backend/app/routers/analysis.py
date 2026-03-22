from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..dependencies import analysis_service, repository
from ..schemas import AnalysisJob, AnalysisJobCreateResponse, AnalysisResult


router = APIRouter(tags=["analysis"])


@router.post("/analysis-jobs", response_model=AnalysisJobCreateResponse)
async def create_analysis_job(
  pieceId: str = Form(...),
  sessionId: str = Form(...),
  audioFile: UploadFile = File(...),
) -> AnalysisJobCreateResponse:
  try:
    payload = await audioFile.read()
    job, result = analysis_service.create_job(pieceId, sessionId, audioFile.filename or "take.webm", payload)
  except ValueError as error:
    raise HTTPException(status_code=400, detail=str(error)) from error

  return AnalysisJobCreateResponse(job=job, result=result)


@router.get("/analysis-jobs/{job_id}", response_model=AnalysisJob)
def get_analysis_job(job_id: str) -> AnalysisJob:
  job = repository.get_analysis_job(job_id)
  if job is None:
    raise HTTPException(status_code=404, detail="Analysis job not found")
  return job


@router.get("/analysis-results/{result_id}", response_model=AnalysisResult)
def get_analysis_result(result_id: str) -> AnalysisResult:
  result = repository.get_analysis_result(result_id)
  if result is None:
    raise HTTPException(status_code=404, detail="Analysis result not found")
  return result

