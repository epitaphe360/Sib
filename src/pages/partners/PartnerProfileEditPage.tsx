import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Building2, ChevronDown, ChevronUp, Plus, Trash2, Upload,
  Image as ImageIcon, FileText, Users, Award, TrendingUp, Calendar, Globe, Mail, Phone, MapPin
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';

// Zod validation schema for basic partner profile fields
const partnerProfileSchema = z.object({
  companyName: z.string()
    .min(2, 'Le nom de l\'entreprise est requis (min 2 caractères)')
    .max(200, 'Maximum 200 caractères'),
  description: z.string()
    .max(2000, 'Maximum 2000 caractères')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Format de téléphone invalide')
    .optional()
    .or(z.literal('')),
  country: z.string()
    .optional()
    .or(z.literal(''))
});

type PartnerProfileFormData = z.infer<typeof partnerProfileSchema>;

export const PartnerProfileEditPage: React.FC = () => {
  // React Hook Form for validated fields
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PartnerProfileFormData>({
    resolver: zodResolver(partnerProfileSchema),
    defaultValues: {
      companyName: '',
      description: '',
      website: '',
      email: '',
      phone: '',
      country: ''
    }
  });

  const [formData, setFormData] = useState({
    // Base (requis)
    companyName: '',
    description: '',
    
    // Contact (optionnel)
    website: '',
    address: '',
    phone: '',
    email: '',
    country: '',
    
    // Détails (optionnel)
    type: 'corporate',
    sponsorLevel: '',
    employees: '',
    founded: '',
    ceo: '',
    
    // Catégories (optionnel)
    sectors: [] as string[],
    services: [] as string[],
    certifications: [] as string[],
    
    // Sections riches (optionnel)
    expertise: '',
    projects: [] as Array<{ title: string; description: string; image?: string; year?: string }>,
    gallery: [] as string[],
    news: [] as Array<{ title: string; description: string; date?: string; image?: string }>,
    
    // Impact (optionnel)
    metrics: {
      projectsCompleted: '',
      yearsExperience: '',
      teamSize: '',
      countriesServed: ''
    },
    
    // Timeline (optionnel)
    timeline: [] as Array<{ year: string; event: string; description?: string }>,
    
    // Équipe (optionnel)
    team: [] as Array<{ name: string; role: string; photo?: string; bio?: string }>,
    
    logo: null as string | null
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: false,
    details: false,
    categories: false,
    expertise: false,
    projects: false,
    gallery: false,
    news: false,
    metrics: false,
    timeline: false,
    team: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof typeof prev] as object), [field]: value }
    }));
  };

  const handleArrayAdd = (field: 'projects' | 'news' | 'timeline' | 'team') => {
    const newItem = 
      field === 'projects' ? { title: '', description: '', image: '', year: '' } :
      field === 'news' ? { title: '', description: '', date: '', image: '' } :
      field === 'timeline' ? { year: '', event: '', description: '' } :
      { name: '', role: '', photo: '', bio: '' };
    
    setFormData(prev => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const handleArrayRemove = (field: 'projects' | 'news' | 'timeline' | 'team', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleArrayItemChange = (field: 'projects' | 'news' | 'timeline' | 'team', index: number, itemField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [itemField]: value } : item)
    }));
  };

  const calculateCompleteness = () => {
    const fields = [
      formData.companyName, formData.description, formData.website, formData.country,
      formData.email, formData.sectors.length > 0, formData.expertise,
      formData.projects.length > 0, formData.gallery.length > 0
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const handleSave = async (data: PartnerProfileFormData) => {
    setIsSaving(true);
    // Merge validated data with the rest of formData
    const completeFormData = {
      ...formData,
      companyName: data.companyName,
      description: data.description || '',
      website: data.website || '',
      email: data.email || '',
      phone: data.phone || '',
      country: data.country || ''
    };

    try {
      if (user?.id) {
        await SupabaseService.updateUser(user.id, {
          name: completeFormData.companyName,
          profile: {
            ...((user as any).profile || {}),
            companyName: completeFormData.companyName,
            description: completeFormData.description,
            website: completeFormData.website,
            email: completeFormData.email,
            phone: completeFormData.phone,
            country: completeFormData.country,
            type: completeFormData.type,
            sectors: completeFormData.sectors,
            services: completeFormData.services,
            expertise: completeFormData.expertise,
            projects: completeFormData.projects,
            team: completeFormData.team,
            metrics: completeFormData.metrics,
            timeline: completeFormData.timeline,
            logo: completeFormData.logo,
          },
        });
        toast.success('Profil mis à jour avec succès !');
      } else {
        toast.error('Utilisateur non connecté');
      }
    } catch (err) {
      console.error('Erreur sauvegarde profil partenaire:', err);
      toast.error('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo: url }));
      toast.success('Logo téléchargé');
    }
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(f => URL.createObjectURL(f));
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...newImages] }));
      toast.success(`${files.length} image(s) ajoutée(s)`);
    }
  };

  const SectionHeader = ({ title, section, icon: Icon, optional = true }: { 
    title: string; section: keyof typeof expandedSections; icon: React.ElementType; optional?: boolean;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-t-lg transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {optional && <span className="text-sm text-gray-500 italic">(Optionnel)</span>}
      </div>
      {expandedSections[section] ? 
        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
        <ChevronDown className="h-5 w-5 text-gray-400" />}
    </button>
  );

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profil Partenaire</h1>
              <p className="text-gray-600 mt-2">Complétez votre profil progressivement - seul le nom est obligatoire</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Complétude</div>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${completeness}%` }} />
                </div>
                <span className="text-lg font-semibold text-blue-600">{completeness}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* 1. Informations de base */}
          <Card>
            <SectionHeader title="Informations de base" section="basic" icon={Building2} optional={false} />
            {expandedSections.basic && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Royal Bâtiment Group" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type d'organisation</label>
                    <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="corporate">Entreprise</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="museum">Musée</option>
                      <option value="association">Association</option>
                      <option value="government">Organisation gouvernementale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau de sponsoring
                      <span className="ml-2 text-xs text-gray-500">(Défini par l'administrateur)</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.sponsorLevel || "Aucun niveau défini"} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      title="Défini par l'administrateur"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={4}
                      placeholder="Groupe construction d'excellence, leader dans le transport construction..." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Logo</label>
                  <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {formData.logo ? <img src={formData.logo} alt="Logo" className="h-full w-full object-cover" /> :
                        <Building2 className="h-8 w-8 text-gray-400" />}
                    </div>
                    <div>
                      <input type="file" accept="image/*" onChange={handleLogoUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                      <p className="mt-1 text-sm text-gray-500">PNG, JPG jusqu'à 2MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 2. Contact */}
          <Card>
            <SectionHeader title="Informations de contact" section="contact" icon={Mail} />
            {expandedSections.contact && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="inline h-4 w-4 mr-1" />Site web
                    </label>
                    <input type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.exemple.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />Email
                    </label>
                    <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@exemple.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />Téléphone
                    </label>
                    <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+33 1 23 45 67 89" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />Pays
                    </label>
                    <input type="text" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Maroc, France..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                    <input type="text" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Avenue Example, Ville, Pays" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 3. Détails entreprise */}
          <Card>
            <SectionHeader title="Détails de l'entreprise" section="details" icon={Building2} />
            {expandedSections.details && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employés</label>
                    <input type="number" value={formData.employees} onChange={(e) => handleInputChange('employees', e.target.value)}
                      placeholder="50" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Année de création</label>
                    <input type="number" value={formData.founded} onChange={(e) => handleInputChange('founded', e.target.value)}
                      placeholder="2010" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Directeur Général</label>
                    <input type="text" value={formData.ceo} onChange={(e) => handleInputChange('ceo', e.target.value)}
                      placeholder="Jean Dupont" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 4. Catégories */}
          <Card>
            <SectionHeader title="Secteurs et services" section="categories" icon={Award} />
            {expandedSections.categories && (
              <div className="p-6 border-t">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Secteurs d'activité</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Transport & mobilité', 'Technologie', 'Logistique', 'Environnement', 'Sécurité', 'Formation'].map(s => (
                        <label key={s} className="flex items-center">
                          <input type="checkbox" checked={formData.sectors.includes(s)}
                            onChange={(e) => handleInputChange('sectors', e.target.checked ? [...formData.sectors, s] : formData.sectors.filter(x => x !== s))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['ISO 9001', 'ISO 14001', 'ISO 27001', 'OHSAS 18001', 'Bâtiment Security'].map(c => (
                        <label key={c} className="flex items-center">
                          <input type="checkbox" checked={formData.certifications.includes(c)}
                            onChange={(e) => handleInputChange('certifications', e.target.checked ? [...formData.certifications, c] : formData.certifications.filter(x => x !== c))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                          <span className="text-sm">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 5. Expertise */}
          <Card>
            <SectionHeader title="Expertise" section="expertise" icon={TrendingUp} />
            {expandedSections.expertise && (
              <div className="p-6 border-t">
                <textarea value={formData.expertise} onChange={(e) => handleInputChange('expertise', e.target.value)} rows={6}
                  placeholder="Décrivez votre expertise, vos domaines de compétence, votre savoir-faire..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </Card>

          {/* 6. Projets */}
          <Card>
            <SectionHeader title="Projets" section="projects" icon={FileText} />
            {expandedSections.projects && (
              <div className="p-6 border-t space-y-4">
                {formData.projects.map((proj, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Projet {i + 1}</h4>
                      <button onClick={() => handleArrayRemove('projects', i)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input type="text" value={proj.title} onChange={(e) => handleArrayItemChange('projects', i, 'title', e.target.value)}
                      placeholder="Titre du projet" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea value={proj.description} onChange={(e) => handleArrayItemChange('projects', i, 'description', e.target.value)}
                      placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={proj.year || ''} onChange={(e) => handleArrayItemChange('projects', i, 'year', e.target.value)}
                        placeholder="Année (ex: 2023)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="url" value={proj.image || ''} onChange={(e) => handleArrayItemChange('projects', i, 'image', e.target.value)}
                        placeholder="URL image" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                ))}
                <Button onClick={() => handleArrayAdd('projects')} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un projet
                </Button>
              </div>
            )}
          </Card>

          {/* 7. Galerie */}
          <Card>
            <SectionHeader title="Galerie" section="gallery" icon={ImageIcon} />
            {expandedSections.gallery && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.gallery.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-32 object-cover rounded-lg" />
                      <button onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple accept="image/*" onChange={handleGalleryUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p className="mt-2 text-sm text-gray-500">Ajoutez plusieurs images de votre entreprise, installations, projets...</p>
              </div>
            )}
          </Card>

          {/* 8. Actualités */}
          <Card>
            <SectionHeader title="Actualités" section="news" icon={Calendar} />
            {expandedSections.news && (
              <div className="p-6 border-t space-y-4">
                {formData.news.map((item, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Actualité {i + 1}</h4>
                      <button onClick={() => handleArrayRemove('news', i)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input type="text" value={item.title} onChange={(e) => handleArrayItemChange('news', i, 'title', e.target.value)}
                      placeholder="Titre de l'actualité" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    <textarea value={item.description} onChange={(e) => handleArrayItemChange('news', i, 'description', e.target.value)}
                      placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={item.date || ''} onChange={(e) => handleArrayItemChange('news', i, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="url" value={item.image || ''} onChange={(e) => handleArrayItemChange('news', i, 'image', e.target.value)}
                        placeholder="URL image" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                ))}
                <Button onClick={() => handleArrayAdd('news')} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter une actualité
                </Button>
              </div>
            )}
          </Card>

          {/* 9. Métriques */}
          <Card>
            <SectionHeader title="Métriques" section="metrics" icon={TrendingUp} />
            {expandedSections.metrics && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projets réalisés</label>
                    <input type="number" value={formData.metrics.projectsCompleted} onChange={(e) => handleNestedChange('metrics', 'projectsCompleted', e.target.value)}
                      placeholder="150" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
                    <input type="number" value={formData.metrics.yearsExperience} onChange={(e) => handleNestedChange('metrics', 'yearsExperience', e.target.value)}
                      placeholder="25" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Taille de l'équipe</label>
                    <input type="number" value={formData.metrics.teamSize} onChange={(e) => handleNestedChange('metrics', 'teamSize', e.target.value)}
                      placeholder="200" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays desservis</label>
                    <input type="number" value={formData.metrics.countriesServed} onChange={(e) => handleNestedChange('metrics', 'countriesServed', e.target.value)}
                      placeholder="15" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 10. Timeline */}
          <Card>
            <SectionHeader title="Chronologie" section="timeline" icon={Calendar} />
            {expandedSections.timeline && (
              <div className="p-6 border-t space-y-4">
                {formData.timeline.map((item, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Événement {i + 1}</h4>
                      <button onClick={() => handleArrayRemove('timeline', i)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={item.year} onChange={(e) => handleArrayItemChange('timeline', i, 'year', e.target.value)}
                        placeholder="2020" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="text" value={item.event} onChange={(e) => handleArrayItemChange('timeline', i, 'event', e.target.value)}
                        placeholder="Événement" className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <input type="text" value={item.description || ''} onChange={(e) => handleArrayItemChange('timeline', i, 'description', e.target.value)}
                      placeholder="Description (optionnel)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                ))}
                <Button onClick={() => handleArrayAdd('timeline')} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un événement
                </Button>
              </div>
            )}
          </Card>

          {/* 11. Équipe */}
          <Card>
            <SectionHeader title="Équipe" section="team" icon={Users} />
            {expandedSections.team && (
              <div className="p-6 border-t space-y-4">
                {formData.team.map((member, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Membre {i + 1}</h4>
                      <button onClick={() => handleArrayRemove('team', i)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={member.name} onChange={(e) => handleArrayItemChange('team', i, 'name', e.target.value)}
                        placeholder="Nom complet" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="text" value={member.role} onChange={(e) => handleArrayItemChange('team', i, 'role', e.target.value)}
                        placeholder="Poste" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <input type="url" value={member.photo || ''} onChange={(e) => handleArrayItemChange('team', i, 'photo', e.target.value)}
                      placeholder="URL photo" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    <textarea value={member.bio || ''} onChange={(e) => handleArrayItemChange('team', i, 'bio', e.target.value)}
                      placeholder="Biographie (optionnel)" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                ))}
                <Button onClick={() => handleArrayAdd('team')} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un membre
                </Button>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6">
            <Link to={ROUTES.PARTNER_DASHBOARD}>
              <Button variant="outline">Annuler</Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Sauvegarde...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Sauvegarder</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PartnerProfileEditPage;