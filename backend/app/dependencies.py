from __future__ import annotations

from .repository import InMemoryRepository
from .services.analysis import AnalysisService
from .services.score_ingestion import ScoreIngestionService
from .storage import LocalStorageGateway


repository = InMemoryRepository()
storage = LocalStorageGateway()
score_ingestion_service = ScoreIngestionService(repository, storage)
analysis_service = AnalysisService(repository, storage)

