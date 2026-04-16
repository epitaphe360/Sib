import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseService } from '../services/supabaseService';

export default function ContactPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() ||
        !formData.subject || !formData.message.trim()) {
      toast.error(t('contact.required_fields'));
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('contact.invalid_email'));
      return;
    }

    // Validation longueur minimale du message
    if (formData.message.trim().length < 10) {
      toast.error(t('contact.message_too_short'));
      return;
    }

    setIsLoading(true);

    try {
      // Sauvegarde en base de données
      const result = await SupabaseService.createContactMessage({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company.trim() || undefined,
        subject: formData.subject,
        message: formData.message.trim()
      });


      // Tentative d'envoi d'email (ne bloque pas si Edge Function manquante)
      try {
        await SupabaseService.sendContactEmail({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          company: formData.company.trim(),
          subject: formData.subject,
          message: formData.message.trim()
        });
      } catch (emailError) {
        console.warn('âš ï¸ Email non envoyé (Edge Function manquante):', emailError);
        // Ne pas bloquer l'utilisateur si l'email échoue
      }

      // Navigation vers page de confirmation
      navigate('/contact/success', {
        state: {
          firstName: formData.firstName.trim(),
          email: formData.email.trim(),
          messageId: result.id
        }
      });

    } catch (error) {
      console.error('âŒ Erreur lors de l\'envoi du message:', error);
      toast.error(t('contact.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t('contact.form_title')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.first_name')} *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('contact.first_name')}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.last_name')} *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={t('contact.last_name')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.company')}
                </label>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={t('contact.company')}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.select_subject')} *
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{t('contact.select_subject')}</option>
                  <option value="exhibitor">{t('contact.subject_exhibitor')}</option>
                  <option value="visitor">{t('contact.subject_visitor')}</option>
                  <option value="partnership">{t('contact.subject_partnership')}</option>
                  <option value="support">{t('contact.subject_support')}</option>
                  <option value="other">{t('contact.subject_other')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={t('contact.message')}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.message.length} {t('contact.characters')}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('contact.sending')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t('contact.send')}
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('contact.contact_info')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contact.address')}</h3>
                    <p className="text-gray-600">
                      URBACOM<br />
                      63, Imm B, Rés LE YACHT, Bd de la Corniche 7ème étage N°185<br />
                      Casablanca 20510
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a
                      href="mailto:Sib2026@urbacom.net"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Sib2026@urbacom.net
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contact.phone')}</h3>
                    <a
                      href="tel:+212688500500"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      +212 6 88 50 05 00
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('contact.opening_hours')}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.weekdays')}</span>
                  <span className="font-medium">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.saturday')}</span>
                  <span className="font-medium">9h00 - 12h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('contact.sunday')}</span>
                  <span className="font-medium">{t('contact.closed')}</span>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('contact.follow_us')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('contact.follow_us_desc')}
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/sibs2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://linkedin.com/company/sibs2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com/sibs2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 text-white p-3 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Twitter
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


