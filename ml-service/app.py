"""HTTP endpoints for the demo anomaly model."""

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from model import predict

app = FastAPI(title="Fraud & Anomaly ML Service", version="1.0.0")


class TransactionFeatures(BaseModel):
    amount: float = Field(gt=0)
    accountAge: int = Field(ge=0)
    transactionFrequency: int = Field(ge=0)


@app.get("/health")
def health():
    return {"status": "ML service is running"}


@app.post("/predict")
def predict_transaction(features: TransactionFeatures):
    try:
        prediction, score = predict(
            features.amount, features.accountAge, features.transactionFrequency
        )
        return {
            "prediction": prediction,
            "status": "NORMAL" if prediction == 1 else "SUSPICIOUS",
            "anomalyScore": round(score, 6),
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail="Prediction could not be created") from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
