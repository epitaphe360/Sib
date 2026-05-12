# Translation Audit Report - 2026-05-12

## Executive Summary

**Critical Issue Found:** 2,404 translation keys (68.9%) used in the codebase are **NOT defined** in the translation files.

- ✅ **Translation keys defined**: 2,105
- ❌ **Translation keys used in code**: 3,480
- 🔴 **Missing keys**: 2,404 (69%)
- 🟡 **Unused keys**: 1,029 (can be removed)

## Missing Keys by Namespace (Top 20)

The most critical namespaces with missing translations:

1. **`admin`** - 441 missing keys (CRITICAL!)
   - Examples: `analytics_trends`, `api_calls_24h`, `badge_save_error`, `collab_add_first`, etc.
   - These are widely used in admin pages and dashboards

2. **`partner`** - 193 missing keys
   - Payment, notification, and partner management features

3. **`chatbot`** - 138 missing keys
   - AI chatbot interface strings

4. **`exhibitor`** - 133 missing keys
   - Exhibitor registration and management

5. **`common`** - 78 missing keys
   - Shared UI elements across the app

6. **`networking`** - 73 missing keys
   - Networking features

7. **`countdown`** - 56 missing keys
8. **`exhibitor_sim`** - 54 missing keys
9. **`exhibitor_detail`** - 53 missing keys
10. **`pages`** - 51 missing keys

... and 10 more namespaces with missing keys

## Unused Keys by Namespace (Can Be Removed)

Translation keys defined but never used in code:

1. **`media`** - 110 unused keys
2. **`error`** - 96 unused keys
3. **`appointments`** - 90 unused keys
4. **`exhibitors`** - 78 unused keys
5. **`events`** - 77 unused keys
6. **`dashboard`** - 72 unused keys
7. **`form`** - 70 unused keys
8. **`partners`** - 69 unused keys

## Root Cause Analysis

Two main issues:

### 1. Missing Translation Definitions
Many translation keys are used in the code via `t('namespace.key')` but are not defined in `src/i18n/translations/*.ts` files.

**Example:** The code uses:
```typescript
toast.error(t('admin.push_title_message_required'));
```

But `admin.push_title_message_required` is not defined in the translation files!

### 2. Orphaned Translations
Some translation keys are defined in the translation files but are never used in the codebase. These can be safely removed.

**Example:** `media.en`, `media.export`, etc. are defined but never used via `t('media.*')`.

## Impact Assessment

🔴 **CRITICAL**: Missing admin translations (441 keys)
- These directly impact admin dashboard functionality
- Users will see key names instead of translated text

🟠 **HIGH**: Missing common/partner/chatbot translations
- Core features will show untranslated strings

🟡 **MEDIUM**: Unused translations
- Technical debt, but no functional impact

## Recommended Actions

### Phase 1: Add Missing Admin Translations (URGENT)
1. Create `src/i18n/translations/admin.ts` if missing
2. Add all 441 missing admin translation keys with placeholders
3. Prioritize:
   - Push notifications (push_*)
   - Collaboration features (collab_*)
   - Analytics (analytics_*, chart_*)
   - Badge management (badge_*)

### Phase 2: Add Missing Translations for Other Namespaces
1. Partner translations (193 keys)
2. Chatbot translations (138 keys)
3. Exhibitor translations (133 keys)
4. Common translations (78 keys)

### Phase 3: Cleanup Unused Translations
1. Identify and remove orphaned keys
2. Focus on:
   - media (110 unused)
   - error (96 unused)
   - appointments (90 unused)

## Example Missing Admin Keys (First 30)

```
admin.analytics_trends
admin.api_calls_24h
admin.approved
admin.back_to_dashboard
admin.badge_hide_preview
admin.badge_load_error
admin.badge_preview_realtime
admin.badge_save_error
admin.badge_saved
admin.badge_show_preview
admin.chart_pageviews
admin.chart_visits
admin.click_to_process
admin.collab_add_first
admin.collab_added
admin.collab_all_statuses
admin.collab_all_types
admin.collab_belongs_to
admin.collab_col_company
admin.collab_col_contact
admin.collab_col_name
admin.collab_col_status
admin.collab_col_type
admin.collab_count
admin.collab_delete_error
admin.collab_deleted
admin.collab_empty
admin.collab_exhibitors
admin.collab_exhibitors_sing
admin.collab_modal_add
```

## Files Affected

**Code using `t()` calls:** 
- `/src/pages/**/*.tsx`
- `/src/components/**/*.tsx`
- `/src/services/**/*.ts`

**Translation definitions:**
- `src/i18n/translations/admin.ts` ⚠️ MISSING or INCOMPLETE
- `src/i18n/translations/partner.ts`
- `src/i18n/translations/chatbot.ts`
- `src/i18n/translations/exhibitor.ts`
- `src/i18n/translations/common.ts`
- And 15+ more

## Next Steps

1. ✅ Generate detailed audit report (DONE - this file)
2. ⏳ Identify and fix most critical missing admin translations
3. ⏳ Create translation keys stubs for Phase 2 namespaces
4. ⏳ Run audit again to verify completeness

---

**Report Generated:** 2026-05-12T01:13:56.806Z  
**Audit Tool:** `audit-translations-v3.mjs`  
**Full Report JSON:** `translation-audit-report.json`
