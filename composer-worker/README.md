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
- `POST /submit` — `Bearer <access password>`, `{ title?, questionCount?, source, note? }`
  → `{ ok: true }`. A user's non-private module upload, for review. KV, 90-day TTL.
- `GET /reports` — `Bearer <ADMIN password>` → recent reports, newest first.
- `GET /submissions` — `Bearer <ADMIN password>` → recent module submissions.
- `GET /published` — **public, no auth** → modules the author published; every
  app fetches this on load and merges them in for all users.
- `POST /publish` — `Bearer <ADMIN password>`, `{ title, source, id? }` → `{ ok, id }`.
  Stores a module live for everyone (no TTL, until unpublished).
- `POST /unpublish` — `Bearer <ADMIN password>`, `{ id }` → `{ ok }`.
- `GET /incidents` — `Bearer <ADMIN password>` → times a configured model 404'd
  and grading fell back to the other model (so you know to update a model ID).
- `GET /models` — `Bearer <ADMIN password>` → current + default model ids.
- `POST /models` — `Bearer <ADMIN password>`, `{ quick, batch }` → overrides the
  grading models live (empty string reverts to the wrangler.toml default). No
  redeploy needed. The `GEMINI_MODEL*` vars are the fallback defaults.

Grading falls back automatically: if the configured model 404s (retired), the
worker retries once with the other configured model and tags the response with
`fellBack`. `/reports`, `/submissions`, `/publish`, `/unpublish`, `/incidents`
need the admin password.

Limits: 8 requests/min/IP, 300/day globally (vars in wrangler.toml), answer ≤ 500
chars, prompt built server-side only.
