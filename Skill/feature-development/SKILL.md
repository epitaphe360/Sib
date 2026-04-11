---
description: "End-to-end feature development workflow: requirements analysis, API design, database schema, backend implementation, frontend UI, testing, deployment preparation. Multi-step feature building for Express.js + React + PostgreSQL stack."
---

# Feature Development Skill

## When to Activate
- User asks to build, implement, or create a new feature
- User asks to add a new page, endpoint, or component
- User mentions feature planning or scaffolding

## Instructions

### Phase 1: Requirements Analysis
1. Clarify the feature scope with the user
2. Identify affected layers: database, API, frontend, CMS
3. List dependencies on existing features
4. Define acceptance criteria

### Phase 2: Database Schema (if needed)
1. Design the Drizzle ORM schema in `shared/schema.ts`
2. Add table definitions with proper types, defaults, and relations
3. Create migration SQL in `migrations/` directory
4. Export insert/select schemas and TypeScript types

```typescript
// shared/schema.ts pattern
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertNewTableSchema = createInsertSchema(newTable);
export type NewTable = typeof newTable.$inferSelect;
export type InsertNewTable = typeof newTable.$inferInsert;
```

### Phase 3: Backend API
1. Create/update route handler in the appropriate file:
   - `server/admin-routes.ts` for admin CRUD
   - `server/public-api-routes.ts` for public-facing API
   - `server/payment-routes.ts` for payment-related features
   - `server/client-portal-routes.ts` for client portal features
2. Add Zod validation for all inputs
3. Implement proper error handling with status codes
4. Add rate limiting for sensitive operations
5. Document the endpoint

```typescript
// Route pattern
app.post("/api/admin/resource", requireAdmin, async (req, res) => {
  try {
    const data = resourceSchema.parse(req.body);
    const [result] = await db.insert(resourceTable).values(data).returning();
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Phase 4: Frontend UI
1. Create React component in `client/src/`
2. Use existing design system (Tailwind CSS + shadcn/ui components)
3. Implement form validation with react-hook-form + Zod
4. Add loading states and error handling
5. Use `@tanstack/react-query` for data fetching
6. Add route in the wouter router

### Phase 5: CMS Integration (if admin feature)
1. Add page/component in `cms-dashboard/`
2. Update navigation in dashboard layout
3. Add CRUD operations with proper auth checks

### Phase 6: Testing
1. Write API integration tests
2. Test edge cases and error paths
3. Verify TypeScript compilation: `npx tsc --noEmit`

### Phase 7: Validation Checklist
- [ ] Schema migration created
- [ ] API endpoints working (test with curl)
- [ ] Input validation on all endpoints
- [ ] Auth guards on protected routes
- [ ] Frontend connected and rendering
- [ ] TypeScript: 0 errors
- [ ] No console warnings in browser
