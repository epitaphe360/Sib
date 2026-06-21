import { HeaderButton } from '@react-navigation/elements';
import { Platform, StyleSheet } from 'react-native';
import { AppIcon } from './AppIcon';
import { useAuth } from '../context/AuthContext';
import { useSignOut } from '../hooks/useSignOut';
import { useI18n } from '../i18n/I18nProvider';

export function SignOutHeaderButton() {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();

  if (!user) return null;

  return (
    <HeaderButton
      onPress={confirmSignOut}
      accessibilityLabel={t('profile.signOut')}
      pressOpacity={0.6}
      style={styles.btn}
    >
      <AppIcon name="log-out-outline" size={22} color="#fff" />
    </HeaderButton>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginRight: Platform.OS === 'ios' ? 0 : 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
