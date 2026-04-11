import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  User, Building2, Handshake, Shield, TrendingUp,
  Zap, Star, Crown, Award, Briefcase, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

/**
 * Development Panel - Quick Subscription Switcher
 * Permet de basculer rapidement entre différents types d'abonnements pour les tests
 */
export default function DevSubscriptionSwitcher() {
  const { user, fetchUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Afficher uniquement en développement
  useEffect(() => {
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
    if (!isDev) {
      setIsOpen(false);
    }
  }, []);

  if (!user || (!import.meta.env.DEV && window.location.hostname !== 'localhost')) {
    return null;
  }

  const updateUserLevel = async (role: string, level: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role,
          visitor_level: role === 'visitor' ? level : null,
          exhibitor_level: role === 'exhibitor' ? level : null,
          partner_tier: role === 'partner' ? level : null
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchUser();
      toast.success(`✅ Basculé vers ${role.toUpperCase()} - ${level.toUpperCase()}`);

      // Recharger la page pour appliquer les changements
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors du changement de profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentRole = user.role || 'visitor';
  const currentLevel =
    currentRole === 'visitor' ? user.visitor_level :
    currentRole === 'exhibitor' ? user.exhibitor_level :
    currentRole === 'partner' ? user.partner_tier : 'free';

  return (
    <>
      {/* Toggle Button - Fixed en bas à droite */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Raccourcis Abonnements (DEV)"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
          <Card className="bg-white shadow-2xl border-2 border-purple-500">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Raccourcis Dev
                  </h3>
                  <p className="text-xs text-gray-500">Basculer entre les abonnements</p>
                </div>
                <Badge variant="warning" className="text-xs">DEV ONLY</Badge>
              </div>

              {/* Current Status */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Profil actuel:</p>
                <p className="font-bold text-gray-900">
                  {currentRole.toUpperCase()} - {currentLevel?.toUpperCase()}
                </p>
              </div>

              {/* Visitor Levels */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Visiteur</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => updateUserLevel('visitor', 'free')}
                    disabled={isUpdating}
                    variant={currentRole === 'visitor' && currentLevel === 'free' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    FREE
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('visitor', 'premium')}
                    disabled={isUpdating}
                    variant={currentRole === 'visitor' && currentLevel === 'premium' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    PREMIUM
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('visitor', 'vip')}
                    disabled={isUpdating}
                    variant={currentRole === 'visitor' && currentLevel === 'vip' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1 col-span-2"
                  >
                    <Crown className="h-3 w-3" />
                    VIP
                  </Button>
                </div>
              </div>

              {/* Exhibitor Levels */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Exposant</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => updateUserLevel('exhibitor', 'basic_9')}
                    disabled={isUpdating}
                    variant={currentRole === 'exhibitor' && currentLevel === 'basic_9' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Briefcase className="h-3 w-3" />
                    9m² Basic
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('exhibitor', 'standard_18')}
                    disabled={isUpdating}
                    variant={currentRole === 'exhibitor' && currentLevel === 'standard_18' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Building2 className="h-3 w-3" />
                    18m² Std
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('exhibitor', 'premium_36')}
                    disabled={isUpdating}
                    variant={currentRole === 'exhibitor' && currentLevel === 'premium_36' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Star className="h-3 w-3" />
                    36m² Premium
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('exhibitor', 'elite_54plus')}
                    disabled={isUpdating}
                    variant={currentRole === 'exhibitor' && currentLevel === 'elite_54plus' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Crown className="h-3 w-3" />
                    54m²+ Elite
                  </Button>
                </div>
              </div>

              {/* Partner Tiers */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Partenaire</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => updateUserLevel('partner', 'bronze')}
                    disabled={isUpdating}
                    variant={currentRole === 'partner' && currentLevel === 'bronze' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <Award className="h-3 w-3 text-orange-700" />
                    Bronze
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('partner', 'silver')}
                    disabled={isUpdating}
                    variant={currentRole === 'partner' && currentLevel === 'silver' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <Award className="h-3 w-3 text-gray-400" />
                    Silver
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('partner', 'gold')}
                    disabled={isUpdating}
                    variant={currentRole === 'partner' && currentLevel === 'gold' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <Award className="h-3 w-3 text-yellow-500" />
                    Gold
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('partner', 'platinum')}
                    disabled={isUpdating}
                    variant={currentRole === 'partner' && currentLevel === 'platinum' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <Crown className="h-3 w-3 text-blue-400" />
                    Platinum
                  </Button>
                </div>
              </div>

              {/* Admin & Marketing */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-gray-900">Admin & Marketing</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => updateUserLevel('admin', 'super')}
                    disabled={isUpdating}
                    variant={currentRole === 'admin' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    Admin
                  </Button>
                  <Button
                    onClick={() => updateUserLevel('marketing', 'manager')}
                    disabled={isUpdating}
                    variant={currentRole === 'marketing' ? 'primary' : 'outline'}
                    size="sm"
                    className="flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Marketing
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ La page sera rechargée après le changement
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
