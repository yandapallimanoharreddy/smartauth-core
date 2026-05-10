from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(
    title="SmartAuth Risk Engine",
    description="AI-driven login risk scoring for ForgeRock AM 7",
    version="0.1.0"
)

class SignalBundle(BaseModel):
    user_id: str
    ip_address: str
    user_agent: str
    device_fingerprint: Optional[str] = None
    login_hour: Optional[int] = None
    country_code: Optional[str] = None
    typing_speed_wpm: Optional[float] = None
    failed_attempts_24h: Optional[int] = 0

class RiskResponse(BaseModel):
    score: float          # 0.0 (no risk) to 1.0 (high risk)
    action: str           # "allow", "stepup", "block"
    top_factors: list[str]

@app.get("/health")
def health():
    return {"status": "ok", "service": "smartauth-risk-engine"}

@app.post("/risk-score", response_model=RiskResponse)
def risk_score(signals: SignalBundle):
    # Placeholder logic — ML model replaces this in Phase 2
    score = 0.1
    factors = []

    if signals.failed_attempts_24h and signals.failed_attempts_24h > 2:
        score += 0.4
        factors.append("multiple_failed_attempts")

    if signals.login_hour is not None:
        if signals.login_hour < 6 or signals.login_hour > 23:
            score += 0.2
            factors.append("unusual_login_hour")

    score = min(score, 1.0)

    if score < 0.3:
        action = "allow"
    elif score < 0.7:
        action = "stepup"
    else:
        action = "block"

    return RiskResponse(score=round(score, 2), action=action, top_factors=factors)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)