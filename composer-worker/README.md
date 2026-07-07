# greek-composer-worker

Password-gated Gemini grading proxy for [greek-composer.html](../greek-composer.html).
Free Cloudflare Workers tier; completely independent of the static-site host
(Netlify / Vercel / GitHub Pages — just list the origins in `ALLOWED_ORIGINS`).

## One-time deploy

```
cd composer-worker
npx wrangler login                          # opens browser, authorize
npx wrangler kv namespace create RATE_KV    # copy the printed id into wrangler.toml
npx wrangler secret put GEMINI_API_KEY      # paste the Gemini key (aistudio.google.com)
npx wrangler secret put ACCESS_PASSWORD     # type the password you'll give trusted friends
npx wrangler secret put ADMIN_PASSWORD      # a SECOND password, kept to yourself — views /reports
npx wrangler deploy                         # prints the workers.dev URL
```

Then paste the printed URL into `WORKER_URL` in `greek-composer.html`, and add
the production site origin(s) to `ALLOWED_ORIGINS` in `wrangler.toml`
(re-`deploy` after changing vars).

Rotate the password anytime with `npx wrangler secret put ACCESS_PASSWORD` — no
other changes needed.

## Local development

Create `composer-worker/.dev.vars` (gitignored):

```
GEMINI_API_KEY = "fake-or-real"
ACCESS_PASSWORD = "devpass"
TEST_FAKE_LLM = "1"    # skip the real Gemini call, return canned feedback
```

Run `npx wrangler dev` (serves http://localhost:8787, local KV simulated), and in
the app's browser console set:
`localStorage.setItem('greek-composer.v1.workerUrl', 'http://localhost:8787')`.

## Endpoints

- `GET /` → `{ ok: true }` health check
- `POST /grade` — `Authorization: Bearer <access password>`, JSON body
  `{ question, contextText?, acceptedAnswers?, userAnswer, moduleNote?, questionNote? }`
  → `{ score, feedback }` or 400/401/403/429/502 with `{ error }`.
- `GET /usage` — `Bearer <access password>` → daily quick/thorough counts.
- `POST /report` — `Bearer <access password>`, a flagged grade → `{ ok: true }`.
  Stored in KV, auto-expires in 90 days.
- `GET /reports` — `Bearer <ADMIN password>` → recent reports, newest first.
  The one endpoint that needs the admin password, not the shared one.

Limits: 8 requests/min/IP, 300/day globally (vars in wrangler.toml), answer ≤ 500
chars, prompt built server-side only.
