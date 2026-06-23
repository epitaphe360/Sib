import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import { getRoleGroup } from '../../navigation/roleConfig';
import { navigateAfterAuth } from '../../lib/navigateAfterAuth';
import { colors } from '../../theme';

interface RoleGateProps {
  children: React.ReactNode;
  allowed: 'visitor' | 'exhibitor' | 'staff' | 'service_client';
  /** Si true, connexion obligatoire (exposant, staff, service_client) */
  requireAuth?: boolean;
}

export function RoleGate({ children, allowed, requireAuth = true }: RoleGateProps) {
  const { user, isLoading } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (isLoading) return;
    if (requireAuth && !user) {
      router.replace('/(auth)/login');
      return;
    }
    if (user && getRoleGroup(user.type) !== allowed) {
      navigateAfterAuth(user.type);
    }
  }, [user, isLoading, allowed, requireAuth]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (requireAuth && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user && getRoleGroup(user.type) !== allowed) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
});
