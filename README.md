# Fraud & Anomaly Detection Dashboard

A small portfolio project that demonstrates transaction monitoring with a React dashboard, Spring Boot API, MySQL database, and a Python Isolation Forest service. All bundled transactions are synthetic.

> This project demonstrates anomaly detection. It is not a production banking fraud detection system, and a suspicious transaction is not necessarily fraudulent.

## Features

- Dashboard counts, activity chart, and a searchable/filterable transaction table
- Transaction details with a plain-language explanation when a row is flagged
- Add transactions through the dashboard; Spring Boot requests an ML prediction before saving
- Synthetic sample-data generator (250 rows by default)
- Health endpoints and environment-based service URLs

## Technology and architecture

React + Vite + Recharts → Spring Boot REST API → MySQL. For new transactions, Spring Boot calls the FastAPI service, which uses a scikit-learn Isolation Forest and returns a prediction and anomaly score. The browser only calls Spring Boot.

## Project structure

```text
backend/       Spring Boot API, JPA entity, repository, seed generator
ml-service/    FastAPI prediction service and Isolation Forest
frontend/      React dashboard
docker-compose.yml  Local MySQL convenience service
```

## Prerequisites

Java 17+, Maven 3.9+, Python 3.10+, Node.js 22.12+ (or 20.19+) and npm, plus Docker (or a MySQL 8 instance).

## Start locally

1. Start MySQL: `docker compose up -d mysql` (or create a database named `fraud_dashboard`).
2. Start the ML service:

   ```bash
   cd ml-service
   python -m venv .venv
   # Windows: .venv\Scripts\activate  | macOS/Linux: source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app:app --reload --port 8000
   ```

3. Start the API in another terminal:

   ```bash
   cd backend
   # Set DB_URL, DB_USERNAME, DB_PASSWORD, ML_SERVICE_URL, and FRONTEND_ORIGIN if needed.
   # The local defaults are in backend/src/main/resources/application.properties.
   mvn spring-boot:run
   ```

4. Start the web app:

   ```bash
   cd frontend
   npm install
   # Copy .env.example to .env.local if you need to change the API URL.
   npm run dev
   ```

Open http://localhost:5173. The backend creates the `transactions` table and inserts 250 synthetic records when the table is empty. It asks the ML service to score each generated transaction; the UI explains that scores are model signals, not proof of fraud.

## Configuration

| Service | Variable | Local default |
|---|---|---|
| Frontend | `VITE_API_URL` | `http://localhost:8080` |
| Backend | `DB_URL` | `jdbc:mysql://localhost:3306/fraud_dashboard` |
| Backend | `DB_USERNAME` | `fraud_user` |
| Backend | `DB_PASSWORD` | `fraud_pass` |
| Backend | `ML_SERVICE_URL` | `http://localhost:8000` |
| Backend | `FRONTEND_ORIGIN` | `http://localhost:5173` |
| ML service | `PORT` | `8000` |

Production deployments should set each service URL and secret in the host's environment settings. Set `VITE_API_URL` to the deployed Spring Boot URL at frontend build time. Set `ML_SERVICE_URL` to the deployed FastAPI URL and `DB_*` to the managed MySQL connection in Spring Boot. No production URL or credential is bundled here.

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/transactions` | List transactions (newest first) |
| GET | `/api/transactions/{id}` | Get by database ID |
| POST | `/api/transactions` | Predict and save a transaction |
| DELETE | `/api/transactions/{id}` | Delete by database ID |
| GET | `/api/transactions/suspicious` | List suspicious transactions |
| GET | `/api/dashboard/stats` | Dashboard totals and suspicious percentage |
| GET | `/api/dashboard/activity` | Daily counts for charts |
| GET | `/actuator/health` | Backend health |
| POST | `/predict` | ML prediction, called by backend |
| GET | `/health` | ML service health |

Example transaction request:

```json
{"transactionId":"TXN-DEMO-1","amount":8500,"transactionType":"TRANSFER","location":"Chennai","accountAge":24,"transactionFrequency":15}
```

## How the model works

The Python service trains an Isolation Forest on reproducible synthetic baseline examples. It scores only `amount`, `accountAge`, and `transactionFrequency`. Scikit-learn returns `1` for a typical pattern and `-1` for an outlier. The anomaly score is the model's decision function (lower values are more unusual). This is a teaching demo rather than a calibrated fraud model; labels can vary with data and model settings.

## Deployment

Deploy MySQL, FastAPI, Spring Boot, and Vite frontend as separate services. Configure each service's environment variables from the table above. Permit the deployed frontend origin in `FRONTEND_ORIGIN`; the backend uses an explicit origin, not a wildcard. Ensure the hosting provider exposes the configured FastAPI `PORT`. Build the frontend with `VITE_API_URL` set to the public backend URL. The backend's health endpoint is available at `/actuator/health`.

## Screenshots

Add screenshots here after running the app locally.

## How I Explain This Project

“I built a transaction monitoring dashboard to demonstrate how anomaly detection can help review unusual activity. The React page calls a Spring Boot API, and Spring Boot stores transactions in MySQL. When a transaction arrives, the API sends its amount, account age, and transaction frequency to a small Python FastAPI service. That service uses Isolation Forest, an unsupervised model that marks patterns that differ from the sample data. The API saves the prediction and score, and the dashboard shows totals, activity, and transaction details. A suspicious result is only a signal for review; it does not prove fraud. The sample records are synthetic, so this is an educational portfolio project rather than a banking system.”

## Future improvements

- Add automated API and UI tests
- Add user-configurable model thresholds and explainability based on feature baselines
- Add pagination and database migrations for larger datasets
- Add authenticated access if extending beyond a local portfolio demo
