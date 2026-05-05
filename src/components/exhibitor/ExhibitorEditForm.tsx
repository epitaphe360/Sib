import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  ArrowLeft,
  Building,
  Globe,
  Tag,
  ClipboardCheck,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  DollarSign,
  Award as AwardIcon
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { toast } from 'sonner';
import ImageUploader from '../ui/upload/ImageUploader';
import { SupabaseService } from '../../services/supabaseService';
import { StorageService } from '../../services/storageService';
import { Exhibitor, ExhibitorCategory } from '../../types';

// Zod validation schema
const exhibitorEditSchema = z.object({
  companyName: z.string()
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne doit pas dépasser 200 caractères'),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne doit pas dépasser 2000 caractères'),
  category: z.enum(['bâtiment-industry', 'bâtiment-operations', 'institutional', 'academic'] as const, {
    required_error: 'La catégorie est requise'
  }),
  sector: z.string()
    .min(1, 'Le secteur d\'activité est requis')
    .max(100, 'Le secteur ne doit pas dépasser 100 caractères'),
  website: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  contactInfo: z.object({
    email: z.string()
      .email('Email invalide')
      .optional()
      .or(z.literal('')),
    phone: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide (format international)')
      .optional()
      .or(z.literal('')),
    address: z.string()
      .max(200, 'L\'adresse ne doit pas dépasser 200 caractères')
      .optional()
      .or(z.literal('')),
    city: z.string()
      .max(100, 'La ville ne doit pas dépasser 100 caractères')
      .optional()
      .or(z.literal('')),
    country: z.string()
      .max(100, 'Le pays ne doit pas dépasser 100 caractères')
      .optional()
      .or(z.literal('')),
    zipCode: z.string()
      .max(20, 'Le code postal ne doit pas dépasser 20 caractères')
      .optional()
      .or(z.literal('')),
    contactPerson: z.string()
      .max(100, 'Le nom de la personne ne doit pas dépasser 100 caractères')
      .optional()
      .or(z.literal(''))
  }),
  establishedYear: z.string()
    .regex(/^\d{4}$/, 'Année invalide (format: YYYY)')
    .refine((year) => {
      const yearNum = parseInt(year, 10);
      return yearNum >= 1800 && yearNum <= new Date().getFullYear();
    }, 'L\'année doit être entre 1800 et aujourd\'hui')
    .optional()
    .or(z.literal('')),
  employeeCount: z.string()
    .regex(/^\d+$/, 'Doit être un nombre entier')
    .optional()
    .or(z.literal('')),
  revenue: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Doit être un nombre valide')
    .optional()
    .or(z.literal('')),
  certifications: z.string()
    .max(500, 'Les certifications ne doivent pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  markets: z.string()
    .max(500, 'Les marchés ne doivent pas dépasser 500 caractères')
    .optional()
    .or(z.literal(''))
});

type ExhibitorFormData = z.infer<typeof exhibitorEditSchema>;

export default function ExhibitorEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { exhibitors, selectedExhibitor, selectExhibitor, updateExhibitorInStore, fetchExhibitors } = useExhibitorStore();
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState('');

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ExhibitorFormData>({
    resolver: zodResolver(exhibitorEditSchema),
    defaultValues: {
      companyName: '',
      description: '',
      category: 'bâtiment-industry',
      sector: '',
      website: '',
      contactInfo: {
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
        contactPerson: ''
      },
      establishedYear: '',
      employeeCount: '',
      revenue: '',
      certifications: '',
      markets: ''
    }
  });

  // Watch form values for preview
  const formValues = watch();

  // Charger les données de l'exposant
  useEffect(() => {
    if (exhibitors.length === 0) {
      fetchExhibitors();
    }
  }, [exhibitors.length, fetchExhibitors]);

  useEffect(() => {
    if (id) {
      selectExhibitor(id);
    }
  }, [id, selectExhibitor, exhibitors]);

  // Remplir le formulaire avec les données de l'exposant sélectionné
  useEffect(() => {
    if (selectedExhibitor) {
      reset({
        companyName: selectedExhibitor.companyName || '',
        description: selectedExhibitor.description || '',
        category: selectedExhibitor.category || 'bâtiment-industry',
        sector: selectedExhibitor.sector || '',
        website: selectedExhibitor.website || '',
        contactInfo: {
          email: selectedExhibitor.contactInfo?.email || '',
          phone: selectedExhibitor.contactInfo?.phone || '',
          address: selectedExhibitor.contactInfo?.address || '',
          city: selectedExhibitor.contactInfo?.city || '',
          country: selectedExhibitor.contactInfo?.country || '',
          zipCode: selectedExhibitor.contactInfo?.zipCode || '',
          contactPerson: selectedExhibitor.contactInfo?.contactPerson || ''
        },
        establishedYear: selectedExhibitor.establishedYear?.toString() || '',
        employeeCount: selectedExhibitor.employeeCount?.toString() || '',
        revenue: selectedExhibitor.revenue?.toString() || '',
        certifications: (selectedExhibitor.certifications || []).join(', '),
        markets: (selectedExhibitor.markets || []).join(', ')
      });
      setLogo(selectedExhibitor.logo || '');
    }
  }, [selectedExhibitor, reset]);

  const handleLogoUploaded = (url: string) => {
    setLogo(url);
  };

  const handleSubmit = async (data: ExhibitorFormData) => {
    setIsLoading(true);

    try {
      if (!id) {
        throw new Error('ID de l\'exposant non défini');
      }

      // Télécharger l'image du logo depuis l'ancienne URL si c'est une URL locale
      let logoUrl = logo;
      if (logoUrl && logoUrl.startsWith('/')) {
        try {
          // Note: Le bucket exhibitor-logos est créé via les migrations SQL

          // Convertir l'URL locale en URL Supabase
          logoUrl = await StorageService.uploadImageFromUrl(
            window.location.origin + logoUrl,
            'exhibitor-logos',
            'logos'
          );
        } catch (error) {
          console.error('Erreur lors du téléchargement du logo:', error);
          // Continuer avec l'ancienne URL en cas d'erreur
        }
      }

      // Convert string arrays to arrays
      const certificationsArray = data.certifications
        ? data.certifications.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      const marketsArray = data.markets
        ? data.markets.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      // Préparer les données pour la mise à jour
      const exhibitorData: Partial<Exhibitor> = {
        companyName: data.companyName,
        description: data.description,
        category: data.category,
        sector: data.sector,
        logo: logoUrl,
        website: data.website || '',
        contactInfo: {
          email: data.contactInfo.email || '',
          phone: data.contactInfo.phone || '',
          address: data.contactInfo.address || '',
          city: data.contactInfo.city || '',
          country: data.contactInfo.country || '',
          zipCode: data.contactInfo.zipCode || '',
          contactPerson: data.contactInfo.contactPerson || '',
        },
        establishedYear: data.establishedYear ? parseInt(data.establishedYear, 10) : undefined,
        employeeCount: data.employeeCount || '',
        revenue: data.revenue || '',
        certifications: certificationsArray,
        markets: marketsArray,
      };

      // Mise à jour dans Supabase
      await SupabaseService.updateExhibitor(id, exhibitorData);

      // Mise à jour du store local
      updateExhibitorInStore(id, exhibitorData);

      toast.success('Exposant mis à jour avec succès !');
      navigate(`/exhibitors/${id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant le chargement des données
  if (exhibitors.length === 0 || !selectedExhibitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Entête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate(`/exhibitors/${id}`)} className="mr-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier {formValues.companyName}
            </h1>
          </div>
          <Button
            onClick={handleFormSubmit(handleSubmit)}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleFormSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Informations de l'entreprise
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      {...register('companyName')}
                      className={`w-full px-3 py-2 border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.companyName ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      aria-label="Company Name"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        {...register('category')}
                        className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      >
                        <option value="bâtiment-industry">Industrie du Bâtiment</option>
                        <option value="bâtiment-operations">Opérations du Bâtiment</option>
                        <option value="institutional">Institutionnel</option>
                        <option value="academic">Académique</option>
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secteur d'activité *
                      </label>
                      <input
                        type="text"
                        {...register('sector')}
                        className={`w-full px-3 py-2 border ${errors.sector ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.sector ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="ex: Bâtiment, Transport, Énergie..."
                        aria-label="ex: Bâtiment, Transport, Énergie..."
                      />
                      {errors.sector && (
                        <p className="text-red-500 text-sm mt-1">{errors.sector.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site web
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <Globe className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="url"
                        {...register('website')}
                        className={`w-full px-3 py-2 border ${errors.website ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.website ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="https://www.exemple.com"
                        aria-label="https://www.exemple.com"
                      />
                    </div>
                    {errors.website && (
                      <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Coordonnées
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de contact
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          {...register('contactInfo.email')}
                          className={`w-full px-3 py-2 border ${errors.contactInfo?.email ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.contactInfo?.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                          placeholder="contact@exemple.com"
                          aria-label="contact@exemple.com"
                        />
                      </div>
                      {errors.contactInfo?.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactInfo.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Phone className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="tel"
                          {...register('contactInfo.phone')}
                          className={`w-full px-3 py-2 border ${errors.contactInfo?.phone ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.contactInfo?.phone ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                          placeholder="+33 1 23 45 67 89"
                          aria-label="+33 1 23 45 67 89"
                        />
                      </div>
                      {errors.contactInfo?.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactInfo.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      {...register('contactInfo.address')}
                      className={`w-full px-3 py-2 border ${errors.contactInfo?.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.contactInfo?.address ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="123 Rue Exemple, 75000 Paris, France"
                      aria-label="123 Rue Exemple, 75000 Paris, France"
                    />
                    {errors.contactInfo?.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactInfo.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        {...register('contactInfo.city')}
                        className={`w-full px-3 py-2 border ${errors.contactInfo?.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.contactInfo?.city ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="Paris"
                        aria-label="Paris"
                      />
                      {errors.contactInfo?.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactInfo.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <input
                        type="text"
                        {...register('contactInfo.country')}
                        className={`w-full px-3 py-2 border ${errors.contactInfo?.country ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.contactInfo?.country ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="France"
                        aria-label="France"
                      />
                      {errors.contactInfo?.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactInfo.country.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personne de contact
                    </label>
                    <input
                      type="text"
                      {...register('contactInfo.contactPerson')}
                      className={`w-full px-3 py-2 border ${errors.contactInfo?.contactPerson ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.contactInfo?.contactPerson ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="Jean Dupont"
                      aria-label="Jean Dupont"
                    />
                    {errors.contactInfo?.contactPerson && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactInfo.contactPerson.message}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Informations supplémentaires
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année de création
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          {...register('establishedYear')}
                          className={`w-full px-3 py-2 border ${errors.establishedYear ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.establishedYear ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                          placeholder="ex: 2010"
                          aria-label="ex: 2010"
                        />
                      </div>
                      {errors.establishedYear && (
                        <p className="text-red-500 text-sm mt-1">{errors.establishedYear.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre d'employés
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          {...register('employeeCount')}
                          className={`w-full px-3 py-2 border ${errors.employeeCount ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.employeeCount ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                          placeholder="ex: 250"
                          aria-label="ex: 250"
                        />
                      </div>
                      {errors.employeeCount && (
                        <p className="text-red-500 text-sm mt-1">{errors.employeeCount.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chiffre d'affaires (M€)
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <DollarSign className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          {...register('revenue')}
                          className={`w-full px-3 py-2 border ${errors.revenue ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.revenue ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                          placeholder="ex: 42"
                          aria-label="ex: 42"
                        />
                      </div>
                      {errors.revenue && (
                        <p className="text-red-500 text-sm mt-1">{errors.revenue.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications (séparées par des virgules)
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <AwardIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        {...register('certifications')}
                        className={`w-full px-3 py-2 border ${errors.certifications ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.certifications ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="ISO 9001, ISO 14001, OHSAS 18001..."
                      />
                    </div>
                    {errors.certifications && (
                      <p className="text-red-500 text-sm mt-1">{errors.certifications.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marchés (séparés par des virgules)
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <Tag className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        {...register('markets')}
                        className={`w-full px-3 py-2 border ${errors.markets ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 ${errors.markets ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="Europe, Afrique, Asie..."
                      />
                    </div>
                    {errors.markets && (
                      <p className="text-red-500 text-sm mt-1">{errors.markets.message}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Colonne de droite (Logo et aperçu) */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Logo de l'entreprise
                </h2>

                <ImageUploader
                  onImageUploaded={handleLogoUploaded}
                  initialImageUrl={logo}
                  bucket="exhibitor-logos"
                  folder="logos"
                  maxSizeMB={2}
                />

                <p className="text-sm text-gray-500 mt-4">
                  Format recommandé: PNG ou JPG, 512x512px, max 2MB
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Aperçu de la fiche
                </h2>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
                    {logo ? (
                      <img
                        src={logo}
                        alt={formValues.companyName || 'Logo'}
                        className="h-16 w-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/sib-logo.jpg';
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {formValues.companyName || 'Nom de l\'entreprise'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formValues.sector || 'Secteur d\'activité'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {formValues.description || 'Description de l\'entreprise...'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {formValues.category === 'bâtiment-industry' ? 'Industrie du Bâtiment' :
                         formValues.category === 'bâtiment-operations' ? 'Opérations du Bâtiment' :
                         formValues.category === 'institutional' ? 'Institutionnel' :
                         formValues.category === 'academic' ? 'Académique' :
                         'Catégorie'}
                      </span>
                      {(formValues.markets || '').split(',').filter(Boolean).slice(0, 3).map((market, i) => (
                        <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {market.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
