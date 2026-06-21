import { router } from 'expo-router';
import { Alert, InteractionManager } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nProvider';

export function useSignOut() {
  const { signOut } = useAuth();
  const { t } = useI18n();

  const signOutAndRedirect = async () => {
    try {
      await signOut();
    } catch {
      // On force la sortie même si Supabase échoue
    }
    InteractionManager.runAfterInteractions(() => {
      router.replace('/(auth)/login' as never);
    });
  };

  const confirmSignOut = () => {
    Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: () => {
          // Délai court : évite les échecs de navigation Android depuis Alert
          setTimeout(() => {
            void signOutAndRedirect();
          }, 50);
        },
      },
    ]);
  };

  return { signOutAndRedirect, confirmSignOut };
}
