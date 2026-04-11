---
description: "Intelligent debugging and error resolution: root cause analysis, stack trace interpretation, runtime error diagnosis, TypeScript type errors, Express.js middleware debugging, React rendering issues, database connection errors, production log analysis."
---

# Smart Debug Skill

## When to Activate
- User reports an error, bug, or unexpected behavior
- User shares a stack trace or error message
- User asks to debug, fix, or investigate an issue
- User mentions something "not working" or "broken"

## Instructions

### Phase 1: Error Classification
Categorize the error type to select the right diagnosis approach:

| Error Type | Indicators | Approach |
|-----------|------------|----------|
| TypeScript Compile | `TS2xxx` errors, red squiggles | Check types, imports, schema |
| Runtime Server | 500 errors, uncaught exceptions | Stack trace analysis, try/catch |
| Runtime Client | React error boundary, console errors | Component lifecycle, state |
| Database | Connection refused, query errors | Connection string, migrations |
| Authentication | 401/403 responses | Token expiry, middleware order |
| Network | CORS, timeout, DNS | Proxy config, endpoint URLs |

### Phase 2: Systematic Diagnosis

#### For Server Errors
1. Read the full stack trace (identify file + line number)
2. Check the route handler in the identified file
3. Verify middleware order (auth before route logic)
4. Check database query syntax and parameters
5. Verify environment variables are loaded
6. Test the endpoint with curl to isolate client vs server issues

#### For Client Errors
1. Check browser console for error messages
2. Verify API endpoint URLs match server routes
3. Check React component props and state
4. Verify async operations have error handling
5. Check for missing dependencies in useEffect

#### For TypeScript Errors
1. Run `npx tsc --noEmit` for full error list
2. Check import paths and module resolution
3. Verify shared schema types match usage
4. Look for `any` types masking real issues
5. Check tsconfig.json paths configuration

#### For Database Errors
1. Verify `DATABASE_URL` is set and valid
2. Check if migration was applied: compare schema vs actual tables
3. Test connection: `SELECT 1` query
4. Check for missing columns (common after merges)
5. Verify Drizzle schema matches PostgreSQL schema

### Phase 3: Fix and Verify
1. Apply the minimal fix to resolve the root cause
2. Run `npx tsc --noEmit` to verify no type errors
3. Test the affected endpoint/component
4. Check for regressions in related functionality
5. Document what caused the issue and the fix

### Common Patterns in This Project
- **Import errors**: Check `shared/schema.ts` exports match usage in server files
- **Route 404**: Verify route is registered in the correct router file
- **Auth failures**: Check `requireAdmin` middleware and JWT_SECRET env var
- **Database errors**: Run pending migrations, check schema sync
- **Build errors**: Check `vite.config.ts` and `tsconfig.json` paths
