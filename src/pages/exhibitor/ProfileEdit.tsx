import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';
import { ROUTES } from '../../lib/routes';

// Zod validation schema
const profileEditSchema = z.object({
  companyName: z.string()
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne doit pas dépasser 200 caractères'),
  description: z.string()
    .max(1000, 'La description ne doit pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileEditSchema>;

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      companyName: '',
      description: '',
      website: ''
    }
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    // prefill values from user.exhibitor if present
    (async () => {
      try {
        if (!user) return;
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id).catch(() => null);
        if (exhibitor) {
          reset({
            companyName: exhibitor.companyName || '',
            description: exhibitor.description || '',
            website: exhibitor.website || ''
          });
        }
      } catch {
        // ignore
      }
    })();
  }, [user, reset]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return setError('Vous devez être connecté.');
    setError(null);
    setLoading(true);
    try {
      let logoUrl: string | undefined = undefined;
      if (file) {
        const res = await SupabaseService.uploadExhibitorLogo(user.id, file);
        if (res?.publicUrl) logoUrl = res.publicUrl;
      }

      const updates: any = {
        companyName: data.companyName,
        description: data.description || '',
        website: data.website || ''
      };
      if (logoUrl) updates.logo = logoUrl;

      // Find exhibitor id by user id
      const exhibitor = await SupabaseService.getExhibitorByUserId(user.id as string);
      if (!exhibitor) {
        // create exhibitor if none
        await SupabaseService.createExhibitor({
          userId: user.id,
          companyName: data.companyName,
          description: data.description || '',
          website: data.website || '',
          logo: logoUrl
        });
      } else {
        await SupabaseService.updateExhibitor(exhibitor.id, updates);
      }

      navigate(ROUTES.EXHIBITOR_DASHBOARD);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to={ROUTES.EXHIBITOR_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au Tableau de Bord
      </Link>
      <h1 className="text-2xl font-bold mb-4">Éditer le profil exposant</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de la société <span className="text-red-500">*</span>
          </label>
          <input
            {...register('companyName')}
            className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Nom de votre entreprise"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            rows={4}
            placeholder="Décrivez votre entreprise"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Site web</label>
          <input
            {...register('website')}
            type="url"
            className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.website ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="https://www.exemple.com"
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">PNG, JPG jusqu'à 2MB</p>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'En cours...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;



