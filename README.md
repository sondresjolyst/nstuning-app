<p align="center">
  <img src="docs/ns-tuning-black-yellow.png" alt="NS Tuning" width="440">
</p>

<p align="center">
  The NS Tuning website — dyno results, documented, with an admin console to run the whole site.
</p>

---

nstuning-app is the public website for **NS Tuning** — dyno and performance
tuning. It shows documented dyno runs (with downloadable PDF reports), takes
enquiries, and includes an admin console for managing the site's content.
Backed by [nstuning-api](https://github.com/sondresjolyst/nstuning-api).

Live at **[nstuning.no](https://www.nstuning.no)**.

## What's on the site

- **Home** — a marketing page built from composable sections (hero, stats,
  images, calls to action) edited live from the admin console.
- **Dyno runs** — a showcase of documented runs, each with figures and a
  downloadable PDF report.
- **Contact** — an enquiry form that emails NS Tuning.
- **Accounts** — register, sign in, a self-serve profile, and password reset.
- **Admin console** — edit the homepage, manage dyno runs, the vehicle catalog
  (brand → model → variant → engine), branding (logo/icon), settings, and users.

The public pages are server-rendered for speed and SEO; admin changes show up
immediately.

---

## For developers

<details>
<summary>Run, build, and test from source</summary>

### Stack

Next.js (App Router) · TypeScript · Tailwind CSS · next-auth · Axios · Vitest.

### Run locally

```bash
npm install
cp .env.example .env   # set NEXTAUTH_SECRET and NSTUNING_API_JWT_SECRET (= the API's Jwt__Key)
npm run dev            # http://localhost:3000
```

[nstuning-api](https://github.com/sondresjolyst/nstuning-api) must be running and
reachable at `NEXT_PUBLIC_API_URL`.

### Environment

| Variable                  | What it's for                                           |
| ------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`     | Base URL of the API (e.g. `http://localhost:7297/api`). |
| `NEXTAUTH_URL`            | This app's URL (e.g. `http://localhost:3000`).          |
| `NEXTAUTH_SECRET`         | next-auth session secret.                               |
| `NSTUNING_API_JWT_SECRET` | Must match the API's `Jwt__Key` (verifies its tokens).  |

### Scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm start       # serve the production build
npm run lint    # ESLint
npm test        # Vitest
```

### Layout

```
src/
├── app/          # routes — public pages, (auth), (protected)/admin, api routes
├── components/   # shared UI
├── services/     # API clients (one per domain)
├── lib/          # helpers (company info, fetch wrappers, cache tags)
└── types/        # shared types
```

</details>
