# nstuning-app

## Run locally

```bash
npm install
cp .env.example .env   # set NEXTAUTH_SECRET and NSTUNING_API_JWT_SECRET (= API Jwt__Key)
npm run dev            # http://localhost:3000
```

The API must be running and reachable at `NEXT_PUBLIC_API_URL`.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build
- `npm run lint` — ESLint
- `npm test` — Vitest
