import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSwitcher } from '../../src/components/LanguageSwitcher';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { AppIcon } from '../../src/components/AppIcon';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { registerForPushNotifications } from '../../src/services/push';
import { colors, fonts, spacing } from '../../src/theme';

export default function VisitorSettingsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const enablePush = async () => {
    if (!user) return;
    try {
      const token = await registerForPushNotifications(user.id);
      setPushStatus(token ? t('settings.pushOk') : t('settings.pushDenied'));
    } catch {
      setPushStatus(t('settings.pushDenied'));
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title={t('settings.title')} />

        <Card elevated>
          <LanguageSwitcher />
        </Card>

        {/* Push notifications */}
        {user && (
          <Card elevated>
            <View style={styles.cardHeader}>
              <AppIcon name="notifications-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>{t('settings.push')}</Text>
            </View>
            <Text style={styles.hint}>{t('settings.pushHint')}</Text>
            <PrimaryButton label={t('settings.pushEnable')} onPress={enablePush} />
            {pushStatus ? (
              <View style={styles.pushStatus}>
                <AppIcon name="checkmark-circle-outline" size={16} color={colors.success} />
                <Text style={styles.pushStatusText}>{pushStatus}</Text>
              </View>
            ) : null}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  pushStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pushStatusText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.success,
  },
});
