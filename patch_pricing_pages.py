"""
Patch ExhibitorSubscriptionPage.tsx and PartnerSubscriptionPage.tsx
to load prices dynamically from pricing_config table.
"""
import re

# ─── EXHIBITOR ───────────────────────────────────────────────────────────────
with open("src/pages/ExhibitorSubscriptionPage.tsx", encoding="utf-8", errors="replace") as f:
    ex = f.read()

# 1. Add hooks + supabase import
ex = ex.replace(
    "import React from 'react';",
    "import React, { useState, useEffect } from 'react';"
)
ex = ex.replace(
    "import { useTranslation } from '../hooks/useTranslation';",
    "import { useTranslation } from '../hooks/useTranslation';\nimport { supabase } from '../lib/supabase';"
)

# 2. Wrap static array in a function
ex = ex.replace(
    "const exhibitorTiers: SubscriptionTier[] = [",
    "type ExPriceMap = Record<string, { price: number; currency: string }>;\n\nfunction getExhibitorTiers(priceMap: ExPriceMap = {}): SubscriptionTier[] {\n  return ["
)

# 3. Dynamic prices per tier
tier_ids = {
    "exhibitor-9m":  ("price: 0,", "currency: 'Sur devis',"),
    "exhibitor-18m": ("price: 0,", "currency: 'Sur devis',"),
    "exhibitor-36m": ("price: 0,", "currency: 'Sur devis',"),
    "exhibitor-54m": ("price: 0,", "currency: 'Sur devis',"),
}
for tid in tier_ids:
    ex = ex.replace(
        f"id: '{tid}',\n    name:",
        f"id: '{tid}',\n    name:"  # no-op just to be safe
    )
    # Replace first occurrence of price:0/currency:'Sur devis' after each id
    ex = ex.replace(
        f"id: '{tid}',",
        f"id: '{tid}', /*PRICE_PLACEHOLDER_{tid}*/",
        1
    )

# Now replace placeholders
for tid in tier_ids:
    # Replace the placeholder and also price:0/currency lines
    placeholder = f"id: '{tid}', /*PRICE_PLACEHOLDER_{tid}*/"
    ex = ex.replace(
        placeholder,
        f"id: '{tid}',",
        1
    )

# Directly replace price:0/currency:'Sur devis' patterns within each tier block
# We need a smarter approach: find each tier block and replace inside it
def replace_prices_in_exhibitor(content):
    tiers = [
        ("exhibitor-9m", "9m"),
        ("exhibitor-18m", "18m"),
        ("exhibitor-36m", "36m"),
        ("exhibitor-54m", "54m"),
    ]
    for tid, _ in tiers:
        # Find the tier block and replace first price:0 and currency:'Sur devis' after the id
        pattern = rf"(id: '{re.escape(tid)}'.*?)(price: 0,)(.*?)(currency: 'Sur devis',)"
        replacement = (
            rf"\1price: priceMap['{tid}']?.price ?? 0,"
            rf"\3currency: priceMap['{tid}']?.currency ?? 'Sur devis',"
        )
        content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
    return content

ex = replace_prices_in_exhibitor(ex)

# 4. Close the array + close the function (find the ]; that ends exhibitorTiers)
# The static array ends with ]; followed by export default
ex = ex.replace(
    "];\n\nexport default function ExhibitorSubscriptionPage",
    "];\n}\n\nexport default function ExhibitorSubscriptionPage",
    1
)

# 5. In the component: add priceMap state + useEffect, change usage
old_component_start = (
    "export default function ExhibitorSubscriptionPage() {\n"
    "  const navigate = useNavigate();\n"
    "  // t used for future translations\n"
    "  const { t: _t } = useTranslation();\n"
    "\n"
    "  const handleSubscribe = (tierId: string) => {\n"
    "    const tier = exhibitorTiers.find"
)
new_component_start = (
    "export default function ExhibitorSubscriptionPage() {\n"
    "  const navigate = useNavigate();\n"
    "  // t used for future translations\n"
    "  const { t: _t } = useTranslation();\n"
    "  const [priceMap, setPriceMap] = useState<ExPriceMap>({});\n"
    "\n"
    "  useEffect(() => {\n"
    "    supabase\n"
    "      .from('pricing_config')\n"
    "      .select('level, amount, currency')\n"
    "      .eq('category', 'exhibitor')\n"
    "      .eq('is_active', true)\n"
    "      .then(({ data }) => {\n"
    "        if (!data) return;\n"
    "        const map: ExPriceMap = {};\n"
    "        data.forEach(row => {\n"
    "          const id = row.level === '9m2' ? 'exhibitor-9m'\n"
    "            : row.level === '18m2' ? 'exhibitor-18m'\n"
    "            : row.level === '36m2' ? 'exhibitor-36m'\n"
    "            : row.level === '54m2' ? 'exhibitor-54m' : null;\n"
    "          if (id) map[id] = { price: row.amount, currency: row.currency };\n"
    "        });\n"
    "        if (Object.keys(map).length > 0) setPriceMap(map);\n"
    "      });\n"
    "  }, []);\n"
    "\n"
    "  const exhibitorTiers = getExhibitorTiers(priceMap);\n"
    "\n"
    "  const handleSubscribe = (tierId: string) => {\n"
    "    const tier = exhibitorTiers.find"
)
ex = ex.replace(old_component_start, new_component_start, 1)

with open("src/pages/ExhibitorSubscriptionPage.tsx", "w", encoding="utf-8") as f:
    f.write(ex)

check_ex = "setPriceMap" in ex and "getExhibitorTiers" in ex
print(f"Exhibitor done: setPriceMap={check_ex}")

# ─── PARTNER ─────────────────────────────────────────────────────────────────
with open("src/pages/PartnerSubscriptionPage.tsx", encoding="utf-8", errors="replace") as f:
    pa = f.read()

# 1. Add supabase import (useState/useEffect already present)
pa = pa.replace(
    "import { useTranslation } from '../hooks/useTranslation';",
    "import { useTranslation } from '../hooks/useTranslation';\nimport { supabase } from '../lib/supabase';",
    1
)

# 2. Wrap static array in function
pa = pa.replace(
    "const partnerTiers: PartnerTierData[] = [",
    "type PartnerPriceMap = Record<string, { price: number; currency: string }>;\n\nfunction getPartnerTiers(priceMap: PartnerPriceMap = {}): PartnerTierData[] {\n  return [",
    1
)

# 3. Dynamic prices
def replace_prices_in_partner(content):
    tiers = [
        ("partner-silver", 200000),
        ("partner-gold",   350000),
        ("partner-officiel", 500000),
    ]
    for tid, default_price in tiers:
        pattern = rf"(id: '{re.escape(tid)}'.*?)(price: {default_price},)(.*?)(currency: 'MAD',)"
        replacement = (
            rf"\1price: priceMap['{tid}']?.price ?? {default_price},"
            rf"\3currency: priceMap['{tid}']?.currency ?? 'MAD',"
        )
        content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
    return content

pa = replace_prices_in_partner(pa)

# 4. Close function
pa = pa.replace(
    "];\n\n\n\nconst TIER_STYLES",
    "];\n}\n\nconst TIER_STYLES",
    1
)

# 5. In component: add priceMap state, new useEffect, update usage
# The component already has useEffect for scroll. We find the existing
# export default function and insert after the existing state declarations.
old_partner_component = (
    "export default function PartnerSubscriptionPage() {\n"
    "  const navigate = useNavigate();\n"
    "  // t used for future translations\n"
    "  const { t } = useTranslation();\n"
    "  const [openFaq, setOpenFaq] = useState<number | null>(null);\n"
    "  const [expandedTier, setExpandedTier] = useState<string | null>(null);\n"
    "  const [showStickyBar, setShowStickyBar] = useState(false);\n"
    "  const countdown = useCountdown(new Date('2026-11-25T09:00:00'));"
)
new_partner_component = (
    "export default function PartnerSubscriptionPage() {\n"
    "  const navigate = useNavigate();\n"
    "  // t used for future translations\n"
    "  const { t } = useTranslation();\n"
    "  const [openFaq, setOpenFaq] = useState<number | null>(null);\n"
    "  const [expandedTier, setExpandedTier] = useState<string | null>(null);\n"
    "  const [showStickyBar, setShowStickyBar] = useState(false);\n"
    "  const [priceMap, setPriceMap] = useState<PartnerPriceMap>({});\n"
    "  const countdown = useCountdown(new Date('2026-11-25T09:00:00'));"
)
pa = pa.replace(old_partner_component, new_partner_component, 1)

# 6. Add pricing useEffect after the scroll useEffect
# The scroll useEffect:  useEffect(() => { const onScroll = ...
# We insert a new useEffect right after it closes:  }, []);
# Find where the scroll useEffect ends and insert after it
scroll_effect_end = "    window.addEventListener('scroll', onScroll, { passive: true });\n    return () => window.removeEventListener('scroll', onScroll);\n  }, []);"
new_scroll_and_pricing = (
    "    window.addEventListener('scroll', onScroll, { passive: true });\n"
    "    return () => window.removeEventListener('scroll', onScroll);\n"
    "  }, []);\n"
    "\n"
    "  useEffect(() => {\n"
    "    supabase\n"
    "      .from('pricing_config')\n"
    "      .select('level, amount, currency')\n"
    "      .eq('category', 'partner')\n"
    "      .eq('is_active', true)\n"
    "      .then(({ data }) => {\n"
    "        if (!data) return;\n"
    "        const map: PartnerPriceMap = {};\n"
    "        data.forEach(row => {\n"
    "          const id = row.level === 'silver' ? 'partner-silver'\n"
    "            : row.level === 'gold' ? 'partner-gold'\n"
    "            : row.level === 'official_sponsor' ? 'partner-officiel' : null;\n"
    "          if (id) map[id] = { price: row.amount, currency: row.currency };\n"
    "        });\n"
    "        if (Object.keys(map).length > 0) setPriceMap(map);\n"
    "      });\n"
    "  }, []);"
)
pa = pa.replace(scroll_effect_end, new_scroll_and_pricing, 1)

# 7. Replace static partnerTiers usage with dynamic function call
# In the component, partnerTiers.map and partnerTiers.find still reference the const
# We need to add: const partnerTiers = getPartnerTiers(priceMap); before the first usage
# Insert it before the handleSubscribe function
old_handle = (
    "  const handleSubscribe = (tierId: string) => {\n"
    "    const tier = partnerTiers.find(t => t.id === tierId);"
)
new_handle = (
    "  const partnerTiers = getPartnerTiers(priceMap);\n"
    "\n"
    "  const handleSubscribe = (tierId: string) => {\n"
    "    const tier = partnerTiers.find(t => t.id === tierId);"
)
pa = pa.replace(old_handle, new_handle, 1)

with open("src/pages/PartnerSubscriptionPage.tsx", "w", encoding="utf-8") as f:
    f.write(pa)

check_pa = "setPriceMap" in pa and "getPartnerTiers" in pa
print(f"Partner done: setPriceMap={check_pa}")
