import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';
import ImageUploader from '../ui/ImageUploader';
import { useTranslation } from '../../hooks/useTranslation';

export const ProfileEditor: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    country: '',
    phone: '',
    avatar: '',
  });

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        position: user.profile.position || '',
        country: user.profile.country || '',
        phone: user.profile.phone || '',
        avatar: user.profile.avatar || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (newAvatarUrl: string) => {
    if (!user) {return;}
    setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
    toast.success('Avatar mis à jour. Sauvegardez pour appliquer les changements.');
  };

  const handleSave = async () => {
    if (!user) {return;}

    const { avatar, ...profileDetails } = profileData;

    try {
      // Mettre à jour les détails du profil (sans l'avatar)
      await updateUserProfile(profileDetails);

      // Si l'avatar a changé, mettez à jour le champ avatar séparément
      if (avatar !== user.profile?.avatar) {
        await SupabaseService.updateUser(user.id, { profile: { ...(user.profile || {}), avatar } });
        // Mettre à jour l'état local du store si nécessaire
        const updatedUser = { ...user, profile: { ...(user.profile || {}), ...profileData } };
        useAuthStore.getState().setUser(updatedUser);
      }

      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      toast.error(`Erreur lors de la mise à jour : ${errorMessage}`);
    }
  };

  if (!user) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mon Profil</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={isLoading} className="p-2 text-green-600 hover:bg-green-100 rounded-full">
              {isLoading ? '...' : <Save size={20} />}
            </button>
            <button onClick={() => setIsEditing(false)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
              <X size={20} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
            <Edit2 size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={profileData.avatar || '/default-avatar.png'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          {isEditing && (
            <div className="absolute bottom-0 right-0">
               <ImageUploader onImageUploaded={handleImageUploaded} bucketName="avatars" currentImageUrl={profileData.avatar} />
            </div>
          )}
        </div>
        <div className="flex-grow">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="firstName" value={profileData.firstName} onChange={handleInputChange} placeholder={t('profile.first_name')} className="input input-bordered w-full"  aria-label={t('profile.first_name')} />
              <input type="text" name="lastName" value={profileData.lastName} onChange={handleInputChange} placeholder={t('profile.last_name')} className="input input-bordered w-full"  aria-label={t('profile.last_name')} />
              <input type="text" name="position" value={profileData.position} onChange={handleInputChange} placeholder={t('profile.position')} className="input input-bordered w-full"  aria-label={t('profile.position')} />
              <input type="text" name="country" value={profileData.country} onChange={handleInputChange} placeholder={t('profile.country')} className="input input-bordered w-full"  aria-label={t('profile.country')} />
              <input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} placeholder={t('auth.phone')} className="input input-bordered w-full"  aria-label={t('auth.phone')} />
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User size={20} /> {profileData.firstName} {profileData.lastName}
              </h3>
              <p className="text-gray-600">{profileData.position}</p>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p className="flex items-center gap-2"><Mail size={16} /> {user.email}</p>
                <p className="flex items-center gap-2"><Phone size={16} /> {profileData.phone || 'Non spécifié'}</p>
                <p className="flex items-center gap-2"><MapPin size={16} /> {profileData.country || 'Non spécifié'}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
