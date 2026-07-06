import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileJson, Loader2, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import { getPageContent, savePageContent } from '../../../lib/pageContent';
import {
  VITRINE_PAGE_SLUGS,
  PAGE_CONTENT_GROUPS,
  PAGE_CONTENT_FIELD_HINTS,
} from '../../../config/pageContentAdminConfig';

type Props = { embedded?: boolean };

export function PageContentAdminPanel({ embedded = false }: Props) {
  const [activeGroup, setActiveGroup] = useState(PAGE_CONTENT_GROUPS[0].id);
  const [activeSlug, setActiveSlug] = useState(PAGE_CONTENT_GROUPS[0].slugs[0]);
  const [jsonDraft, setJsonDraft] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const group = PAGE_CONTENT_GROUPS.find((g) => g.id === activeGroup) ?? PAGE_CONTENT_GROUPS[0];

  const pagesInGroup = useMemo(
    () => VITRINE_PAGE_SLUGS.filter((p) => (group.slugs as readonly string[]).includes(p.slug)),
    [group],
  );

  const loadSlug = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const content = await getPageContent(slug);
      setJsonDraft(JSON.stringify(content, null, 2));
    } catch {
      setJsonDraft('{}');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlug(activeSlug);
  }, [activeSlug, loadSlug]);

  const handleGroupChange = (groupId: string) => {
    const next = PAGE_CONTENT_GROUPS.find((g) => g.id === groupId);
    if (!next) return;
    setActiveGroup(groupId);
    setActiveSlug(next.slugs[0]);
  };

  const handleSave = async () => {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(jsonDraft) as Record<string, string>;
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Le JSON doit être un objet { "cle": "valeur" }');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'JSON invalide');
      return;
    }

    setSaving(true);
    try {
      await savePageContent(activeSlug, parsed);
      toast.success('Page enregistrée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const meta = VITRINE_PAGE_SLUGS.find((p) => p.slug === activeSlug);
  const hints = PAGE_CONTENT_FIELD_HINTS[activeSlug] ?? [];

  return (
    <motion.section
      initial={embedded ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        embedded
          ? 'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm'
          : 'mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileJson className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Pages vitrine — contenu CMS</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {group.description}. Les clés absentes utilisent les valeurs par défaut du code.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadSlug(activeSlug)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        {PAGE_CONTENT_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => handleGroupChange(g.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeGroup === g.id
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {pagesInGroup.map((page) => (
          <button
            key={page.slug}
            type="button"
            onClick={() => setActiveSlug(page.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeSlug === page.slug
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {meta && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <a
            href={meta.route}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
          >
            Aperçu {meta.route} <ExternalLink className="h-3 w-3" />
          </a>
          {activeSlug === 'programme_scientifique' && (
            <a
              href="/admin/events"
              className="inline-flex items-center gap-1 text-xs text-accent-700 hover:underline font-medium"
            >
              Éditeur structuré programme → /admin/events
            </a>
          )}
        </div>
      )}

      {hints.length > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
          Clés fréquentes : {hints.join(', ')}
        </p>
      )}

      <textarea
        value={jsonDraft}
        onChange={(e) => setJsonDraft(e.target.value)}
        disabled={loading}
        spellCheck={false}
        className="w-full min-h-[280px] font-mono text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-4 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder='{ "hero_title": "Mon titre", "stat_exposants": "600" }'
      />
    </motion.section>
  );
}
