import React, { useState, useEffect } from 'react';
import { Sparkles, Settings } from 'lucide-react';
import MiniSiteEditor from '../components/minisite/MiniSiteEditor';
import ExhibitorMiniSiteScrapper from '../components/exhibitor/ExhibitorMiniSiteScrapper';
import useAuthStore from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

type CreationTab = 'ai' | 'manual';

function AiTabContent({
  exhibitorId,
  userId,
  onSuccess,
}: Readonly<{
  exhibitorId: string | null;
  userId: string;
  onSuccess: () => void;
}>) {
  const { t } = useTranslation();
  if (!exhibitorId) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        {t('common.loading')}
      </div>
    );
  }
  return (
    <ExhibitorMiniSiteScrapper
      exhibitorId={exhibitorId}
      userId={userId}
      onSuccess={onSuccess}
    />
  );
}

export default function MiniSiteCreationPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CreationTab>('ai');
  const [exhibitorId, setExhibitorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { return; }
    supabase
      .from('exhibitors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setExhibitorId(data?.id ?? user.id);
      });
  }, [user?.id]);

  const handleAiSuccess = () => {
    setActiveTab('manual');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Onglets */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 sm:top-20 xl:top-28 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {t('minisite.create_ai')}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-indigo-800 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            {t('minisite.full_editor')}
          </button>
        </div>
        <p className="max-w-7xl mx-auto mt-2 text-xs text-gray-400">
          {activeTab === 'ai' ? t('minisite.ai_desc') : t('minisite.manual_desc')}
        </p>
      </div>

      {/* Contenu */}
      {activeTab === 'ai' ? (
        <AiTabContent
          exhibitorId={exhibitorId}
          userId={user?.id ?? ''}
          onSuccess={handleAiSuccess}
        />
      ) : (
        <MiniSiteEditor />
      )}
    </div>
  );
}




