import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { DM } from '../../../design/designMasterTokens';

interface LeadFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
}

/** P1 — Formulaire lead magnet */
export const P1LeadMagnetForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LeadFormData>({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ email: '', firstName: '', lastName: '', company: '', phone: '' });
      }, 3000);
    }, 1500);
  };

  const inputClass =
    'px-4 py-3 rounded-xl border border-[#001A3D]/12 bg-white text-[#001A3D] placeholder-[#001A3D]/40 focus:outline-none focus:ring-2 focus:ring-[#F39200]/50';

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="h-14 w-14 mx-auto mb-4" style={{ color: '#2D6A4F' }} />
        <h3 className="text-2xl font-black mb-2" style={{ color: DM.navy }}>
          {t('home.p1_lead.success_title')}
        </h3>
        <p className="text-[#001A3D]/65 mb-6">{t('home.p1_lead.success_desc')}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-sm font-semibold">
          <Download className="h-4 w-4" />
          {t('home.p1_lead.success_download')}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder={t('home.p1_lead.ph_first')}
          value={formData.firstName}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          type="text"
          name="lastName"
          placeholder={t('home.p1_lead.ph_last')}
          value={formData.lastName}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <input
        type="email"
        name="email"
        placeholder={t('home.p1_lead.ph_email')}
        value={formData.email}
        onChange={handleChange}
        required
        className={`w-full ${inputClass}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="company"
          placeholder={t('home.p1_lead.ph_company')}
          value={formData.company}
          onChange={handleChange}
          className={inputClass}
        />
        <input
          type="tel"
          name="phone"
          placeholder={t('home.p1_lead.ph_phone')}
          value={formData.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        size="lg"
        className="w-full group rounded-full"
        style={{ backgroundColor: DM.orange }}
      >
        <Mail className="h-5 w-5 mr-2" />
        {loading ? t('home.p1_lead.submitting') : t('home.p1_lead.submit')}
      </Button>

      <p className="text-xs text-[#001A3D]/45 text-center">{t('home.p1_lead.privacy')}</p>
    </motion.form>
  );
};

export default P1LeadMagnetForm;
