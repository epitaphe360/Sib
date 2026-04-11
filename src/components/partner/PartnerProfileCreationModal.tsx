import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Building2, Globe, Users, Briefcase, MapPin, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/authStore';

interface PartnerProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface PartnerProfileForm {
  companyName: string;
  type: string;
  country: string;
  description: string;
  website: string;
  yearsOfExperience: number;
  employees: string;
  activeProjects: number;
}

export default function PartnerProfileCreationModal({
  isOpen,
  onClose,
  onComplete
}: PartnerProfileCreationModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<PartnerProfileForm>({
    companyName: user?.companyName || '',
    type: 'corporate',
    country: user?.country || 'Maroc',
    description: '',
    website: user?.website || '',
    yearsOfExperience: 1,
    employees: '1-10',
    activeProjects: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (field: keyof PartnerProfileForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer ou mettre à jour le profil partenaire
      const { error } = await supabase
        .from('partner_profiles')
        .upsert({
          user_id: user.id,
          company_name: formData.companyName,
          type: formData.type,
          country: formData.country,
          description: formData.description,
          website: formData.website,
          years_of_experience: formData.yearsOfExperience,
          employees: formData.employees,
          active_projects: formData.activeProjects,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Profil partenaire créé avec succès !');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Erreur création profil:', error);
      toast.error('Erreur lors de la création du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.companyName && formData.type && formData.country;
  const isStep2Valid = formData.description.length >= 20 && formData.yearsOfExperience > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-600" />
            Créer votre Profil Partenaire
          </DialogTitle>
          <DialogDescription>
            Complétez votre profil pour apparaître dans l'annuaire des partenaires SIB 2026
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'} transition-all`} style={{width: currentStep >= 2 ? '100%' : '0%'}} />
            </div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Détails</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nom de l'organisation *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Tanger Med Logistics"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Type d'organisation *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="government">Gouvernemental</SelectItem>
                    <SelectItem value="ngo">ONG</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="academic">Académique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Pays *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Maroc"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Site officiel</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://votre-site.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Detailed Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Partenaire logistique premium du port de Tanger Med, offrant des services de stockage et de distribution internationaux."
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} / 20 caractères minimum
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsOfExperience">Années d'expérience *</Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="1"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value) || 1)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="employees">Nombre d'employés *</Label>
                  <Select value={formData.employees} onValueChange={(value) => handleChange('employees', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500-1000">500-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="activeProjects">Projets actifs</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="activeProjects"
                    type="number"
                    min="0"
                    value={formData.activeProjects}
                    onChange={(e) => handleChange('activeProjects', parseInt(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={!isStep2Valid || isSubmitting}
                >
                  {isSubmitting ? 'Création...' : 'Créer mon profil'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

