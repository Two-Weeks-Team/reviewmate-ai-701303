from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class RepoConfig(BaseModel):
    mode: Literal["conservative", "balanced", "aggressive"] = "conservative"
    confidence_threshold: float = Field(default=0.8, ge=0.0, le=1.0)
    enable_bug: bool = True
    enable_security: bool = True
    enable_performance: bool = True


class DiffAnalyzeRequest(BaseModel):
    owner: str
    repo: str
    pr_number: int
    head_sha: str
    diff: str = Field(..., min_length=1)
    repo_config: RepoConfig


class ReviewSuggestion(BaseModel):
    issue_type: Literal["bug", "security", "performance"]
    title: str
    explanation: str
    risk_level: Literal["low", "med", "high"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    file_path: str
    line_start: int
    line_end: int
    suggested_patch: Optional[str] = None
    safe_to_autopatch: bool = False
    evidence: List[str] = []


class DiffAnalyzeResponse(BaseModel):
    analysis_id: str
    suggestions: List[ReviewSuggestion]


class CandidateSuggestion(BaseModel):
    candidate_id: str
    category: Literal["bug", "security", "performance", "style", "maintainability"]
    title: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    fingerprint: str
    message_md: str


class RerankRequest(BaseModel):
    owner: str
    repo: str
    candidates: List[CandidateSuggestion] = Field(..., min_length=1, max_length=200)
    feedback_window_days: int = Field(default=90, ge=7, le=365)
    prefer_security: bool = True


class RankedCandidate(BaseModel):
    candidate_id: str
    rank: int
    score: float
    reason: str


class RerankResponse(BaseModel):
    ranked: List[RankedCandidate]
