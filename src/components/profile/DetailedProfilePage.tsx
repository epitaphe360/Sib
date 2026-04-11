import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export default function DetailedProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate loading user profile data
      toast.success('Profil utilisateur chargé avec succès !');
      setLoading(false);
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (profile && editedProfile) {
      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
      // Here you would typically save to your backend
  toast.success('Profil mis à jour avec succès !');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('profile.not_found')}</h2>
          <p className="text-gray-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="text-white">
                  <h1 className="text-3xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-blue-100">{profile.position} at {profile.company}</p>
                </div>
              </div>
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('common.save')}</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>{t('common.edit')}</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button
                  onClick={handleCancel}
                  className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>{t('common.cancel')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedProfile.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Member since</label>
                      <p className="text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Professional Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};