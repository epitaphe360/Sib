import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  Loader,
  DollarSign,
  Package,
  X,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import ImageUploader from '../ui/upload/ImageUploader';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { getStandAreaFromSize } from '../../utils/standSizeHelpers';

interface NewExhibitorForm {
  // Informations entreprise
  companyName: string;
  category: string;
  sector: string;
  country: string;
  website: string;
  logo: string;
  description: string;
  establishedYear: string;
  employeeCount: string;
  revenue: string;
  
  // Contact principal
  contactName: string;
  email: string;
  phone: string;
  position: string;
  address: string;
  city: string;
  zipCode: string;
  
  // Informations commerciales
  packageType: 'base' | 'standard' | 'premium' | 'elite';
  standSize: string;
  standNumber: string;
  standArea: number;
  contractValue: string;
  paymentStatus: 'pending' | 'partial' | 'completed';
  
  // Produits
  products: Array<{
    name: string;
    category: string;
    description: string;
  }>;
  
  // Informations supplémentaires
  certifications: string;
  markets: string;
  
  // Contrôles admin
  verified: boolean;
  featured: boolean;
  isPublished: boolean;
}

interface ExhibitorCreationSimulatorProps {
  exhibitorToEdit?: any;
  editMode?: boolean;
}

export default function ExhibitorCreationSimulator({ exhibitorToEdit, editMode = false }: ExhibitorCreationSimulatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { fetchExhibitors } = useExhibitorStore();
  const [formData, setFormData] = useState<NewExhibitorForm>({
    companyName: exhibitorToEdit?.companyName || '',
    category: exhibitorToEdit?.category || 'port-industry',
    sector: exhibitorToEdit?.sector || '',
    country: exhibitorToEdit?.contactInfo?.country || '',
    website: exhibitorToEdit?.website || '',
    logo: exhibitorToEdit?.logo || '',
    description: exhibitorToEdit?.description || '',
    establishedYear: exhibitorToEdit?.establishedYear?.toString() || '',
    employeeCount: exhibitorToEdit?.employeeCount || '',
    revenue: exhibitorToEdit?.revenue || '',
    contactName: exhibitorToEdit?.contactInfo?.name || '',
    email: exhibitorToEdit?.contactInfo?.email || '',
    phone: exhibitorToEdit?.contactInfo?.phone || '',
    position: exhibitorToEdit?.contactInfo?.position || '',
    address: exhibitorToEdit?.contactInfo?.address || '',
    city: exhibitorToEdit?.contactInfo?.city || '',
    zipCode: exhibitorToEdit?.contactInfo?.zipCode || '',
    packageType: exhibitorToEdit?.packageType || 'base',
    standSize: exhibitorToEdit?.standSize || '9m²',
    standNumber: exhibitorToEdit?.standNumber || '',
    standArea: exhibitorToEdit?.standArea || 9,
    contractValue: exhibitorToEdit?.contractValue || '',
    paymentStatus: exhibitorToEdit?.paymentStatus || 'pending',
    products: exhibitorToEdit?.products?.slice(0, 5).map((p: any) => ({
      name: p.name || '',
      category: p.category || '',
      description: p.description || ''
    })) || [],
    certifications: (exhibitorToEdit?.certifications || []).join(', '),
    markets: (exhibitorToEdit?.markets || []).join(', '),
    verified: exhibitorToEdit?.verified || false,
    featured: exhibitorToEdit?.featured || false,
    isPublished: exhibitorToEdit?.isPublished || false
  });

  const steps = [
    { id: 1, title: 'Entreprise', description: 'Informations générales' },
    { id: 2, title: 'Contact', description: 'Personne responsable' },
    { id: 3, title: 'Commercial', description: 'Package et tarification' },
    { id: 4, title: 'Produits', description: 'Catalogue exposant' },
    { id: 5, title: 'Compléments', description: 'Certifications & Marchés' },
    { id: 6, title: 'Admin', description: 'Contrôles administrateur' },
    { id: 7, title: 'Validation', description: 'Vérification finale' }
  ];

  const sectors = [
    'Technologies BTP',
    'Équipements BTP',
    'Logistique & Transport',
    'Services BTPs',
    'Conseil BTP',
    'Formation & Éducation',
    'Développement Durable',
    'Innovation & R&D'
  ];

  const packages = [
    {
      type: 'base',
      name: 'Exposant 9m² (Base)',
      price: 'Gratuit',
      standSize: '9m²',
      features: ['Profil d\'exposant public', 'Logo sur le site', 'Présentation courte', 'Formulaire de contact', 'Tableau de bord exposant']
    },
    {
      type: 'standard',
      name: 'Exposant 18m² (Standard)',
      price: 'Sur devis',
      standSize: '18m²',
      features: ['Mini-site personnalisé', '15 rendez-vous', 'Store produits', 'URL personnalisée', 'Support standard']
    },
    {
      type: 'premium',
      name: 'Exposant 36m² (Premium)',
      price: 'Sur devis',
      standSize: '36m²',
      features: ['Mise en avant "À la Une"', '30 rendez-vous', 'Accès API limité', 'Badge virtuel', 'Support prioritaire']
    },
    {
      type: 'elite',
      name: 'Exposant 54m²+ (Elite)',
      price: 'Sur devis',
      standSize: '54m²+',
      features: ['Mise en avant permanente', 'Rendez-vous illimités', 'Accès API complet', 'Support VIP 24/7', 'Priorité algorithmique']
    }
  ];

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Mode édition - mise à jour complète
      if (editMode && exhibitorToEdit) {
        await SupabaseService.updateExhibitor(exhibitorToEdit.id, {
          companyName: formData.companyName,
          category: formData.category as any,
          sector: formData.sector,
          description: formData.description,
          website: formData.website,
          logo: formData.logo || undefined,
          standNumber: formData.standNumber,
          standArea: formData.standArea,
          establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
          employeeCount: formData.employeeCount || undefined,
          revenue: formData.revenue || undefined,
          certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
          markets: formData.markets ? formData.markets.split(',').map(m => m.trim()).filter(Boolean) : [],
          verified: formData.verified,
          featured: formData.featured,
          isPublished: formData.isPublished,
          contactInfo: {
            ...exhibitorToEdit.contactInfo,
            country: formData.country,
            name: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            address: formData.address,
            city: formData.city,
            zipCode: formData.zipCode
          }
        });
        
        toast.success(`Exposant modifié : ${formData.companyName}`);
        setIsSubmitting(false);
        window.location.href = ROUTES.ADMIN_EXHIBITORS;
        return;
      }

      // Mode création - code existant
      // Création de l'exposant dans Supabase
      // 1. Créer ou réutiliser l'utilisateur pour l'exposant

      let userId: string;

      // Vérifier si un utilisateur avec cet email existe déjà
      let existingUser: any = null;
      try {
        const allUsers = await SupabaseService.getUsers();
        existingUser = allUsers.find((u: any) => u.email === formData.email);
      } catch { /* ignore */ }

      if (existingUser) {
        userId = existingUser.id;
      } else {
      const userData = {
        email: formData.email,
        name: formData.contactName,
        type: 'exhibitor' as const,
        profile: {
          firstName: formData.contactName.split(' ')[0] || '',
          lastName: formData.contactName.split(' ').slice(1).join(' ') || '',
          company: formData.companyName,
          position: formData.position,
          phone: formData.phone,
          country: formData.country,
          website: formData.website,
          bio: formData.description,
          standArea: formData.standArea,
          interests: [],
          objectives: [],
          sectors: [formData.sector],
          products: [],
          videos: [],
          images: [],
          participationObjectives: [],
          thematicInterests: [],
          collaborationTypes: [],
          expertise: [],
          visitObjectives: []
        }
      };

      const newUser = await SupabaseService.createUser(userData);
      userId = newUser.id;
      }

      // 2. Créer l'exposant
      const exhibitorData = {
        userId: userId,
        companyName: formData.companyName,
        category: formData.category as any,
        sector: formData.sector,
        description: formData.description,
        logo: formData.logo || undefined,
        website: formData.website,
        standNumber: formData.standNumber,
        standArea: formData.standArea,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
        employeeCount: formData.employeeCount || undefined,
        revenue: formData.revenue || undefined,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
        markets: formData.markets ? formData.markets.split(',').map(m => m.trim()).filter(Boolean) : [],
        verified: formData.verified,
        featured: formData.featured,
        isPublished: formData.isPublished,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          zipCode: formData.zipCode
        }
      };

      const newExhibitor = await SupabaseService.createExhibitor(exhibitorData);

      // 3. Créer les produits associés
      for (const product of formData.products) {
        if (product.name && product.category && product.description) {
          await SupabaseService.createProduct({
            exhibitorId: newExhibitor.id,
            name: product.name,
            description: product.description,
            category: product.category,
            images: [],
            featured: false
          });
        }
      }

      // 4. Rafraîchir la liste des exposants
      await fetchExhibitors();
      
  toast.success(`?? Exposant créé: ${newExhibitor.companyName} (ID: ${newExhibitor.id}) — utilisateur: ${newUser.email}`);
      
      // Reset form
      setFormData({
        companyName: '',
        sector: '',
        country: '',
        website: '',
        description: '',
        contactName: '',
        email: '',
        phone: '',
        position: '',
        packageType: 'base',
        standSize: '9m²',
        contractValue: '',
        paymentStatus: 'pending',
        products: []
      });
      
      setCurrentStep(1);
      setIsSubmitting(false);
      
    } catch (error) {
  setIsSubmitting(false);
  toast.error(error instanceof Error ? `Erreur: ${error.message}` : "Erreur inconnue");
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', category: '', description: '' }]
    });
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updatedProducts = formData.products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    setFormData({ ...formData, products: updatedProducts });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord Admin
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Création d'Exposant
            </h1>
            <p className="text-gray-600">
              Créez un nouveau dossier exposant pour SIB 2026
            </p>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <Card className="p-8">
          {/* Step 1: Informations Entreprise */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Informations sur l'entreprise
                </h2>
                <p className="text-gray-600">
                  Renseignez les informations générales de l'exposant
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise {!editMode && '*'}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de l'entreprise exposante"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité {!editMode && '*'}
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie d'exposant {!editMode && '*'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="port-industry">Industrie bâtiment</option>
                    <option value="construction-services">Services BTP</option>
                    <option value="logistics">Logistique</option>
                    <option value="technology">Technologie</option>
                    <option value="equipment">Équipements</option>
                    <option value="consulting">Conseil</option>
                    <option value="institutional">Institutionnel</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays {!editMode && '*'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Sélectionnez un pays</option>
                      <optgroup label="Afrique du Nord & Moyen-Orient">
                        <option value="Algérie">???? Algérie</option>
                        <option value="Maroc">???? Maroc</option>
                        <option value="Tunisie">???? Tunisie</option>
                        <option value="Égypte">???? Égypte</option>
                        <option value="Libye">???? Libye</option>
                        <option value="Mauritanie">???? Mauritanie</option>
                        <option value="Arabie Saoudite">???? Arabie Saoudite</option>
                        <option value="Émirats Arabes Unis">???? Émirats Arabes Unis</option>
                        <option value="Qatar">???? Qatar</option>
                        <option value="Koweït">???? Koweït</option>
                        <option value="Bahreïn">???? Bahreïn</option>
                        <option value="Oman">???? Oman</option>
                        <option value="Jordanie">???? Jordanie</option>
                        <option value="Liban">???? Liban</option>
                        <option value="Irak">???? Irak</option>
                        <option value="Syrie">???? Syrie</option>
                        <option value="Palestine">???? Palestine</option>
                        <option value="Yémen">???? Yémen</option>
                      </optgroup>
                      <optgroup label="Europe">
                        <option value="France">???? France</option>
                        <option value="Allemagne">???? Allemagne</option>
                        <option value="Espagne">???? Espagne</option>
                        <option value="Italie">???? Italie</option>
                        <option value="Royaume-Uni">???? Royaume-Uni</option>
                        <option value="Belgique">???? Belgique</option>
                        <option value="Pays-Bas">???? Pays-Bas</option>
                        <option value="Suisse">???? Suisse</option>
                        <option value="Portugal">???? Portugal</option>
                        <option value="Grèce">???? Grèce</option>
                        <option value="Turquie">???? Turquie</option>
                        <option value="Pologne">???? Pologne</option>
                        <option value="Autriche">???? Autriche</option>
                        <option value="Suède">???? Suède</option>
                        <option value="Norvège">???? Norvège</option>
                        <option value="Danemark">???? Danemark</option>
                        <option value="Finlande">???? Finlande</option>
                        <option value="Irlande">???? Irlande</option>
                        <option value="Russie">???? Russie</option>
                      </optgroup>
                      <optgroup label="Afrique Subsaharienne">
                        <option value="Sénégal">???? Sénégal</option>
                        <option value="Côte d'Ivoire">???? Côte d'Ivoire</option>
                        <option value="Nigeria">???? Nigeria</option>
                        <option value="Ghana">???? Ghana</option>
                        <option value="Cameroun">???? Cameroun</option>
                        <option value="Kenya">???? Kenya</option>
                        <option value="Afrique du Sud">???? Afrique du Sud</option>
                        <option value="Éthiopie">???? Éthiopie</option>
                        <option value="Tanzanie">???? Tanzanie</option>
                        <option value="Mali">???? Mali</option>
                        <option value="Burkina Faso">???? Burkina Faso</option>
                        <option value="Niger">???? Niger</option>
                        <option value="Gabon">???? Gabon</option>
                        <option value="Congo">???? Congo</option>
                        <option value="RD Congo">???? RD Congo</option>
                        <option value="Angola">???? Angola</option>
                        <option value="Mozambique">???? Mozambique</option>
                      </optgroup>
                      <optgroup label="Asie">
                        <option value="Chine">???? Chine</option>
                        <option value="Japon">???? Japon</option>
                        <option value="Corée du Sud">???? Corée du Sud</option>
                        <option value="Inde">???? Inde</option>
                        <option value="Singapour">???? Singapour</option>
                        <option value="Malaisie">???? Malaisie</option>
                        <option value="Indonésie">???? Indonésie</option>
                        <option value="Thaïlande">???? Thaïlande</option>
                        <option value="Vietnam">???? Vietnam</option>
                        <option value="Philippines">???? Philippines</option>
                        <option value="Pakistan">???? Pakistan</option>
                        <option value="Bangladesh">???? Bangladesh</option>
                        <option value="Iran">???? Iran</option>
                      </optgroup>
                      <optgroup label="Amériques">
                        <option value="États-Unis">???? États-Unis</option>
                        <option value="Canada">???? Canada</option>
                        <option value="Mexique">???? Mexique</option>
                        <option value="Brésil">???? Brésil</option>
                        <option value="Argentine">???? Argentine</option>
                        <option value="Chili">???? Chili</option>
                        <option value="Colombie">???? Colombie</option>
                        <option value="Pérou">???? Pérou</option>
                        <option value="Venezuela">???? Venezuela</option>
                        <option value="Cuba">???? Cuba</option>
                      </optgroup>
                      <optgroup label="Océanie">
                        <option value="Australie">???? Australie</option>
                        <option value="Nouvelle-Zélande">???? Nouvelle-Zélande</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://entreprise.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de création
                  </label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2010"
                    min="1800"
                    max="2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'employés
                  </label>
                  <select
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201-500">201-500 employés</option>
                    <option value="500+">500+ employés</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiffre d'affaires annuel
                  </label>
                  <select
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="< 1M">Moins de 1M€</option>
                    <option value="1M-5M">1M€ - 5M€</option>
                    <option value="5M-10M">5M€ - 10M€</option>
                    <option value="10M-50M">10M€ - 50M€</option>
                    <option value="50M+">50M€+</option>
                  </select>
                </div>
              </div>

              {/* Logo de l'entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="inline h-4 w-4 mr-1" />
                  Logo de l'entreprise
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Téléchargez le logo de l'exposant (format recommandé: PNG ou JPG, max 5MB)
                </p>
                <ImageUploader
                  initialImageUrl={formData.logo}
                  onImageUploaded={(url) => setFormData({ ...formData, logo: url })}
                  bucket="exhibitor-logos"
                  folder="logos"
                  aspectRatio="square"
                  showPreview={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'entreprise {!editMode && '*'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez l'activité principale de l'entreprise, ses spécialités et son expertise..."
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Principal */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact principal
                </h2>
                <p className="text-gray-600">
                  Personne responsable du dossier exposant
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet {!editMode && '*'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom et nom du contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste/Fonction {!editMode && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Directeur Commercial, CEO, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel {!editMode && '*'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone {!editMode && '*'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rue, numéro, bâtiment..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75001"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Informations Commerciales */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Package et tarification
                </h2>
                <p className="text-gray-600">
                  Choisissez le package exposant adapté
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.type}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFormData({
                          ...formData,
                          packageType: pkg.type as 'base' | 'standard' | 'premium' | 'elite',
                          standSize: pkg.standSize,
                          standArea: parseInt(pkg.standSize),
                          contractValue: pkg.price
                        });
                      }
                    }}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.packageType === pkg.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        packageType: pkg.type as 'base' | 'standard' | 'premium' | 'elite',
                        standSize: pkg.standSize,
                        standArea: parseInt(pkg.standSize),
                        contractValue: pkg.price
                      });
                    }}
                  >
                    <div className="text-center mb-4">
                      <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-bold text-lg text-gray-900">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{pkg.price}</p>
                      <p className="text-sm text-gray-600">{pkg.standSize}</p>
                    </div>
                    
                    <ul className="space-y-2">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de stand
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.standNumber}
                      onChange={(e) => setFormData({ ...formData, standNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: A123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie exacte (m²)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.standArea}
                      onChange={(e) => setFormData({ ...formData, standArea: parseInt(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 12"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut du paiement
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'pending' | 'partial' | 'completed' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="partial">Acompte versé</option>
                    <option value="completed">Paiement complet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur du contrat
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.contractValue}
                      onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Montant du contrat"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Produits */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Catalogue produits
                </h2>
                <p className="text-gray-600">
                  Ajoutez les produits et services de l'exposant
                </p>
              </div>

              <div className="space-y-4">
                {formData.products.map((product, index) => (
                  <div key={`product-${product.name || index}`} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Produit {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du produit
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom du produit/service"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catégorie
                        </label>
                        <select
                          value={product.category}
                          onChange={(e) => updateProduct(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          <option value="Software">Logiciel</option>
                          <option value="Hardware">Équipement</option>
                          <option value="Service">Service</option>
                          <option value="Consulting">Conseil</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description du produit/service"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addProduct}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Certifications et Marchés */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Informations complémentaires
                </h2>
                <p className="text-gray-600">
                  Certifications et marchés ciblés
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications et labels
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Listez les certifications (ISO, qualité, environnement, etc.) séparées par des virgules
                </p>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ISO 9001, ISO 14001, CE, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marchés géographiques ciblés
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Listez les pays ou régions où vous opérez, séparés par des virgules
                </p>
                <textarea
                  value={formData.markets}
                  onChange={(e) => setFormData({ ...formData, markets: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="France, Belgique, Maroc, Afrique de l'Ouest, etc."
                />
              </div>
            </motion.div>
          )}

          {/* Step 6: Contrôles Admin */}
          {currentStep === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contrôles administrateur
                </h2>
                <p className="text-gray-600">
                  Statuts de visibilité et mise en avant
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Exposant vérifié</h3>
                    <p className="text-sm text-gray-600">
                      Marque l'exposant comme vérifié par l'administration
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Exposant mis en avant</h3>
                    <p className="text-sm text-gray-600">
                      Affiche l'exposant en vedette sur la page d'accueil
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Profil publié</h3>
                    <p className="text-sm text-gray-600">
                      Rend le profil visible publiquement sur la plateforme
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 7: Validation */}
          {currentStep === 7 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Validation du dossier
                </h2>
                <p className="text-gray-600">
                  Vérifiez les informations avant soumission
                </p>
              </div>

              {/* Logo Preview */}
              {formData.logo && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Logo de l'entreprise</h4>
                  <div className="flex justify-center">
                    <img 
                      src={formData.logo} 
                      alt={formData.companyName}
                      className="w-32 h-32 object-contain rounded-lg border border-gray-300 bg-white p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </Card>
              )}

              {/* Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Entreprise</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom :</strong> {formData.companyName}</div>
                    <div><strong>Catégorie :</strong> {formData.category}</div>
                    <div><strong>Secteur :</strong> {formData.sector}</div>
                    <div><strong>Pays :</strong> {formData.country}</div>
                    <div><strong>Site web :</strong> {formData.website}</div>
                    {formData.establishedYear && <div><strong>Création :</strong> {formData.establishedYear}</div>}
                    {formData.employeeCount && <div><strong>Employés :</strong> {formData.employeeCount}</div>}
                    {formData.revenue && <div><strong>CA :</strong> {formData.revenue}</div>}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom :</strong> {formData.contactName}</div>
                    <div><strong>Poste :</strong> {formData.position}</div>
                    <div><strong>Email :</strong> {formData.email}</div>
                    <div><strong>Téléphone :</strong> {formData.phone}</div>
                    {formData.address && <div><strong>Adresse :</strong> {formData.address}</div>}
                    {formData.city && <div><strong>Ville :</strong> {formData.city}</div>}
                    {formData.zipCode && <div><strong>Code postal :</strong> {formData.zipCode}</div>}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Commercial</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Package :</strong> {packages.find(p => p.type === formData.packageType)?.name}</div>
                    <div><strong>Taille stand :</strong> {formData.standSize}</div>
                    <div><strong>Valeur :</strong> {formData.contractValue}</div>
                    <div><strong>Paiement :</strong> {formData.paymentStatus}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Produits</h4>
                  <div className="space-y-1 text-sm">
                    {formData.products.map((product) => (
                      <div key={`preview-${product.name}`}>• {product.name} ({product.category})</div>
                    ))}
                    {formData.products.length === 0 && (
                      <div className="text-gray-500">Aucun produit ajouté</div>
                    )}
                  </div>
                </Card>

                {(formData.certifications || formData.markets) && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Compléments</h4>
                    <div className="space-y-2 text-sm">
                      {formData.certifications && (
                        <div>
                          <strong>Certifications :</strong>
                          <div className="mt-1 text-gray-600">{formData.certifications}</div>
                        </div>
                      )}
                      {formData.markets && (
                        <div>
                          <strong>Marchés :</strong>
                          <div className="mt-1 text-gray-600">{formData.markets}</div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Statuts</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Vérifié :</strong> {formData.verified ? '? Oui' : '? Non'}
                    </div>
                    <div>
                      <strong>Mis en avant :</strong> {formData.featured ? '? Oui' : '? Non'}
                    </div>
                    <div>
                      <strong>Publié :</strong> {formData.isPublished ? '? Oui' : '? Non'}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Processus de validation</h4>
                <p className="text-sm text-blue-700">
                  Après soumission, le dossier sera examiné par l'équipe commerciale puis validé par l'administration. 
                  L'exposant recevra un email de confirmation une fois son compte activé.
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Précédent
                </Button>
              )}
            </div>

            <div>
              {currentStep < 7 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !editMode && (!formData.companyName || !formData.sector || !formData.country || !formData.description)) ||
                    (currentStep === 2 && !editMode && (!formData.contactName || !formData.email || !formData.phone || !formData.position)) ||
                    (currentStep === 3 && !editMode && !formData.contractValue) ||
                    (currentStep === 4 && !editMode && formData.products.length === 0)
                  }
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {editMode ? 'Mise à jour...' : 'Création en cours...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {editMode ? 'Enregistrer les modifications' : 'Créer le Dossier Exposant'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

