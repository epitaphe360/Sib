import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, Image as ImageIcon, Video, Trash2,
  Search, Grid3x3, List, Copy, Check, X, Eye, Filter,
  FolderOpen, RefreshCw, Download, Tag, Calendar,
} from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../../hooks/useTranslation';

// ─── Types ───────────────────────────────────────────────────────────────────

type AssetType = 'all' | 'image' | 'video';
type Category =
  | 'all'
  | 'salon'
  | 'stands'
  | 'conferences'
  | 'promotionnel'
  | 'logos'
  | 'speakers'
  | 'spots'
  | 'autre';

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number; // bytes
  category: Category;
  tags: string[];
  created_at: string;
  bucket_path: string;
}

const BUCKET = 'media-library';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'Toutes',
  salon: 'Photos Salon',
  stands: 'Stands Exposants',
  conferences: 'Conférences',
  promotionnel: 'Promotionnel',
  logos: 'Logos & Identité',
  speakers: 'Intervenants',
  spots: 'Spots Vidéo',
  autre: 'Autre',
};

const CATEGORY_COLORS: Record<Exclude<Category, 'all'>, string> = {
  salon: '#6366f1',
  stands: '#10b981',
  conferences: '#f59e0b',
  promotionnel: '#ef4444',
  logos: '#8b5cf6',
  speakers: '#0ea5e9',
  spots: '#ec4899',
  autre: '#64748b',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function MediaLibraryPage() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Category>('autre');
  const [uploadTags, setUploadTags] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAssets(data ?? []);
    } catch {
      // Fallback: lire depuis storage si table n'existe pas encore
      try {
        const { data: files } = await supabase.storage.from(BUCKET).list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
        const mapped: MediaAsset[] = (files ?? []).filter(f => f.name !== '.emptyFolderPlaceholder').map(f => {
          const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
          const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return {
            id: f.id ?? f.name,
            name: f.name,
            url: urlData.publicUrl,
            type: isVideo ? 'video' : 'image',
            size: f.metadata?.size ?? 0,
            category: 'autre',
            tags: [],
            created_at: f.created_at ?? new Date().toISOString(),
            bucket_path: f.name,
          };
        });
        setAssets(mapped);
      } catch {
        toast.error(t('admin.media_lib_load_error'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    const tags = uploadTags.split(',').map(tag => tag.trim()).filter(Boolean);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
      const timestamp = Date.now();
      const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${uploadCategory}/${timestamp}_${safeName}`;

      try {
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

        // Essayer d'insérer en base
        try {
          await supabase.from('media_assets').insert({
            name: file.name,
            url: urlData.publicUrl,
            type: isVideo ? 'video' : 'image',
            size: file.size,
            category: uploadCategory,
            tags,
            bucket_path: path,
          });
        } catch {
          // Table peut ne pas exister encore, c'est ok
        }

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        toast.success(`${file.name} ${t('admin.media_lib_uploaded')}`);
      } catch (err: any) {
        toast.error(`${t('admin.media_lib_upload_error')} ${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    await loadAssets();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Copier URL ───────────────────────────────────────────────────────────────
  const copyUrl = async (asset: MediaAsset) => {
    await navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    toast.success(t('admin.media_lib_url_copied'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Supprimer ────────────────────────────────────────────────────────────────
  const handleDelete = async (asset: MediaAsset) => {
    try {
      await supabase.storage.from(BUCKET).remove([asset.bucket_path]);
      try { await supabase.from('media_assets').delete().eq('id', asset.id); } catch { /* ok */ }
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      setDeleteConfirm(null);
      toast.success(t('admin.media_lib_deleted'));
    } catch (err: any) {
      toast.error(`${t('admin.media_lib_delete_error')}: ${err.message}`);
    }
  };

  // ── Filtrage ─────────────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const counts = {
    all: assets.length,
    image: assets.filter(a => a.type === 'image').length,
    video: assets.filter(a => a.type === 'video').length,
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back_to_dashboard')}
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.media_lib_title')}</h1>
              <p className="text-gray-500 mt-1">{t('admin.media_lib_subtitle')} — {assets.length} {t('admin.media_lib_file_count', { count: assets.length })}</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition-all"
            >
              <Upload className="w-4 h-4" />
              {t('admin.media_lib_upload_btn')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Upload options bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">{t('admin.media_lib_upload_cat')} :</span>
          </div>
          <select
            value={uploadCategory}
            onChange={e => setUploadCategory(e.target.value as Category)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {(Object.keys(CATEGORY_LABELS) as Category[]).filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <input
            type="text"
            value={uploadTags}
            onChange={e => setUploadTags(e.target.value)}
            placeholder={t('admin.media_lib_tags_ph')}
            className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Zone de drag & drop */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!uploading) fileInputRef.current?.click(); } }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-indigo-700">{t('admin.media_lib_uploading')} {uploadProgress}%</p>
              <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 font-medium">
                {dragOver ? t('admin.media_lib_drop') : t('admin.media_lib_drag')}
              </p>
              <p className="text-xs text-gray-400">{t('admin.media_lib_formats')}</p>
            </div>
          )}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Type filter */}
            {(['all', 'image', 'video'] as AssetType[]).map(atype => (
              <button
                key={atype}
                onClick={() => setTypeFilter(atype)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === atype
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {atype === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                {atype === 'video' && <Video className="w-3.5 h-3.5" />}
                {atype === 'all' ? t('common.all') : atype === 'image' ? t('admin.media_lib_images') : t('admin.media_lib_videos')}
                <span className="ml-1 text-xs opacity-70">({counts[atype]})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as Category)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('common.search_ellipsis')}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* View mode */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button onClick={loadAssets} title="Rafraîchir" className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grille ou liste */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`sk-${i}`} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FolderOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">{t('admin.media_lib_no_files')}</p>
            <p className="text-gray-300 text-sm mt-1">{t('admin.media_lib_no_files_hint')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(asset => (
              <div
                key={asset.id}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAsset(asset); } }}
                className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
                      <Video className="w-10 h-10 text-white/60" />
                    </div>
                  )}
                </div>

                {/* Category badge */}
                {asset.category !== 'autre' && (
                  <div
                    className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: CATEGORY_COLORS[asset.category as Exclude<Category, 'all'>] }}
                  >
                    {CATEGORY_LABELS[asset.category]}
                  </div>
                )}

                {/* Video badge */}
                {asset.type === 'video' && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Video className="w-3 h-3" /> VID
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); copyUrl(asset); }}
                    className="p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Copier URL"
                  >
                    {copiedId === asset.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedAsset(asset); }}
                    className="p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(asset.id); }}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Name */}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate font-medium">{asset.name}</p>
                  <p className="text-[10px] text-gray-400">{formatBytes(asset.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Liste */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">{t('common.file')}</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">{t('common.type')}</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">{t('common.category')}</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">{t('common.size')}</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">{t('common.date')}</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {asset.type === 'image'
                            ? <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
                            : <div className="w-full h-full flex items-center justify-center bg-purple-100"><Video className="w-5 h-5 text-purple-400" /></div>
                          }
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        asset.type === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {asset.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {asset.type === 'image' ? t('admin.media_lib_image_type') : t('admin.media_lib_video_type')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[asset.category]}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatBytes(asset.size)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(asset.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => copyUrl(asset)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors" title="Copier URL">
                          {copiedId === asset.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors" title="Ouvrir">
                          <Eye className="w-4 h-4" />
                        </a>
                        <a href={asset.url} download className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors" title="Télécharger">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => setDeleteConfirm(asset.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal aperçu */}
      {selectedAsset && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fermer l'aperçu"
          onKeyDown={e => { if (e.key === 'Escape') setSelectedAsset(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            role="document"
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 truncate">{selectedAsset.name}</h3>
              <button onClick={() => setSelectedAsset(null)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-950 flex items-center justify-center" style={{ minHeight: 300, maxHeight: 500 }}>
              {selectedAsset.type === 'image' ? (
                <img src={selectedAsset.url} alt={selectedAsset.name} className="max-h-[500px] max-w-full object-contain" />
              ) : (
                <video src={selectedAsset.url} controls className="max-h-[500px] max-w-full">
                  <track kind="captions" />
                </video>
              )}
            </div>
            <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p><span className="font-medium text-gray-700">{t('common.size')} :</span> {formatBytes(selectedAsset.size)}</p>
                <p><span className="font-medium text-gray-700">{t('common.category')} :</span> {CATEGORY_LABELS[selectedAsset.category]}</p>
                <p><span className="font-medium text-gray-700">{t('common.date')} :</span> {formatDate(selectedAsset.created_at)}</p>
                {selectedAsset.tags.length > 0 && (
                  <p><span className="font-medium text-gray-700">Tags :</span> {selectedAsset.tags.join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyUrl(selectedAsset)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  {copiedId === selectedAsset.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedId === selectedAsset.id ? t('admin.media_lib_copied') : t('admin.media_lib_copy_url')}
                </button>
                <a
                  href={selectedAsset.url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" /> {t('common.download')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('admin.media_lib_delete_title')}</h3>
                <p className="text-sm text-gray-500">{t('admin.media_lib_delete_irreversible')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  const asset = assets.find(a => a.id === deleteConfirm);
                  if (asset) handleDelete(asset);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
