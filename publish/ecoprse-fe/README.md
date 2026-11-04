# ROES Mayor Website

The web dashboard for the mayor in ROES (Royal Organizing Ecosystem), a city-management platform for mayors, place admins and residents.

The website talks to the ROES back end through `NEXT_PUBLIC_API_URL`. The back end is in a separate repository: [ecoprse-full](https://github.com/DevByError/ecoprse-full).

## Features

- Sign-in for the mayor, with password reset.
- Dashboard: total users, new users this month, active admins, open complaints, resident growth chart, activity feed and donation summary.
- New users: growth by month or year, breakdown by residence, table and CSV export.
- Admins: create admins, promote existing users, change an admin's place, freeze or reactivate.
- Users: city-wide list with search and filters. Personal details are read-only.
- Places: interactive city map and a management view, with resident and visitor rules for each place.
- Announcements, safety policies and donation campaigns.
- Public complaints inbox with replies and status updates.
- Light and dark themes.

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, Radix UI, React Hook Form with Zod, Recharts, Leaflet / React Leaflet, Zustand.

## Requirements

- Node.js 20 or later and npm
- A running ROES back end

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and sign in with the mayor account set up in the back end (`MAYOR_EMAIL` / `MAYOR_PASSWORD`).

## Configuration

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Back end URL, e.g. `http://localhost:4000` |

Never commit `.env.local`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  app/          Pages: login and the mayor area
  components/   UI by feature: admins, charts, complaints, donations, map, places, profile, users
  lib/          API client and helpers
  store/        Client state (Zustand)
public/         Static files
```
