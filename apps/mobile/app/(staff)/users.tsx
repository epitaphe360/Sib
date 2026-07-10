import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchUsersForAdmin, updateUserStatusAdmin } from '../../src/api/admin';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { getErrorMessage } from '../../src/lib/errors';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

export default function StaffUsersScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchUsersForAdmin>>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 400);
  }, []);

  const load = useCallback(async () => {
    if (user?.type !== 'admin') return;
    setLoadError(null);
    try {
      setRows(await fetchUsersForAdmin(debouncedSearch.trim() || undefined));
    } catch (e) {
      setLoadError(getErrorMessage(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const isProtectedUser = (type?: string) => type === 'admin';

  const toggleStatus = async (userId: string, current?: string, userType?: string) => {
    if (isProtectedUser(userType)) {
      Alert.alert(t('common.error'), t('admin.users.cannotSuspendAdmin'));
      return;
    }
    const next = current === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatusAdmin(userId, next, userType);
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
      <Input label={t('admin.users.search')} value={search} onChangeText={handleSearchChange} />
      <PrimaryButton label={t('admin.users.searchBtn')} onPress={load} />
      {loadError ? <EmptyState message={loadError} /> : null}
      {loading ? <SkeletonList rows={5} /> : (
        <FlatList
          style={styles.flex}
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
              {isProtectedUser(item.type) ? (
                <Text style={styles.protected}>{t('admin.users.protectedAccount')}</Text>
              ) : (
                <PrimaryButton
                  label={item.status === 'active' ? t('admin.users.suspend') : t('admin.users.activate')}
                  onPress={() => toggleStatus(item.id, item.status, item.type)}
                />
              )}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  name: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13 },
  protected: { fontFamily: fonts.bodySemiBold, color: colors.warning, fontSize: 13, textAlign: 'center' },
});
