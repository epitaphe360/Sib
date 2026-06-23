import { useState } from 'react';
import { Calendar, Plus, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';
import { Event, Speaker } from '../../types/index';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

// Type pour le formulaire (simplifié)
interface EventFormState {
  title: string;
  description: string;
  type: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference' | '';
  date: string; // Format YYYY-MM-DD
  startTime: string; // Format HH:MM
  endTime: string; // Format HH:MM
  capacity: number;
  category: string;
  virtual: boolean;
  featured: boolean;
  location: string;
  meetingLink: string;
  tags: string; // Séparés par des virgules
  speakers: Speaker[];
}

const initialSpeaker: Speaker = {
  id: '', // Sera généré côté backend ou sera un UUID temporaire
  name: '',
  title: '',
  company: '',
  bio: '',
  expertise: [],
};

// Zod validation schema
const eventCreationSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne doit pas dépasser 2000 caractères'),
  type: z.enum(['conference', 'webinar', 'roundtable', 'networking', 'workshop'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un type d\'événement' })
  }),
  date: z.string()
    .min(1, 'La date est requise')
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, 'La date doit être aujourd\'hui ou dans le futur'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),
  location: z.string()
    .min(2, 'Le lieu doit contenir au moins 2 caractères')
    .max(200, 'Le lieu ne doit pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')),
  capacity: z.number()
    .min(1, 'La capacité doit être d\'au moins 1 personne')
    .max(10000, 'La capacité ne peut pas dépasser 10 000 personnes'),
  category: z.string()
    .min(1, 'Veuillez sélectionner une catégorie'),
  virtual: z.boolean(),
  featured: z.boolean(),
  meetingLink: z.string()
    .url('Lien de réunion invalide')
    .optional()
    .or(z.literal('')),
  tags: z.string(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'L\'heure de fin doit être après l\'heure de début',
  path: ['endTime']
});

type EventFormData = z.infer<typeof eventCreationSchema>;

interface EventCreationFormProps {
  eventToEdit?: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventCreationForm({ eventToEdit, onSuccess, onCancel }: EventCreationFormProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreationSchema),
    defaultValues: eventToEdit ? {
      title: eventToEdit.title,
      description: eventToEdit.description,
      type: eventToEdit.type,
      date: eventToEdit.date.toISOString().split('T')[0],
      startTime: eventToEdit.startTime,
      endTime: eventToEdit.endTime,
      capacity: eventToEdit.capacity,
      category: eventToEdit.category,
      virtual: eventToEdit.virtual,
      featured: eventToEdit.featured,
      location: eventToEdit.location || '',
      meetingLink: eventToEdit.meetingLink || '',
      tags: eventToEdit.tags.join(', '),
    } : {
      title: '',
      description: '',
      type: '' as any,
      date: '',
      startTime: '',
      endTime: '',
      capacity: 50,
      category: '',
      virtual: false,
      featured: false,
      location: '',
      meetingLink: '',
      tags: '',
    }
  });

  // Speakers are managed separately (not part of validation schema)
  const [speakers, setSpeakers] = useState<Speaker[]>(
    eventToEdit?.speakers.length ? eventToEdit.speakers : [initialSpeaker]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Watch form values for conditional rendering
  const isVirtual = watch('virtual');
  const selectedType = watch('type');

  if (user?.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('event_form.restricted_title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('event_form.restricted_desc')}
          </p>
        </div>
      </div>
    );
  }

  const handleSpeakerChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newSpeakers = [...speakers];

    // Gérer les champs simples
    if (name === 'name' || name === 'title' || name === 'company' || name === 'bio' || name === 'linkedin' || name === 'avatar') {
      newSpeakers[index] = {
        ...newSpeakers[index],
        [name]: value
      };
    } else if (name === 'expertise') {
      // Gérer le champ expertise (séparé par virgules)
      newSpeakers[index] = {
        ...newSpeakers[index],
        expertise: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };
    }

    setSpeakers(newSpeakers);
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, { ...initialSpeaker, id: `temp-${Date.now()}` }]);
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: EventFormData) => {
    setIsLoading(true);

    try {
      // Combiner date et heures pour créer startDate et endDate
      const startDateTime = new Date(`${data.date}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`);

      // Préparation des données pour l'API
      const eventData: Omit<Event, 'id' | 'registered'> = {
        title: data.title,
        description: data.description,
        type: data.type as Event['type'],
        startDate: startDateTime,
        endDate: endDateTime,
        date: startDateTime, // Pour compatibilité
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
        category: data.category,
        virtual: data.virtual,
        featured: data.featured,
        location: data.location || '',
        meetingLink: data.meetingLink || '',
        tags: data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        speakers: speakers.filter(s => s.name.length > 0).map(s => ({
          ...s,
          id: s.id.startsWith('temp-') ? crypto.randomUUID() : s.id, // Générer un ID pour les nouveaux speakers
        })),
      };

      if (eventToEdit) {
        // Modification
        await SupabaseService.updateEvent(eventToEdit.id, eventData);
        toast.success(t('event_form.toast_updated', { title: data.title }));
        onSuccess && onSuccess();
      } else {
        // Création
        await SupabaseService.createEvent(eventData);
        toast.success(t('event_form.toast_created', { title: data.title }));
        navigate(ROUTES.ADMIN_DASHBOARD);
      }

    } catch (error) {
      console.error('Erreur lors de la gestion de l\'événement:', error);
      toast.error(error instanceof Error ? error.message : t('event_form.toast_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypes = [
    { value: 'conference', label: t('event_form.type_conference') },
    { value: 'webinar', label: t('event_form.type_webinar') },
    { value: 'roundtable', label: t('event_form.type_roundtable') },
    { value: 'networking', label: t('event_form.type_networking') },
    { value: 'workshop', label: t('event_form.type_workshop') },
  ];

  const categories = [
    'Digital Transformation',
    'Networking',
    'Sustainability',
    'Data Management',
    'Bâtiment Transport'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {eventToEdit ? t('event_form.edit_title') : t('event_form.create_title')}
        </h1>

        <Card className="p-6 shadow-lg">
          <form onSubmit={handleFormSubmit(handleSubmit)}>
            <div className="space-y-6">
              {/* Titre et Description */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('event_form.label_title')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  {...register('title')}
                  placeholder={t('event_form.ph_title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('event_form.label_description')} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  placeholder={t('event_form.ph_description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Type et Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_type')} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="type"
                    value={selectedType}
                    onValueChange={(value) => setValue('type', value as any, { shouldValidate: true })}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('event_form.ph_type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_category')} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="category"
                    value={watch('category')}
                    onValueChange={(value) => setValue('category', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('event_form.ph_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Date et Heure */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_date')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_start_time')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime')}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_end_time')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register('endTime')}
                    className={errors.endTime ? 'border-red-500' : ''}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              {/* Lieu et Capacité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_location')}
                  </label>
                  <Input
                    id="location"
                    type="text"
                    {...register('location')}
                    placeholder={t('event_form.ph_location')}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_capacity')}
                  </label>
                  <Input
                    id="capacity"
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    min={1}
                    className={errors.capacity ? 'border-red-500' : ''}
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    id="virtual"
                    type="checkbox"
                    {...register('virtual')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="virtual" className="ml-2 block text-sm text-gray-900">
                    {t('event_form.virtual_event')}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="featured"
                    type="checkbox"
                    {...register('featured')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    {t('event_form.featured')}
                  </label>
                </div>
              </div>

              {isVirtual && (
                <div>
                  <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('event_form.label_meeting_link')}
                  </label>
                  <Input
                    id="meetingLink"
                    type="url"
                    {...register('meetingLink')}
                    placeholder="https://zoom.us/j/..."
                    className={errors.meetingLink ? 'border-red-500' : ''}
                  />
                  {errors.meetingLink && (
                    <p className="text-red-500 text-sm mt-1">{errors.meetingLink.message}</p>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('event_form.label_tags')}
                </label>
                <Input
                  id="tags"
                  type="text"
                  {...register('tags')}
                  placeholder={t('event_form.ph_tags')}
                  className={errors.tags ? 'border-red-500' : ''}
                />
                <p className="mt-1 text-xs text-gray-500">{t('event_form.tags_hint')}</p>
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
                )}
              </div>

              {/* Intervenants (Speakers) */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  {t('event_form.speakers_section')}
                  <Button type="button" variant="outline" onClick={addSpeaker} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> {t('event_form.add_speaker')}
                  </Button>
                </h3>

                <div className="space-y-4">
                  {speakers.map((speaker, index) => (
                    <Card key={speaker.id || index} className="p-4 border border-gray-100 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-800">{t('event_form.speaker_n', { n: index + 1 })}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSpeaker(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`speaker-name-${index}`} className="block text-xs font-medium text-gray-700 mb-1">{t('event_form.sp_name')}</label>
                          <Input
                            id={`speaker-name-${index}`}
                            name="name"
                            type="text"
                            value={speaker.name}
                            onChange={(e) => handleSpeakerChange(index, e)}
                            placeholder={t('event_form.sp_name_ph')}
                          />
                        </div>
                        <div>
                          <label htmlFor={`speaker-title-${index}`} className="block text-xs font-medium text-gray-700 mb-1">{t('event_form.sp_title')}</label>
                          <Input
                            id={`speaker-title-${index}`}
                            name="title"
                            type="text"
                            value={speaker.title}
                            onChange={(e) => handleSpeakerChange(index, e)}
                            placeholder={t('event_form.sp_title_ph')}
                          />
                        </div>
                        <div>
                          <label htmlFor={`speaker-company-${index}`} className="block text-xs font-medium text-gray-700 mb-1">{t('event_form.sp_company')}</label>
                          <Input
                            id={`speaker-company-${index}`}
                            name="company"
                            type="text"
                            value={speaker.company}
                            onChange={(e) => handleSpeakerChange(index, e)}
                            placeholder={t('event_form.sp_company_ph')}
                          />
                        </div>
                        <div>
                          <label htmlFor={`speaker-expertise-${index}`} className="block text-xs font-medium text-gray-700 mb-1">{t('event_form.sp_expertise')}</label>
                          <Input
                            id={`speaker-expertise-${index}`}
                            name="expertise"
                            type="text"
                            value={speaker.expertise.join(', ')}
                            onChange={(e) => handleSpeakerChange(index, e)}
                            placeholder={t('event_form.sp_expertise_ph')}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label htmlFor={`speaker-bio-${index}`} className="block text-xs font-medium text-gray-700 mb-1">{t('event_form.sp_bio')}</label>
                        <Textarea
                          id={`speaker-bio-${index}`}
                          name="bio"
                          value={speaker.bio}
                          onChange={(e) => handleSpeakerChange(index, e)}
                          rows={2}
                          placeholder={t('event_form.sp_bio_ph')}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bouton de Soumission */}
              <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
                {eventToEdit && onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    {t('event_form.cancel')}
                  </Button>
                )}
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? (eventToEdit ? t('event_form.updating') : t('event_form.creating')) : (eventToEdit ? t('event_form.btn_update') : t('event_form.btn_create'))}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
