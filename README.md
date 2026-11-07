# Fullstack Starter

React + Express, both TypeScript, on Postgres and Redis, with an MCP server built in. Small on purpose, structured to grow.

## Quickstart

Needs Node 22.12+ (CI and Docker use 24) and Docker.

```sh
cp .env.example .env && npm install
npm run services:up && npm run db:migrate
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3000 (`/health`, `/ready`, `/api/notes`)
- MCP: http://localhost:3000/mcp

## Folder map

```
client/    React + Vite UI (dev server proxies /api to the server)
server/    Express API, MCP server, migrations
  src/app.ts         builds the app from its deps (easy to test)
  src/routes/        health + notes CRUD
  src/lib/           Postgres repo, Redis rate limiter
  src/mcp/           MCP tools, stdio entry, HTTP endpoint
  src/migrate.ts     runs migrations
  migrations/        plain SQL migrations
shared/    zod schemas + types used by client and server
config/    typed env loading and validation (zod)
.github/   CI, deploy, Dependabot
docker-compose.yml        Postgres + Redis for local dev
docker-compose.prod.yml   whole stack, prod-like
```

Workspace packages resolve to their `.ts` source in dev and tests (the `source` export condition), so there's no prebuild step. Production builds compile each package to `dist/`.

## Scripts

- `npm run dev`: server and client with hot reload
- `npm run build`: build every package
- `npm test`: Vitest across all packages
- `npm run lint` / `npm run format`
- `npm run typecheck`
- `npm run check`: every quality check below in one go
- `npm run db:migrate` / `db:migrate:down` / `db:migrate:new -- <name>`
- `npm run mcp`: MCP server over stdio
- `npm run services:up` / `services:down`

## Stack choices

- Migrations: node-pg-migrate with plain `.sql` files. Queries use `pg` directly, no ORM.
- Redis: fixed-window rate limiting on `/api`. It fails open, so a Redis outage never blocks requests.
- MCP: official `@modelcontextprotocol/sdk`. Tools `list_notes` and `create_note` use the same repo as the REST API.
- Env: `config/` validates `process.env` with zod at startup and fails with a readable error.

## Checks

- Prettier: formatting
- ESLint (flat config, typescript-eslint, react-hooks): bugs and bad patterns
- tsc: types, strict mode
- knip: unused files, exports and dependencies
- dependency-cruiser: import rules (client never imports server, shared depends on nothing local, no cycles)
- jscpd: copy-paste duplication, fails above 3%
- npm audit: known vulnerabilities in prod deps, fails on high or critical
- Dependabot: weekly npm updates, monthly Actions and Docker updates
- husky + lint-staged: lint and format staged files on commit (activates after `git init`)

## Use the MCP server

From Claude Desktop or Claude Code over stdio:

```json
{
  "mcpServers": {
    "fullstack-starter": {
      "command": "npm",
      "args": ["run", "-s", "mcp", "--prefix", "/absolute/path/to/repo"]
    }
  }
}
```

Over HTTP, point a client at `http://localhost:3000/mcp` (streamable HTTP, stateless). Add auth before exposing it publicly.

## Deploy

- `ci.yml`: check, test, build and audit on every PR, plus a job that runs the migrations against a real Postgres.
- `deploy.yml`: on push to main, builds both images and pushes them to GHCR. The deploy step is a placeholder with AWS ECS (OIDC) and Fly.io examples in comments.
- Run migrations before the new server starts: `node dist/migrate.js up` in the server image.
- Prod-like locally: `docker compose -f docker-compose.prod.yml up --build`, then open http://localhost:8080.

## Scaling later

- New resource: add a schema in `shared/`, a migration, a repo in `server/src/lib/`, a router in `server/src/routes/`.
- New package: add a folder, list it in root `workspaces`, give it the same `exports` shape as `shared/`.
- Split services: a new `worker/` or `api-2/` workspace reuses `config/` and `shared/`, gets its own Dockerfile and a matrix entry in `deploy.yml`.
- Swap the deploy target: only the last step of `deploy.yml` changes. Images stay the same.
- Need an ORM: swap `pg` queries in the repo layer. Routes and MCP tools depend on the `NotesRepo` interface, not on `pg`.
- Sessions or queues: reuse the Redis client from `server/src/index.ts`.

## License

MIT, see `LICENSE`.
