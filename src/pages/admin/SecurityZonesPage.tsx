import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Pencil, Trash2, RotateCcw,
  Shield, X, Check, AlertTriangle, GripVertical, ArrowLeft
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/routes';
import {
  getZones, addZone, updateZone, deleteZone, resetZones,
  ControlZone
} from '../../services/zonesService';
import { useTranslation } from '../../hooks/useTranslation';

const EMOJI_OPTIONS = [
  '🌐','🏛️','⭐','🤝','🎭','💼','🏢','🔧','🚪','🔑','🛡️','📍','🎯','🏗️','🔬',
  '🎪','🏆','💡','📡','🚧','🎫','🏨','🏬','🏟️','🎬','🎙️','🎤','📺','💻','🖥️',
];

interface ZoneForm {
  name: string;
  icon: string;
  description: string;
}

const emptyForm: ZoneForm = { name: '', icon: '📍', description: '' };

export default function SecurityZonesPage() {
  const { t } = useTranslation();
  const [zones, setZones] = useState<ControlZone[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editZone, setEditZone] = useState<ControlZone | null>(null);
  const [form, setForm] = useState<ZoneForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setZones(getZones());
  }, []);

  const refresh = () => setZones(getZones());

  const openAdd = () => {
    setEditZone(null);
    setForm(emptyForm);
    setShowModal(true);
    setShowEmojiPicker(false);
  };

  const openEdit = (zone: ControlZone) => {
    setEditZone(zone);
    setForm({ name: zone.name, icon: zone.icon, description: zone.description });
    setShowModal(true);
    setShowEmojiPicker(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditZone(null);
    setForm(emptyForm);
    setShowEmojiPicker(false);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error(t('admin.zones_name_required'));
      return;
    }
    if (editZone) {
      updateZone(editZone.id, { name: form.name.trim(), icon: form.icon, description: form.description.trim() });
      toast.success(`${t('admin.zones_zone')} "${form.name}" ${t('admin.zones_modified')}`);
    } else {
      addZone({ name: form.name.trim(), icon: form.icon, description: form.description.trim() });
      toast.success(`${t('admin.zones_zone')} "${form.name}" ${t('admin.zones_created')}`);
    }
    refresh();
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteZone(id);
    toast.success(t('admin.zones_deleted'));
    setConfirmDelete(null);
    refresh();
  };

  const handleReset = () => {
    resetZones();
    toast.success(t('admin.zones_reset_success'));
    setConfirmReset(false);
    refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back_to_dashboard')}
      </Link>
      {/* ── Modal Ajout / Édition ──────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editZone ? t('admin.zones_edit') : t('admin.zones_new')}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                {/* Icône */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {t('admin.zones_form_icon')}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowEmojiPicker(v => !v)}
                      className="w-12 h-12 text-2xl border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors"
                    >
                      {form.icon}
                    </button>
                    <span className="text-sm text-gray-500">{t('admin.zones_icon_click')}</span>
                  </div>
                  {showEmojiPicker && (
                    <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 grid grid-cols-10 gap-1">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => { setForm(f => ({ ...f, icon: emoji })); setShowEmojiPicker(false); }}
                          className={`text-xl p-1 rounded hover:bg-blue-100 transition-colors ${form.icon === emoji ? 'bg-blue-200 ring-2 ring-blue-400' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {t('admin.zones_form_name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t('admin.zones_name_ph')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={50}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {t('common.description')}
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t('admin.zones_desc_ph')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Check className="h-4 w-4 mr-1.5" />
                  {editZone ? t('common.save') : t('common.create')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Reset ────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setConfirmReset(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('admin.zones_reset_title')}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('admin.zones_reset_desc')}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {t('admin.zones_reset_btn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Page Content ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('admin.zones_title')}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {zones.length} zone{zones.length === 1 ? '' : 's'} configurée{zones.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              {t('admin.zones_reset_btn')}
            </button>
            <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" />
              {t('admin.zones_new')}
            </Button>
          </div>
        </div>

        {/* Zones list */}
        <Card className="overflow-hidden">
          {zones.length === 0 ? (
            <div className="py-16 text-center">
              <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('admin.zones_empty')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('admin.zones_empty_hint')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {zones.map((zone, idx) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  {/* Drag handle (visuel uniquement) */}
                  <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0 cursor-grab" />

                  {/* Icône */}
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                    {zone.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">{zone.name}</span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        {zone.id}
                      </span>
                    </div>
                    {zone.description && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">{zone.description}</p>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    {new Date(zone.createdAt).toLocaleDateString('fr-FR')}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(zone)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {confirmDelete === zone.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                          title="Confirmer la suppression"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Annuler"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(zone.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Info footer */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Ces zones sont utilisées dans le scanner de contrôle d'accès (<code>/security/scanner</code>).
          Les modifications sont appliquées immédiatement.
        </p>
      </div>
    </div>
  );
}
