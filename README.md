<p align="center">
  <img src="docs/ns-tuning-black-yellow.png" alt="NS Tuning" width="440">
</p>

# nstuning-app

Website for NS Tuning, backed by
[nstuning-api](https://github.com/sondresjolyst/nstuning-api). Live at
[nstuning.no](https://www.nstuning.no).

## Stack

Next.js 16 App Router, TypeScript, Tailwind CSS 4, next-auth, Axios, Vitest.

## Quick start

```bash
npm ci
cp .env.example .env
npm run dev
```

nstuning-api must be running and reachable at `NEXT_PUBLIC_API_URL`.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serves the production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Environment

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the API, for example `http://localhost:7297/api` |
| `NEXTAUTH_URL` | URL of this app |
| `NEXTAUTH_SECRET` | next-auth session secret |
| `NSTUNING_API_JWT_SECRET` | Must match the API's `Jwt__Key` |

## Content

| Area | Holds |
| --- | --- |
| Home | Marketing sections (hero, stats, images, calls to action), edited from the admin console |
| Dyno runs | Documented runs with figures and a downloadable PDF report |
| Contact | Enquiry form that emails NS Tuning |
| Accounts | Register, sign in, profile, password reset |
| Admin | Homepage sections, dyno runs, vehicle catalog (brand, model, variant, engine), branding, settings, users |

Public pages are server rendered. Admin changes revalidate the affected pages on
save.

## Layout

```
src/
├── app/          # routes: public pages, (auth), (protected)/admin, api
├── components/   # shared UI
├── services/     # API clients, one per domain
├── lib/          # company info, fetch wrappers, cache tags
└── types/        # shared types
```

## Deployment

Image [`sondresjo/nstuning-app`](https://hub.docker.com/r/sondresjo/nstuning-app)
on Docker Hub, chart `nstuning-app` in
[tumogroup-charts](https://github.com/sondresjolyst/tumogroup-charts), applied by
Flux from [tumo-flux](https://github.com/sondresjolyst/tumo-flux) to
`nstuning-dev` and `nstuning-prod`.

The container runs as the non-root `node` user with a read-only root filesystem,
so anything written at runtime needs a volume. The incremental cache is kept in
memory for that reason.

A push to `main` builds the `dev` tag. A release-please release builds `vX.Y.Z`,
tags it `latest` and opens a chart bump against
[tumogroup-charts](https://github.com/sondresjolyst/tumogroup-charts). Cluster
secrets are created by
[`scripts/nstuning/bootstrap.sh`](https://github.com/sondresjolyst/tumo-platform/blob/main/scripts/nstuning/bootstrap.sh)
in [tumo-platform](https://github.com/sondresjolyst/tumo-platform).

## License

Proprietary. Copyright (c) 2026 Sondre Sjølyst.
