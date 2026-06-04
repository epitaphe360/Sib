import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchUsersForAdmin, updateUserStatusAdmin } from '../../src/api/admin';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { getErrorMessage } from '../../src/lib/errors';
import { colors, spacing } from '../../src/theme';

export default function StaffUsersScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchUsersForAdmin>>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (user?.type !== 'admin') return;
    setRows(await fetchUsersForAdmin(search.trim() || undefined));
  }, [user, search]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (userId: string, current?: string) => {
    const next = current === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatusAdmin(userId, next);
      await load();
      Alert.alert(t('admin.users.updated'), next);
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    }
  };

  if (user?.type !== 'admin') {
    return (
      <Screen>
        <EmptyState message={t('admin.users.adminOnly')} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('admin.users.title')} subtitle={t('admin.users.subtitle')} />
      <Input label={t('admin.users.search')} value={search} onChangeText={setSearch} />
      <PrimaryButton label={t('admin.users.searchBtn')} onPress={load} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<EmptyState message={t('admin.users.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.email} · {item.type} · {item.status ?? '—'}</Text>
            <PrimaryButton
              label={item.status === 'active' ? t('admin.users.suspend') : t('admin.users.activate')}
              onPress={() => toggleStatus(item.id, item.status)}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  name: { fontWeight: '700', color: colors.text, fontSize: 16 },
  meta: { color: colors.textMuted, fontSize: 13 },
});
