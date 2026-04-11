# Load Test Guide (SIB)

## Quick smoke (no extra dependency)

Use the built-in Node smoke test:

```bash
npm run load:smoke
```

Environment options:

- `LOAD_BASE_URL` (default: `http://localhost:9323`)
- `LOAD_CONCURRENCY` (default: `30`)
- `LOAD_ITERATIONS` (default: `8`)

Example:

```bash
LOAD_BASE_URL=https://sib.ma LOAD_CONCURRENCY=60 LOAD_ITERATIONS=10 npm run load:smoke
```

Pass criteria (default thresholds in script):

- failure rate <= 2%
- p95 <= 1200ms

## Artillery scenarios

Install once (if needed):

```bash
npm i -D artillery
```

Run baseline profile:

```bash
npm run load:artillery
```

Run staged profile:

```bash
npm run load:artillery:staged
```

## Suggested production targets

- p95 < 500ms for cached public routes
- p99 < 1200ms
- error rate < 1%
- no sustained 5xx spikes

## Execution checklist

1. Run with production-like env vars and build output.
2. Monitor Supabase CPU/connections and API error rate during run.
3. Compare before/after each optimization (pagination, cache, indexes).
4. Keep the best scenario report in CI artifacts.
