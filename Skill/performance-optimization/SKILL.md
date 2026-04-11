---
description: "Full-stack performance optimization: database query tuning, N+1 detection, caching strategies, bundle size reduction, lazy loading, API response compression, PostgreSQL index optimization, React render profiling, memory leak detection."
---

# Performance Optimization Skill

## When to Activate
- User asks to optimize performance, speed up, or reduce latency
- User mentions slow queries, large bundles, memory issues
- User asks about caching, indexes, or compression
- User mentions loading times or Core Web Vitals

## Instructions

### Phase 1: Profiling & Measurement
Before optimizing, measure the current state:

#### Backend Profiling
1. **Database queries**: Check for N+1 queries in Drizzle ORM
   - Look for loops that execute individual DB queries
   - Use `with` relations or batch queries instead
2. **API response times**: Add timing middleware
3. **Memory usage**: Check for event listener leaks, large in-memory collections
4. **SQL query analysis**: Use `EXPLAIN ANALYZE` on slow queries

#### Frontend Profiling
1. **Bundle analysis**: `npx vite-bundle-visualizer`
2. **React profiler**: Check for unnecessary re-renders
3. **Lazy loading**: Verify route-level code splitting with `React.lazy()`
4. **Image optimization**: Check image sizes and formats

### Phase 2: Database Optimization

#### PostgreSQL Indexes
```sql
-- Check missing indexes for common queries
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';

-- Add indexes for frequently filtered columns
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_testimonials_status ON testimonials(status);
```

#### Query Optimization Patterns
```typescript
// ❌ N+1 Problem
const pages = await db.select().from(pagesTable);
for (const page of pages) {
  const sections = await db.select().from(sectionsTable).where(eq(sectionsTable.pageId, page.id));
}

// ✅ Batch Query
const pages = await db.select().from(pagesTable);
const allSections = await db.select().from(sectionsTable)
  .where(inArray(sectionsTable.pageId, pages.map(p => p.id)));
```

#### Pagination Best Practices
- Always use `LIMIT` + `OFFSET` (already capped at 100000 in this project)
- For large tables, use cursor-based pagination (`WHERE id > lastId LIMIT n`)
- Return total count in response header, not body

### Phase 3: API Optimization
1. **Response compression**: Verify `compression` middleware in Express
2. **Selective fields**: Only `SELECT` needed columns, not `SELECT *`
3. **Cache headers**: Add `Cache-Control` for static API responses
4. **Pagination**: Ensure all list endpoints support `?page=&limit=`
5. **Batch endpoints**: Combine related API calls into single endpoints

### Phase 4: Frontend Optimization
1. **Code splitting**: All admin routes should be lazy-loaded
2. **Image optimization**: Use WebP format, proper sizing, lazy loading
3. **Tree shaking**: Ensure unused code is eliminated in production build
4. **CSS optimization**: Purge unused Tailwind classes (configured in `tailwind.config.ts`)
5. **Service Worker**: Check `sw.js` caching strategy for static assets

### Phase 5: Report
```markdown
## Performance Optimization Report

### Current Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API avg response | Xms | Xms | X% |
| Bundle size | X KB | X KB | X% |
| DB query count/page | X | X | X% |

### Optimizations Applied
1. [Description] → [Impact]

### Remaining Opportunities
1. [Description] → [Expected Impact]
```
