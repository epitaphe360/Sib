import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Mail, Phone, MapPin, Globe, Loader2, CheckCircle, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';

interface PartnerProfileEditorProps {
  partnerId: string;
  onSave?: () => void;
}

interface PartnerProfile {
  company_name: string;
  description: string;
  sector: string;
  logo_url?: string;
  website?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  services?: string[];
  founded_year?: number;
  employee_count?: string;
}

export default function PartnerProfileEditor({ partnerId, onSave }: PartnerProfileEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile>({
    company_name: '',
    description: '',
    sector: '',
    services: []
  });
  const [newService, setNewService] = useState('');

  useEffect(() => {
    loadProfile();
  }, [partnerId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('partner_profiles')
        .select('company_name, description, sector, logo_url, website, contact_info, services, founded_year, employee_count')
        .eq('user_id', partnerId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          company_name: data.company_name || '',
          description: data.description || '',
          sector: data.sector || '',
          logo_url: data.logo_url,
          website: data.website,
          contact_info: data.contact_info || {},
          services: data.services || [],
          founded_year: data.founded_year,
          employee_count: data.employee_count
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement profil:', error);
      toast.error('Impossible de charger le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.company_name.trim()) {
      toast.error('Le nom de l\'entreprise est requis');
      return;
    }

    setIsSaving(true);
    const savingToast = toast.loading('💾 Sauvegarde en cours...');

    try {
      const { error } = await supabase
        .from('partner_profiles')
        .update({
          company_name: profile.company_name,
          description: profile.description,
          sector: profile.sector,
          logo_url: profile.logo_url,
          website: profile.website,
          contact_info: profile.contact_info,
          services: profile.services,
          founded_year: profile.founded_year,
          employee_count: profile.employee_count,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', partnerId);

      if (error) throw error;

      toast.dismiss(savingToast);
      toast.success('✅ Profil sauvegardé avec succès!');

      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      toast.dismiss(savingToast);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = () => {
    if (!newService.trim()) return;
    setProfile({
      ...profile,
      services: [...(profile.services || []), newService.trim()]
    });
    setNewService('');
  };

  const handleRemoveService = (index: number) => {
    setProfile({
      ...profile,
      services: profile.services?.filter((_, i) => i !== index) || []
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Edit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Modifier mon profil</h3>
            <p className="text-sm text-gray-600">Personnalisez vos informations publiques</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Informations de base
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <select
                value={profile.sector}
                onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                <option value="maritime">Maritime</option>
                <option value="logistique">Logistique</option>
                <option value="technologie">Technologie</option>
                <option value="finance">Finance</option>
                <option value="industrie">Industrie</option>
                <option value="services">Services</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez votre entreprise, vos activités et votre expertise..."
              />
              <p className="text-xs text-gray-500 mt-1">{profile.description.length} / 500 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Année de création
              </label>
              <input
                type="number"
                value={profile.founded_year || ''}
                onChange={(e) => setProfile({ ...profile, founded_year: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre d'employés
              </label>
              <select
                value={profile.employee_count || ''}
                onChange={(e) => setProfile({ ...profile, employee_count: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                <option value="1-10">1-10 employés</option>
                <option value="11-50">11-50 employés</option>
                <option value="51-100">51-100 employés</option>
                <option value="101-500">101-500 employés</option>
                <option value="500+">500+ employés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-bold text-gray-900">Services offerts</h4>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ajouter un service..."
            />
            <Button
              onClick={handleAddService}
              disabled={!newService.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Ajouter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.services?.map((service, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2"
              >
                <span className="text-sm font-semibold">{service}</span>
                <button
                  onClick={() => handleRemoveService(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
            {(!profile.services || profile.services.length === 0) && (
              <p className="text-sm text-gray-500 italic">Aucun service ajouté</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-bold text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Informations de contact
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" /> Email
              </label>
              <input
                type="email"
                value={profile.contact_info?.email || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  contact_info: { ...profile.contact_info, email: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@entreprise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" /> Téléphone
              </label>
              <input
                type="tel"
                value={profile.contact_info?.phone || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  contact_info: { ...profile.contact_info, phone: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+212 X XX XX XX XX"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" /> Adresse
              </label>
              <input
                type="text"
                value={profile.contact_info?.address || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  contact_info: { ...profile.contact_info, address: e.target.value }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Rue Example, Casablanca, Maroc"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-1" /> Site web
              </label>
              <input
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.entreprise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={profile.logo_url || ''}
                onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-bold text-gray-900">Réseaux sociaux</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={profile.contact_info?.social?.linkedin || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  contact_info: {
                    ...profile.contact_info,
                    social: { ...profile.contact_info?.social, linkedin: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={profile.contact_info?.social?.twitter || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  contact_info: {
                    ...profile.contact_info,
                    social: { ...profile.contact_info?.social, twitter: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={profile.contact_info?.social?.facebook || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  contact_info: {
                    ...profile.contact_info,
                    social: { ...profile.contact_info?.social, facebook: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bouton de sauvegarde en bas */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
