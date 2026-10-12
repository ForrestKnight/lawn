# Self-hosting this fork

ForrestKnight/lawn is a self-hosted copy of pingdotgg/lawn on Vercel + Convex.
Every fork change is a separate commit on top of upstream so each can be
dropped or reapplied after a rebase:

| Commit           | What                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| `stub-billing`   | `getTeamSubscriptionState` always returns the paid tier; Stripe client is lazy        |
| `remove-landing` | marketing routes/components deleted, `/` → `/dashboard`, prerender only the SPA shell |
| `sync-upstream`  | weekly GitHub Action merging `upstream/main` into `master`                            |
| `docs`           | this file and `.env.example` notes                                                    |

## Infrastructure

| Piece          | Where                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| GitHub         | https://github.com/ForrestKnight/lawn (default branch `master`)                     |
| Convex project | https://dashboard.convex.dev/t/forrest-knight/lawn                                  |
| Convex prod    | `savory-bobcat-504` → https://savory-bobcat-504.convex.cloud                        |
| Convex dev     | `unique-skunk-248` (`bun run dev:cloud`)                                            |
| Vercel         | project `lawn`, production branch `master`, domain `lawn.fkcodes.com`               |
| Clerk          | app `lawn` (`app_3Kbq1hRJ80UlbZMz7dkQmMqh2Q4`), dev instance, JWT template `convex` |
| R2             | bucket `lawn-videos` (private, CORS set), S3 endpoint on account `b564…a63`         |

Vercel runs `bun run build:vercel`, which deploys Convex prod with
`CONVEX_DEPLOY_KEY` and builds the client with `VITE_CONVEX_URL` injected.

## Upstream sync

`.github/workflows/sync-upstream.yml` merges `upstream/main` into `master`
every Monday (or on demand from the Actions tab). Upstream commits land in
bursts every week or two, so weekly is enough. Modify/delete conflicts on files
this fork deleted are resolved by keeping them deleted. Any other conflict
aborts the merge and opens an issue labeled `upstream-sync`.

Manual resolution:

```bash
git fetch upstream main
git merge upstream/main
# fix conflicts, then
git push origin master
```

## Billing

Stripe is not configured and never will be on this deployment. The only
change is the tail of `getTeamSubscriptionState` in `convex/billingHelpers.ts`,
which returns `plan: "pro"` and `hasActiveSubscription: true` for every team.
The `@convex-dev/stripe` component, its tables and webhook routes, and the
checkout/portal actions are untouched; they are simply unreachable.

Consequences to know about:

- The Pro storage cap (1 TiB per team) still applies via `assertTeamCanStoreBytes`.
- Team deletion is blocked by the "active subscription" guard in
  `convex/teams.ts` and the settings UI. Delete a team from the Convex
  dashboard if you ever need to.
- The team settings page still shows the Pro/Basic plan cards (no actions are
  available on them). That UI is inline in `-settings.tsx`, not a separate
  component, so it was left alone to keep rebases cheap.

Stripe env vars (`STRIPE_*`) are optional: leave them empty.

## Environment

Set on the Convex deployment (`bunx convex env set [--prod] NAME value`):

| Var                                   | State                                                      |
| ------------------------------------- | ---------------------------------------------------------- |
| `CLERK_JWT_ISSUER_DOMAIN`             | set (dev instance issuer)                                  |
| `CLERK_SECRET_KEY`                    | set (dev instance)                                         |
| `RAILWAY_ENDPOINT`                    | set (R2 S3 endpoint)                                       |
| `RAILWAY_BUCKET_NAME`                 | set (`lawn-videos`)                                        |
| `RAILWAY_REGION`                      | set (`auto`)                                               |
| `RAILWAY_ACCESS_KEY_ID`               | **missing** — R2 API token                                 |
| `RAILWAY_SECRET_ACCESS_KEY`           | **missing** — R2 API token                                 |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET`   | **missing** — Mux access token                             |
| `MUX_SIGNING_KEY` / `MUX_PRIVATE_KEY` | **missing** — can be created via API once the token exists |
| `MUX_WEBHOOK_SECRET`                  | **missing** — from the Mux webhook                         |
| `STRIPE_*`                            | optional, unset                                            |

`RAILWAY_PUBLIC_URL` is not needed: uploads, Mux ingest, and downloads all use
presigned URLs, so the bucket stays private.

On Vercel: `CONVEX_DEPLOY_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` (production).

### Mux

From https://dashboard.mux.com, left sidebar **Settings → API Access Tokens**
(direct link: https://dashboard.mux.com/settings/access-tokens) → Generate new
token → environment: Production, permissions: Mux Video read + write. Then:

```bash
bunx convex env set --prod MUX_TOKEN_ID ...
bunx convex env set --prod MUX_TOKEN_SECRET ...
```

Webhook: https://dashboard.mux.com/settings/webhooks → Create new webhook →
URL `https://savory-bobcat-504.convex.site/webhooks/mux` → copy the signing
secret → `MUX_WEBHOOK_SECRET`.

Signing key (for signed playback URLs) can be created through the API with the
access token, or at https://dashboard.mux.com/settings/signing-keys.

### R2 credentials

https://dash.cloudflare.com → R2 → Manage R2 API Tokens → Create API token →
permission **Object Read & Write**, scoped to bucket `lawn-videos`. Copy the
Access Key ID and Secret Access Key:

```bash
bunx convex env set --prod RAILWAY_ACCESS_KEY_ID ...
bunx convex env set --prod RAILWAY_SECRET_ACCESS_KEY ...
```

### Clerk production instance (later)

Dev-instance keys work on the hosted app (Clerk dev caps, "development mode"
badge). A production instance needs DNS records on `fkcodes.com`:

```bash
clerk deploy
clerk env pull --instance prod --file /tmp/clerk-prod.env
clerk api /jwt_templates --instance prod -d '{"name":"convex","claims":{"aud":"convex"}}'
# set CLERK_JWT_ISSUER_DOMAIN + CLERK_SECRET_KEY on Convex prod,
# VITE_CLERK_PUBLISHABLE_KEY on Vercel, then redeploy.
```

## DNS (Cloudflare, manual)

Wrangler's OAuth token cannot write DNS records, so add this in the Cloudflare
dashboard for `fkcodes.com`, **DNS only** (grey cloud):

```
A   lawn   76.76.21.21
```

Vercel verifies it automatically.

## Day-to-day

```bash
bun run dev            # local anonymous Convex + Vite (reads .env.local)
bun run dev:cloud      # Vite against the unique-skunk-248 dev deployment
git push origin master # Vercel builds + deploys Convex prod
```
