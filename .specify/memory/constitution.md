# Project Constitution
<!-- Version: 1.0.0 | Date: 2026-04-06 -->
<!-- Updated by /speckit.constitution -->

## Principles

1. **SQLite-only persistence** — All data stored in a single SQLite file. Monetary amounts stored as integers in cents (divide by 100 for display). No external database services.
2. **Docker-first deployment** — All deployments via Docker image pushed to GHCR. The `/data` volume mount is the only persistent state. Container managed by Portainer on the home server.

## Tech Stack
- Language: Rust 1.64 (Edition 2021)
- Backend framework: Rocket 0.5.0-rc.2 (async)
- ORM: SeaORM 0.9 (SQLite driver, async-std runtime)
- Frontend: React 18 + TypeScript 4.8 + MUI 5
- Build: Craco (CRA + SWC)
- Auth: JWT (HS256 via jsonwebtoken crate)
- Passwords: bcrypt (pwhash crate)
- Embedding: rust-embed (frontend compiled into binary)
- Container: Multi-stage Docker (rust:1.64-alpine build, alpine:3.16 runtime)
- CI/CD: GitHub Actions -> GHCR -> Portainer (aquarius server)

## Architecture Constraints
- Monolith: single Rust binary serves both API and frontend
- API routes under `/api/v1`, frontend served at `/`
- Service layer pattern: routes -> services -> SeaORM models
- Migrations applied on startup; never modify shipped migrations
- Database file at `/data/money-balancer.sqlite` inside container volume

## References
- Project context: `CLAUDE.md`
- Deployment details: `docker-compose.yml`, `Dockerfile`
- API spec: `src/resources/api/openapi.yaml`
