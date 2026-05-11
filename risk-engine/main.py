from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uvicorn
import pickle
import numpy as np

app = FastAPI(
    title="SmartAuth Risk Engine",
    description="AI-driven login risk scoring for ForgeRock AM 7",
    version="2.0.0"
)

with open("risk_model.pkl", "rb") as f:
    model = pickle.load(f)

class SignalBundle(BaseModel):
    user_id: str
    ip_address: str
    user_agent: str
    device_fingerprint: Optional[str] = None
    login_hour: Optional[int] = 12
    failed_attempts_24h: Optional[int] = 0
    is_new_device: Optional[int] = 0
    is_unusual_country: Optional[int] = 0
    login_day: Optional[int] = 0

class RiskResponse(BaseModel):
    score: float
    action: str
    risk_level: str
    top_factors: list[str]

@app.get("/health")
def health():
    return {"status": "ok", "service": "smartauth-risk-engine", "version": "2.0.0", "model": "XGBoost"}

@app.post("/risk-score", response_model=RiskResponse)
def risk_score(signals: SignalBundle):
    features = np.array([[
        signals.login_hour,
        signals.failed_attempts_24h,
        signals.is_new_device,
        signals.is_unusual_country,
        signals.login_day
    ]])

    prediction = model.predict(features)[0]
    proba = model.predict_proba(features)[0]
    score = round(float(proba[prediction]), 2)

    factors = []
    if signals.failed_attempts_24h > 2:
        factors.append("multiple_failed_attempts")
    if signals.login_hour < 6 or signals.login_hour > 22:
        factors.append("unusual_login_hour")
    if signals.is_new_device:
        factors.append("new_device_detected")
    if signals.is_unusual_country:
        factors.append("unusual_location")

    if prediction == 0:
        action = "allow"
        risk_level = "low"
    elif prediction == 1:
        action = "stepup"
        risk_level = "medium"
    else:
        action = "block"
        risk_level = "high"

    return RiskResponse(
        score=score,
        action=action,
        risk_level=risk_level,
        top_factors=factors
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)