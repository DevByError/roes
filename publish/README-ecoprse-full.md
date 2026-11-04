# ROES

ROES (Royal Organizing Ecosystem) is a city-management platform. It connects three levels of a city's community in one system: the mayor, the admins who manage each building or public place, and the residents.

This repository holds the back end (REST API) and the mayor website.

## Features

- Mayor website: city dashboard, new-user analysis with CSV export, admin and user management, places on a city map, announcements, safety policies, donation campaigns, and an inbox for public complaints.
- Role-based access: the mayor sees the whole city, each admin manages one place, and residents see their own residence and public information.
- Two kinds of places: residential (with registered residents) and non-residential (stations, malls, parks).
- Complaints with a status timeline, house rules, notices and neighbour reports with message moderation.
- Email verification and password reset over SMTP.

## Architecture

```
Mayor website (Next.js)  ---\
                              >-- REST API (Hono on Bun) --> MySQL (Sequelize)
Mobile app (Expo)        ---/
```

The mobile app for admins and residents is a separate project. It uses the same API under `/api/app/*`.

## Tech stack

| Part      | Stack                                                         |
|-----------|---------------------------------------------------------------|
| Back end  | Bun, TypeScript, Hono, Sequelize, MySQL, Zod, Nodemailer      |
| Website   | Next.js, React, Tailwind CSS, Radix UI, Recharts, Leaflet, Zustand |
| Deploy    | Docker, Render (`render.yaml`)                                |

## Requirements

- Bun 1.x
- Node.js 20 or later and npm
- MySQL 8

## Installation

Back end:

```bash
cd be
cp .env.example .env        # then fill in your values
bun install
bun run dev
```

Create the database first:

```sql
CREATE DATABASE roes CHARACTER SET utf8mb4;
```

Tables are created on start when `DB_SYNC=true`. The mayor account is created on first start from the `MAYOR_*` variables.

Website:

```bash
cd fe
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and sign in with `MAYOR_EMAIL` / `MAYOR_PASSWORD`.

## Configuration

Back end (`be/.env`):

| Variable | Purpose |
|----------|---------|
| `NODE_ENV`, `PORT` | Runtime mode and port (default 4000) |
| `CORS_ORIGINS` | Allowed origins, comma separated |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL connection |
| `DB_SSL`, `DB_SYNC`, `DB_LOG` | TLS to the database, auto-create tables, SQL logging |
| `JWT_SECRET`, `JWT_EXPIRES_DAYS` | Token signing secret (32+ characters) and lifetime |
| `MAYOR_NAME`, `MAYOR_EMAIL`, `MAYOR_PASSWORD`, `MAYOR_PHONE`, `MAYOR_OFFICE`, `MAYOR_CITY` | Initial mayor account |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Outgoing email. Without SMTP in development, messages are printed to the console |
| `CITY_NAME`, `CITY_COUNTRY`, `CITY_LAT`, `CITY_LNG`, `CITY_POPULATION`, `CITY_AREA_KM2`, `CITY_DISTRICTS` | City details shown on the dashboard and map |

Website (`fe/.env.local`):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Back end URL, e.g. `http://localhost:4000` |

Never commit `.env` files. Use `.env.example` as the template.

## Usage

- The mayor signs in on the website and creates places and admins.
- Admins and residents use the mobile app. Residents register there and verify their email.

API overview:

- `POST /api/auth/login | code | code/verify | register | reset | password`, `GET /api/auth/places`
- `/api/mayor/*` for the mayor website (mayor role required)
- `/api/app/*` for the mobile app
- `GET /api/media/users/:id`, `GET /api/media/donations/:id`
- `GET /api/health`

## Testing

```bash
cd be
bun test
```

The integration tests use the `TEST_DB_*` settings (default `127.0.0.1:3307`, database `roes_test`). That database is wiped on each run.

## Deployment

`render.yaml` deploys the back end to Render as a Docker web service from `be/Dockerfile`, with a health check on `/api/health`. Set the database, mayor, SMTP and `CORS_ORIGINS` values in the Render dashboard. The website can be deployed to any Next.js host with `NEXT_PUBLIC_API_URL` pointing at the API.

## Project structure

```
be/            Back end
  src/         App, auth, models, mailer, moderation, routes
  tests/       Integration tests
  Dockerfile
fe/            Mayor website
  src/app/     Pages (login, mayor dashboard)
  src/components/
  src/lib/, src/store/
render.yaml    Render deploy config
```
