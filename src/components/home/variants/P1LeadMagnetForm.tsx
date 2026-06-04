import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

interface LeadFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
}

/**
 * P1 — Lead Magnet Form
 * Formulaire optimisé pour la capture de leads avec CTA proéminent
 */
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simuler l'envoi du formulaire
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ email: '', firstName: '', lastName: '', company: '', phone: '' });
      }, 3000);
    }, 1500);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Merci pour votre inscription !
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Vérifiez votre boîte mail pour télécharger votre guide exclusif du SIB 2026.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400">
          <Download className="h-4 w-4" />
          <span className="text-sm font-semibold">E-book en cours de téléchargement...</span>
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
          placeholder="Prénom"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Nom"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <input
        type="email"
        name="email"
        placeholder="Adresse email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="company"
          placeholder="Entreprise"
          value={formData.company}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone"
          value={formData.phone}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        size="lg"
        className="w-full group"
      >
        <Mail className="h-5 w-5 mr-2" />
        {loading ? 'Envoi en cours...' : 'Télécharger mon guide gratuit'}
      </Button>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        Nous respectons votre vie privée. Vos données ne seront jamais partagées.
      </p>
    </motion.form>
  );
};

export default P1LeadMagnetForm;
