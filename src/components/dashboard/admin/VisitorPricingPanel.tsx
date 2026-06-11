import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { formatVisitorAmount } from '../../../config/visitorBankTransferConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  fetchVipPassPricing,
  fetchVisitorLevelsForAdmin,
  updateVipPassPrice,
} from '../../../services/visitorLevelService';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export function VisitorPricingPanel() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pricing, levels] = await Promise.all([
        fetchVipPassPricing(true),
        fetchVisitorLevelsForAdmin(),
      ]);
      setCurrentPrice(pricing.price);
      setPriceInput(String(pricing.price));
      const premium = levels.find((l) => l.level === 'premium') ?? levels.find((l) => l.level === 'vip');
      setUpdatedAt(premium?.updated_at ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.visitor_pricing.load_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseFloat(priceInput.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error(t('admin.visitor_pricing.invalid_price'));
      return;
    }

    setSaving(true);
    try {
      await updateVipPassPrice(parsed);
      setCurrentPrice(parsed);
      toast.success(t('admin.visitor_pricing.saved'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.visitor_pricing.save_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      id="visitor-pricing"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.68 }}
      className="mb-8 scroll-mt-24"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-6 py-4 flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('admin.visitor_pricing.title')}</h3>
            <p className="text-sm text-white/85">{t('admin.visitor_pricing.desc')}</p>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-500 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('admin.visitor_pricing.loading')}
            </div>
          ) : (
            <form onSubmit={handleSave} className="max-w-md space-y-4">
              {currentPrice != null && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    {t('admin.visitor_pricing.current')}
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {formatVisitorAmount(currentPrice, 'MAD')}
                  </p>
                  {updatedAt && (
                    <p className="text-xs text-amber-700/80 dark:text-amber-300/70 mt-1">
                      {t('admin.visitor_pricing.updated_at', {
                        date: new Date(updatedAt).toLocaleString('fr-FR'),
                      })}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="vip-price" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('admin.visitor_pricing.new_price')}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="vip-price"
                    type="number"
                    min={1}
                    step={0.01}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">MAD</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {t('admin.visitor_pricing.hint')}
                </p>
              </div>

              <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('admin.visitor_pricing.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('admin.visitor_pricing.save')}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
