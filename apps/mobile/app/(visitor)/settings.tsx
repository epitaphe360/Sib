import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { registerForPushNotifications } from '../../src/services/push';
import { colors, spacing } from '../../src/theme';

export default function VisitorSettingsScreen() {
  const { user } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const enablePush = async () => {
    if (!user) return;
    const token = await registerForPushNotifications(user.id);
    setPushStatus(token ? 'Notifications activées' : 'Permissions refusées ou simulateur');
  };

  return (
    <Screen>
      <ScrollView>
        <ScreenTitle title={t('settings.title')} />
        <Card>
          <Text style={styles.label}>{t('settings.language')}</Text>
          <View style={styles.langRow}>
            <PrimaryButton
              label="Français"
              onPress={() => setLocale('fr')}
              loading={false}
            />
            <View style={styles.gap} />
            <PrimaryButton label="العربية" onPress={() => setLocale('ar')} />
          </View>
          <Text style={styles.current}>Langue : {locale === 'fr' ? 'Français' : 'العربية'}</Text>
        </Card>
        {user && (
          <Card>
            <Text style={styles.label}>{t('settings.push')}</Text>
            <Text style={styles.hint}>{t('settings.pushHint')}</Text>
            <PrimaryButton label={t('settings.pushEnable')} onPress={enablePush} />
            {pushStatus ? <Text style={styles.status}>{pushStatus}</Text> : null}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  langRow: { flexDirection: 'row' },
  gap: { width: spacing.sm },
  current: { marginTop: spacing.md, color: colors.textMuted, fontSize: 13 },
  hint: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  status: { marginTop: spacing.sm, color: colors.success, fontSize: 13, textAlign: 'center' },
});
