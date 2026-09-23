# ML Service

FastAPI wrapper for a scikit-learn Isolation Forest trained at startup on reproducible synthetic examples.

```bash
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

- `GET /health` confirms the service is running.
- `POST /predict` accepts positive `amount`, non-negative `accountAge`, and non-negative `transactionFrequency`.

The model returns scikit-learn's `1` (normal) or `-1` (anomaly) and a decision score. This educational model is not a fraud verdict. Set `PORT` to the port assigned by your hosting provider.
