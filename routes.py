import uuid
from fastapi import APIRouter, HTTPException

from ai_service import AIServiceError, chat_completion
from models import (
    DiffAnalyzeRequest,
    DiffAnalyzeResponse,
    RankedCandidate,
    RerankRequest,
    RerankResponse,
    ReviewSuggestion,
)

router = APIRouter(prefix="/api/v1")


@router.post("/ai/diff-analyze", response_model=DiffAnalyzeResponse)
async def ai_diff_analyze(payload: DiffAnalyzeRequest):
    system_prompt = (
        "You are ReviewMate AI, a senior code reviewer focused on bugs, security, and performance. "
        "Return strict JSON with key 'suggestions' as an array."
    )

    user_prompt = f"""
Analyze this pull request diff and produce high-signal suggestions.
Repository: {payload.owner}/{payload.repo}
PR: {payload.pr_number}
Head SHA: {payload.head_sha}
Mode: {payload.repo_config.mode}
Confidence threshold: {payload.repo_config.confidence_threshold}
Enabled categories: bug={payload.repo_config.enable_bug}, security={payload.repo_config.enable_security}, performance={payload.repo_config.enable_performance}

Diff:
{payload.diff}

Output JSON schema:
{{
  "suggestions": [
    {{
      "issue_type": "bug|security|performance",
      "title": "string",
      "explanation": "string",
      "risk_level": "low|med|high",
      "confidence": 0.0,
      "file_path": "string",
      "line_start": 1,
      "line_end": 1,
      "suggested_patch": "string or null",
      "safe_to_autopatch": false,
      "evidence": ["rule or rationale"]
    }}
  ]
}}
"""

    try:
        result = await chat_completion(system_prompt, user_prompt, temperature=0.1)
        raw_suggestions = result.get("suggestions", [])
        suggestions = [ReviewSuggestion(**s) for s in raw_suggestions]
        filtered = [s for s in suggestions if s.confidence >= payload.repo_config.confidence_threshold]

        return DiffAnalyzeResponse(
            analysis_id=str(uuid.uuid4()),
            suggestions=filtered,
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid AI output: {exc}")


@router.post("/ai/rerank-suggestions", response_model=RerankResponse)
async def ai_rerank_suggestions(payload: RerankRequest):
    system_prompt = (
        "You are ReviewMate AI ranking engine. "
        "Rank suggestions for developer usefulness based on confidence, category priority, and likely acceptance. "
        "Return strict JSON with key 'ranked'."
    )

    user_prompt = f"""
Repo: {payload.owner}/{payload.repo}
Feedback window days: {payload.feedback_window_days}
Prefer security: {payload.prefer_security}

Candidates:
{payload.candidates}

Return JSON format:
{{
  "ranked": [
    {{
      "candidate_id": "string",
      "rank": 1,
      "score": 0.0,
      "reason": "string"
    }}
  ]
}}
"""

    try:
        result = await chat_completion(system_prompt, user_prompt, temperature=0.0)
        ranked_raw = result.get("ranked", [])
        ranked = [RankedCandidate(**r) for r in ranked_raw]

        ranked_sorted = sorted(ranked, key=lambda x: x.rank)
        return RerankResponse(ranked=ranked_sorted)
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid AI output: {exc}")
