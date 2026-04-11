---
description: "Multi-perspective code review: architecture analysis, security scanning, performance profiling, code quality assessment, TypeScript best practices, Express.js patterns, React component review, dead code detection."
---

# Code Review Skill

## When to Activate
- User asks for code review, code analysis, or code quality check
- User asks to review a PR, file, or feature
- User mentions refactoring or code improvement

## Instructions

### Review Dimensions
Analyze code from 5 perspectives, each producing targeted feedback:

#### 1. Architecture Review
- Check separation of concerns (server routes vs business logic)
- Verify consistent error handling patterns (try/catch, error middleware)
- Check for circular dependencies between modules
- Ensure API routes follow RESTful conventions
- Verify Drizzle schema matches migration files

#### 2. Security Review
- Input validation on all endpoints (Zod schemas)
- Authentication/authorization checks on protected routes
- No sensitive data in logs or error responses
- Proper CORS and CSP configuration
- Rate limiting on sensitive operations

#### 3. Performance Review
- N+1 query detection in Drizzle ORM calls
- Unnecessary `SELECT *` vs specific column selection
- Missing database indexes for frequent queries
- Large payload responses without pagination
- Memory leaks in event listeners or intervals

#### 4. Code Quality
- TypeScript strict mode compliance (no `any` types)
- Consistent naming conventions (camelCase for variables, PascalCase for types)
- DRY violations (duplicated logic across routes)
- Function complexity (max 30 lines per function)
- Unused imports and dead code

#### 5. React Frontend Review
- Component size and responsibility (single responsibility principle)
- Proper use of hooks (useEffect dependencies, useMemo/useCallback)
- State management patterns (local vs global Zustand store)
- Accessibility (ARIA labels, keyboard navigation)
- Error boundaries and loading states

### Output Format
```markdown
## Code Review: [filename/feature]

### Summary
[1-2 sentence overview]

### Issues Found
| Severity | Category | Location | Description | Suggestion |
|----------|----------|----------|-------------|------------|
| 🔴 Critical | Security | file:line | ... | ... |
| 🟠 High | Performance | file:line | ... | ... |
| 🟡 Medium | Quality | file:line | ... | ... |
| 🔵 Low | Style | file:line | ... | ... |

### Positive Observations
- [What's done well]

### Recommended Actions
1. [Priority-ordered action items]
```

## Project-Specific Patterns
- Routes are in `server/*.ts` (admin-routes, public-api-routes, payment-routes, etc.)
- Schema is in `shared/schema.ts` using Drizzle ORM
- Frontend components are in `client/src/` with React + Tailwind CSS
- CMS dashboard is in `cms-dashboard/` with separate routing
