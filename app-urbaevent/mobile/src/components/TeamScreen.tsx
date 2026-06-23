import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabaseErrorMessage } from '../lib/supabaseError';
import {
  createCollaborator,
  deactivateCollaborator,
  fetchCollaborators,
  fetchOwnerContext,
  type OwnerContext,
  type StandCollaborator,
} from '../api/team';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nProvider';
import {
  Avatar,
  IllustratedEmpty,
  Input,
  PrimaryButton,
  Screen,
  ScreenTitle,
  SecondaryButton,
} from './ui';
import { colors, fonts, radius, spacing } from '../theme';

export function TeamScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [context, setContext] = useState<OwnerContext | null>(null);
  const [items, setItems] = useState<StandCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', position: 'Exposant' });

  const load = useCallback(async () => {
    if (!user) return;
    const ctx = await fetchOwnerContext(user.id);
    setContext(ctx);
    if (ctx) setItems(await fetchCollaborators(ctx.ownerId));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const submit = async () => {
    if (!context || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      Alert.alert(t('common.error'), t('team.formRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const { tempPassword } = await createCollaborator({
        context,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        position: form.position.trim() || undefined,
      });
      Alert.alert(t('team.addedTitle'), `${t('team.tempPassword')}: ${tempPassword}`);
      setForm({ firstName: '', lastName: '', email: '', phone: '', position: 'Exposant' });
      setShowForm(false);
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('team.createError')));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert(t('team.confirmDeleteTitle'), t('team.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deactivateCollaborator(id);
          await load();
        },
      },
    ]);
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('team.title')} subtitle={context?.companyName ?? t('team.subtitle')} />
      <PrimaryButton label={t('team.add')} onPress={() => setShowForm(true)} variant="gold" />
      {items.length > 0 ? (
        <PrimaryButton
          label={t('team.printAll')}
          variant="outline"
          onPress={() => router.push('/(exhibitor)/team-print' as never)}
        />
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        ListEmptyComponent={
          !loading ? <IllustratedEmpty icon="people-outline" title={t('team.empty')} message={t('team.emptyHint')} /> : null
        }
        renderItem={({ item }) => (
          <CollaboratorRow item={item} onDelete={() => remove(item.id)} />
        )}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
      />

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalCard} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{t('team.add')}</Text>
            <Input label={t('team.firstName')} value={form.firstName} onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))} />
            <Input label={t('team.lastName')} value={form.lastName} onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))} />
            <Input label={t('auth.email')} value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} autoCapitalize="none" keyboardType="email-address" />
            <Input label={t('team.phone')} value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Input label={t('team.position')} value={form.position} onChangeText={(v) => setForm((f) => ({ ...f, position: v }))} />
            <PrimaryButton label={t('team.create')} onPress={submit} loading={submitting} />
            <SecondaryButton label={t('common.cancel')} onPress={() => setShowForm(false)} />
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

function CollaboratorRow({ item, onDelete }: { item: StandCollaborator; onDelete: () => void }) {
  const { t } = useI18n();
  const name = `${item.firstName} ${item.lastName}`.trim();

  const copyPwd = async () => {
    if (!item.tempPassword) return;
    await Clipboard.setStringAsync(item.tempPassword);
    Alert.alert(t('team.copied'));
  };

  return (
    <View style={styles.row}>
      <Avatar name={name} size={44} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{name}</Text>
        <Text style={styles.rowMeta}>{item.email}</Text>
        {item.position ? <Text style={styles.rowMeta}>{item.position}</Text> : null}
        {item.tempPassword ? (
          <Pressable onPress={copyPwd}>
            <Text style={styles.pwd}>{t('team.tempPassword')}: {item.tempPassword}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onDelete} hitSlop={12}>
        <Text style={styles.delete}>{t('common.delete')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontFamily: fonts.bodyBold, color: colors.text },
  rowMeta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  pwd: { fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.gold, marginTop: 6 },
  delete: { fontSize: 12, fontFamily: fonts.bodyBold, color: '#dc2626' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 20, fontFamily: fonts.display, color: colors.primaryDark, marginBottom: spacing.sm },
});
