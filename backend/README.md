# Spring Boot API

This service stores transactions in MySQL and asks the ML service to score each new row before it is saved.

## Run

Requires Java 17+, Maven, MySQL, and the FastAPI service. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `ML_SERVICE_URL`, and `FRONTEND_ORIGIN` as needed; local defaults are in `src/main/resources/application.properties`.

```bash
mvn spring-boot:run
```

The API listens on port 8080 by default. It creates the table with JPA and adds synthetic sample rows when the table is empty. Sample seeding uses the same prediction service as user-submitted transactions.

See the root README for API routes, request examples, deployment settings, and the overall data flow.
