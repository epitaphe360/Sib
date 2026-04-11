---
description: "Database migration and schema management: PostgreSQL migration creation, Drizzle ORM schema updates, zero-downtime migration strategies, seed data, rollback plans, index optimization, schema validation."
---

# Database Migration Skill

## When to Activate
- User asks to create a migration, update schema, or modify database
- User mentions tables, columns, indexes, or seeds
- User asks about Drizzle ORM schema or PostgreSQL operations

## Instructions

### Migration Workflow

#### Step 1: Schema Update
Update `shared/schema.ts` with the new table or column changes:
```typescript
import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
```

#### Step 2: Create Migration File
Create a numbered migration in `migrations/`:
- Format: `NNN_description.sql` (e.g., `011_add_notifications.sql`)
- Check the highest existing migration number first
- Include both UP statements (creates) and comments for rollback

```sql
-- migrations/011_add_notifications.sql
-- UP: Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ROLLBACK: DROP TABLE IF EXISTS notifications;
```

#### Step 3: Validation
1. Verify schema in `shared/schema.ts` matches migration SQL
2. Run `npx tsc --noEmit` to check TypeScript types
3. Test migration on development database

### Best Practices
- Always use `IF NOT EXISTS` for CREATE TABLE/INDEX
- Add proper indexes for columns used in WHERE/JOIN clauses
- Use `TIMESTAMP DEFAULT NOW()` for tracking fields
- Include rollback comments in migration files
- Never modify published migrations — create new ones instead
- Use `text` over `varchar` in PostgreSQL (no performance difference)

### Seed Data
For seed migrations, use INSERT with ON CONFLICT:
```sql
INSERT INTO settings (key, value) VALUES
  ('site_name', 'Epitaphe 360'),
  ('contact_email', 'contact@epitaphe360.ma')
ON CONFLICT (key) DO NOTHING;
```

### Existing Schema Reference
Key tables in this project:
- `users`, `admins` — Authentication
- `pages`, `sections` — CMS content
- `services`, `solutions`, `categories` — Service catalog
- `testimonials`, `partners` — Social proof
- `subscriptions`, `payments`, `devis` — Commerce
- `settings`, `resources` — Configuration
- `passwordResetTokens` — Auth tokens
