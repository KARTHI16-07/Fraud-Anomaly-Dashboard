# React Dashboard

The Vite app calls the Spring Boot API through the centralized functions in `src/services/api.js`.

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` when changing the API address. For a hosted build, set `VITE_API_URL` to the public Spring Boot URL before running `npm run build`.

See the root README for the complete local setup and deployment steps.
