# Douro development

The long-lived `douro` branch is based on the production revision and contains the Douro branding and composer changes as normal source. Neither local development nor `Dockerfile.douro` uses post-build `.next` rewriting.

## First start

Requirements: Node.js 22, Corepack, Docker, and Docker Compose.

```bash
git switch douro
corepack enable
corepack prepare pnpm@10.6.1 --activate
cp .env.example .env
# Replace JWT_SECRET in .env with a long local-only random value.
pnpm install --frozen-lockfile
pnpm run dev:docker
pnpm run prisma-db-push
pnpm run dev
```

The repository's `docker-compose.dev.yaml` starts isolated development Postgres, Redis, and Temporal services. The source processes started by `pnpm run dev` serve the frontend at `http://localhost:4200` and backend at `http://localhost:3000`, matching `.env.example`. Never reuse production credentials or databases in `.env`.

Stop the local dependencies without deleting their data:

```bash
docker compose -f docker-compose.dev.yaml down
```

Use `docker compose -f docker-compose.dev.yaml down --volumes` only when intentionally resetting local development data.

## Checks and image build

```bash
pnpm run build
pnpm exec prettier --check apps/frontend/src libraries/react-shared-libraries/src

docker build --platform linux/amd64 -f Dockerfile.douro -t postiz-douro:local .
```

## Upstream synchronization

Do not merge upstream `main` directly into production. Review migrations and release notes, test staging, and take a database backup before promotion.

```bash
git switch douro
git fetch upstream
git switch -c douro-upstream-YYYY-MM-DD
# Replace <reviewed-upstream-commit> only after compatibility review.
git merge <reviewed-upstream-commit>
pnpm install --frozen-lockfile
pnpm run build
git push -u origin douro-upstream-YYYY-MM-DD
```

After the review branch passes staging, merge it into `douro`; production promotion still uses the exact staging-tested image digest.
