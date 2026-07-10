import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { buildStaticParticipantQR, fetchVisitorBadgeForLead } from '../../../src/api/badgeLookup';
import { startConversation } from '../../../src/api/chat';
import { fetchExhibitorLeads } from '../../../src/api/leads';
import { Avatar, Card, IllustratedEmpty, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { localeCode } from '../../../src/lib/locale';
import { badgeLevelLabel } from '../../../src/services/badge';
import type { UserBadge } from '../../../src/types';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function ExhibitorContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const lc = localeCode(locale);
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitorUserId, setVisitorUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    setError(null);
    try {
      const leads = await fetchExhibitorLeads(user.id);
      const lead = leads.find((l) => l.id === id);
      if (!lead) {
        setError(t('exhibitor.contact.notFound'));
        return;
      }
      setLeadName(lead.visitorName ?? t('exhibitor.contacts.unknown'));
      setLeadEmail(lead.visitorEmail);
      setCompany(lead.companyName);
      setScannedAt(lead.scannedAt);
      setVisitorUserId(lead.visitorUserId);
      const visitorBadge = await fetchVisitorBadgeForLead(lead.visitorUserId);
      setBadge(visitorBadge);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user, id, t]);

  useEffect(() => { load(); }, [load]);

  const qrValue = badge ? buildStaticParticipantQR(badge) : null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('exhibitor.contact.title')} subtitle={leadName} />

        {loading ? (
          <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: spacing.xl }} />
        ) : error ? (
          <IllustratedEmpty icon="alert-circle-outline" title={t('common.error')} message={error} />
        ) : (
          <>
            <Card elevated>
              <View style={styles.header}>
                <Avatar name={leadName} size={56} />
                <View style={styles.headerInfo}>
                  <Text style={styles.name}>{leadName}</Text>
                  {company ? <Text style={styles.meta}>{company}</Text> : null}
                  {leadEmail ? <Text style={styles.email}>{leadEmail}</Text> : null}
                  <Text style={styles.meta}>
                    {t('exhibitor.contacts.scannedAt')} {new Date(scannedAt).toLocaleString(lc)}
                  </Text>
                </View>
              </View>
            </Card>

            {badge && qrValue ? (
              <Card elevated>
                <Text style={styles.qrTitle}>{t('exhibitor.contact.qrTitle')}</Text>
                <Text style={styles.qrHint}>{t('exhibitor.contact.qrHint')}</Text>
                <View style={styles.qrWrap}>
                  <QRCode value={qrValue} size={200} backgroundColor="#fff" color={colors.primaryDark} />
                </View>
                <Text style={styles.level}>{badgeLevelLabel(badge.accessLevel)}</Text>
                <Text style={styles.code}>{badge.badgeCode}</Text>
              </Card>
            ) : (
              <IllustratedEmpty
                icon="qr-code-outline"
                title={t('exhibitor.contact.noBadge')}
                message={t('exhibitor.contact.noBadgeHint')}
              />
            )}

            {visitorUserId && user ? (
              <View style={styles.actions}>
                <PrimaryButton
                  label={t('exhibitor.contact.message')}
                  variant="gold"
                  loading={actionLoading}
                  onPress={async () => {
                    setActionLoading(true);
                    try {
                      const conversationId = await startConversation(user.id, visitorUserId);
                      router.push(`/(exhibitor)/messages/${conversationId}` as never);
                    } catch (e) {
                      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                />
                <SecondaryButton
                  label={t('exhibitor.contact.appointment')}
                  icon="calendar-outline"
                  onPress={() =>
                    router.push({
                      pathname: '/(exhibitor)/lead-appointment',
                      params: { visitorUserId, visitorName: leadName },
                    } as never)
                  }
                />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.text },
  meta: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  email: { fontSize: 13, fontFamily: fonts.body, color: colors.primary, marginTop: 2 },
  qrTitle: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.text, textAlign: 'center' },
  qrHint: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.md },
  qrWrap: {
    alignSelf: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  level: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.gold, textAlign: 'center', marginTop: spacing.md },
  code: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
