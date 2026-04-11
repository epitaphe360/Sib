AI agent (mini-site importer)

This small server exposes a POST /generate endpoint that accepts { url } and returns a mini-site payload JSON.

Features
- Uses `scripts/ai_generate_minisite.mjs` to scrape a website and build a basic payload.
- Optionally calls an external enrichment API (e.g. Groq) if `GROQ_API_KEY` and `GROQ_API_URL` are set.

Security
- Never commit API keys. Set them as environment variables.

Local usage (PowerShell)

1) Install dependencies in project root:

```powershell
npm install
```

2) Set the Groq API key (in current session only):

```powershell
$env:GROQ_API_KEY = 'gsk_...'
$env:GROQ_API_URL = 'https://api.groq.com/v1/enrich'
npm run ai-agent
```

3) Test the endpoint (from another shell):

```powershell
curl -X POST http://localhost:4001/generate -H 'Content-Type: application/json' -d '{"url":"https://example.com"}'
```

If you don't set GROQ_* env vars the agent will return the basic scraped payload.

Do not add `.env` files with secrets to the repository. Use your deployment platform's secret manager.

Security & configuration
------------------------
- `AI_AGENT_KEY` (optional): if set, clients must send `x-ai-agent-key` header with this value to call `/generate`.
- `ALLOWED_ORIGINS` (optional): comma-separated list of allowed origins for CORS (default `http://localhost:5173,http://localhost:3000`).

Curl example with API key:

```powershell
curl -X POST http://localhost:4001/generate -H 'Content-Type: application/json' -H 'x-ai-agent-key: your_key_here' -d '{"url":"https://example.com"}'
```

Server helper
--------------

This agent now exposes a small server-side helper on startup as `globalThis.__runLocalAiCliFallback`.
It can be used by other server-side modules in the project to run the local CLI generator synchronously and
obtain the parsed JSON payload without forking the process directly. This avoids bundling node-only modules
into client builds.

Example usage from another server module:

```js
const payload = await globalThis.__runLocalAiCliFallback('https://example.com');
```
