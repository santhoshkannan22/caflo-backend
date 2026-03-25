# Caflo Backend

Production-ready Node.js/Express/MongoDB backend for **Caflo**, a coffee shop discovery app for remote workers.

## Features

- JWT authentication (register/login)
- User preferences and saved cafes
- Nearby cafe discovery via Foursquare Places API
- WorkScore calculation (0-10)
- Cafe details and review system
- Recommendation engine (work score + distance + user preference)
- Input validation, auth middleware, and centralized error handling
- Environment variable validation at startup

## Project structure

```txt
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  .env.example
  package.json
  server.js
```

## Quick start

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `.env` values:
   - `MONGO_URI`
   - `FOURSQUARE_API_KEY`
   - `JWT_SECRET`

3. **Run the server**
   ```bash
   npm run dev
   ```
   Or in production mode:
   ```bash
   npm start
   ```

4. **Health check**
   ```bash
   curl http://localhost:5000/health
   ```

## REST API overview

Base URL: `/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Cafes
- `GET /cafes/nearby?latitude=..&longitude=..&radius=..`
- `GET /cafes/:id`
- `POST /cafes/save` (auth)
- `GET /cafes/saved` (auth)

### Reviews
- `POST /reviews` (auth)

### Recommendations
- `GET /recommendations?latitude=..&longitude=..&radius=..&preference=quiet`

## Notes

- `workScore` formula:

  `workScore = (wifiSpeed * 0.35) + (noiseLevelScore * 0.25) + (seatingComfort * 0.20) + (powerOutletScore * 0.20)`

- `noiseLevelScore` is computed as `10 - noiseLevel` because less noise is better for remote work.
- Review submissions auto-refresh cafe metrics and WorkScore.
- Recommendation requests refresh nearby cafes from Foursquare before ranking.
