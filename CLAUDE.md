# Money Balancer

Shared expense tracker for splitting bills among friends in monthly groups. Two-user household app (jonny + lets) tracking who owes whom.

## Tech Stack

- **Backend:** Rust 1.64 + Rocket 0.5.0-rc.2 + SeaORM 0.9 (async)
- **Frontend:** React 18 + TypeScript 4.8 + MUI 5 + React Router 6 + React Hook Form
- **Database:** SQLite (file-based, `/data/money-balancer.sqlite`)
- **Auth:** JWT (HS256, `MONEYBALANCER_JWT_SECRET`) + optional proxy/SSO auth
- **Build:** Multi-stage Docker (Rust alpine build + alpine runtime), frontend embedded in binary via `rust-embed`

## Project Structure

```
src/
  main.rs                    # Rocket launch, DB setup, service wiring
  model/                     # SeaORM entities (user, group, group_member, transaction, debt)
  routes/                    # Rocket handlers (auth, user, group, client, swagger)
  services/                  # Business logic (authentication, configuration, user, group)
  guards/                    # Request guards (JWT auth extraction)
  fairings/                  # Middleware (CORS)
  resources/api/             # OpenAPI spec + Swagger UI

client/src/
  pages/                     # LoginPage, RegistrationPage, GroupListPage, GroupPage, GroupJoinPage, ProxyLoginPage
  components/                # TransactionCard, TransactionCreationDialog, Debts, Header, etc.
  data/Types.tsx             # TypeScript interfaces
  data/MoneyBalancerApi.tsx  # API client (fetch wrapper)
  data/Context.tsx           # React Context (auth state, token storage)

migration/src/               # SeaORM migrations (applied on startup)
```

## Data Model

All monetary amounts are stored as **integers in cents** (divide by 100 for display).

- **User:** id (UUID), username (unique), nickname, password (bcrypt)
- **Group:** id (UUID), name, created_at, updated_at (Unix timestamps)
- **GroupMember:** user_id + group_id (composite PK), is_owner (0/1)
- **Transaction:** id (UUID), group_id (FK, cascade), creditor_id (FK, restrict), timestamp, description
- **Debt:** transaction_id + debtor_id (composite PK), amount (cents), was_split_unequally (0/1)

Debt calculation splits amounts equally with remainder distributed fairly via `was_split_unequally` tracking (see `src/services/group.rs`).

## API Endpoints

All under `/api/v1`, authenticated via `Authorization: Bearer <JWT>`:

- `GET/POST /auth/local` - Login (returns JWT)
- `GET/POST /auth/proxy` - Proxy/SSO login
- `GET /user` - Current user + groups
- `POST /user` - Register
- `POST /group` - Create group
- `GET /group/{id}` - Group details
- `POST /group/{id}/member` - Join group
- `GET /group/{id}/member` - List members
- `GET/POST /group/{id}/transaction` - List/create transactions
- `DELETE /group/{id}/transaction/{txId}` - Delete transaction (creditor only)
- `GET /group/{id}/debt` - Current user's debts in group

Frontend served at `/` (embedded static files in production).

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONEYBALANCER_JWT_SECRET` | Yes | - | JWT signing key |
| `DATABASE_URL` | No | `sqlite:/data/money-balancer.sqlite?mode=rwc` | Database connection |
| `ROCKET_ADDRESS` | No | `0.0.0.0` | Listen address |
| `ROCKET_PORT` | No | `8000` | Listen port |
| `MONEYBALANCER_AUTH_LOCAL_ENABLED` | No | `true` | Enable username/password auth |
| `MONEYBALANCER_AUTH_PROXY_ENABLED` | No | `false` | Enable proxy/SSO auth |
| `MONEYBALANCER_AUTH_PROXY_HEADERS_USERNAME` | No | - | SSO username header |
| `MONEYBALANCER_AUTH_PROXY_HEADERS_NICKNAME` | No | - | SSO nickname header |
| `RUST_LOG` | No | - | Log level (debug/info) |

## Build & Run

```bash
# Development (backend)
cargo build              # debug build
cargo run                # starts on port 8000

# Development (frontend)
cd client && yarn install && yarn start   # dev server on port 3000

# Production Docker
docker compose up -d                      # uses ghcr.io image
docker compose -f docker-compose.dev.yml up -d  # local build

# Tests
cargo test               # backend tests (uses temp SQLite)
cd client && yarn test   # frontend tests
```

## Deployment

Production runs on home server `aquarius` (SSH: `ariedi@aquarius`), managed by Portainer.

```
Push to dev branch -> GitHub Actions builds Docker image -> ghcr.io/joaoariedi/money-balancer:dev -> Portainer pulls + recreates container
```

- **Container:** `money-balance-money-balancer-1`
- **Port mapping:** `8777 -> 8000`
- **Compose file:** `/data/compose/8/docker-compose.yml` (on aquarius, managed by Portainer)
- **Database volume:** persistent at `/data/money-balancer.sqlite` inside container
- **Direct DB access:** `ssh ariedi@aquarius "docker exec money-balance-money-balancer-1 sqlite3 /data/money-balancer.sqlite '<query>'"`

## NEVER

- Modify migration files that have already shipped (all current ones are shipped)
- Hardcode secrets or credentials in code
- Change the `/data` volume mount path (production database lives there)
- Use `docker compose` version declaration (deprecated)
- Run destructive git commands without explicit user request
