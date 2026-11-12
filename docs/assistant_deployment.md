# Assistant deployment and regression checks

## What changed

- Pages has chat, status, and stream routes sharing the same server implementation.
- Natural-language AI responses are no longer shared in a public cache. Conversation history and client-supplied evidence cannot contaminate another conversation's cached answer.
- A partial stream is retained and labelled interrupted; a second model's answer is never concatenated after visible text. The client understands SSE completion/error events.
- Current catalogue records have no recorded document-level verification. Their status is **unverified**, with no invented checked date. Homepage links remain useful reference links, not proof of individual facts. Checklist deadlines are explicitly unknown.
- Saved preferences feed retrieval; current query constraints override them. Named-university factual questions still show the requested institution rather than hiding it because it is outside a saved budget.
- Every provider attempt, including retries and failures, reserves usage before dispatch.

## Cloudflare Pages setup (not provisioned by this change)

The frontend build remains `npm run build`, output `dist`. Deploy the root `functions` directory with Pages; uploading only the static `dist` directory does not install these endpoints.

1. Create or select a D1 database for assistant usage. Use the existing account's limits and do not enable paid billing just to run the assistant.
2. Execute `migrations/0001_assistant_usage.sql` against that database using the D1 console or the account's Wrangler setup.
3. Add the Pages D1 binding **ASSISTANT_USAGE** pointing at that database. Configure production and preview separately (use a separate preview database so testing does not consume production's application cap).
4. Add **GEMINI_API_KEY** as a server secret. Never prefix it with `VITE_`.
5. Set `AI_ENABLED=true`, `AI_GLOBAL_DAILY_LIMIT` to your chosen nonnegative attempt cap, `AI_RATE_LIMIT_PER_MINUTE`, and `AI_MAX_CONCURRENCY`. These are application limits, not a promise of a provider free tier.
6. Redeploy. Check `/api/assistant/status`: `limitScope` should be `shared-durable`. Missing binding/table/storage errors disable AI; local catalogue tools remain available.
7. Check `/api/assistant/stream` from the chat interface. No live provider calls were made by the automated tests in this change.

The D1 statement atomically reserves one attempt per UTC day before calling the provider. Failed, cancelled and retried attempts are not refunded. Storage failures block the attempt. D1 accounting limits requests, not tokens or currency: separately configure the provider's billing/quota controls. If multiple apps share a Gemini project, give them coordinated budgets; this table only covers requests routed through this application.

Rate and concurrency limits remain **per process/isolate**, not globally distributed controls. The D1 daily cap is the shared upper bound. No IP addresses or conversation content are stored in the usage table.

Status reports are snapshots; the reservation statement, not the status response, enforces the cap. Remove old day rows periodically if needed. No automation or paid resource was created.

## Standalone Node / Vite

`npm start` serves the existing Node application. Node/Vite use an atomic in-process attempt counter, honestly labelled `process-local`; it resets on restart and is not a shared spending cap. Do not treat it as one for a replicated production Node deployment. Use the Pages/D1 path above for durable shared accounting, or supply a durable `reserveAttempt(limit)` implementation when constructing the Node server. Invalid credentials are not retried through fallback models.

## Verification

Use Node **22.13+** (Node 24 used during development) for the test suite's SQLite test backend:

```sh
npm ci
npm run test:assistant
npm run build
```

The suite runs the existing logic evaluation plus integration regressions for actual Pages handlers, client SSE parsing, partial streams, cache isolation, profile overrides, provenance, invalid credentials, and budget reservations. Shared reservations execute the actual SQL against SQLite across separate configurations. Pages functions are also bundled for a browser/Worker target to catch incorrect imports or Node-only dependencies.

This is not a live Cloudflare runtime or Gemini quality test. Existing browser screenshot scripts remain separate; a full mobile/browser session-switch regression is not claimed by these checks.
