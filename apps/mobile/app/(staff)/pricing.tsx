import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { fetchVipPrice, updateVipPrice } from '../../src/api/admin';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, spacing } from '../../src/theme';

export default function StaffPricingScreen() {
  const { t } = useI18n();
  const [price, setPrice] = useState('');
  const [current, setCurrent] = useState(0);

  const load = useCallback(async () => {
    try {
      const p = await fetchVipPrice();
      setCurrent(p);
      setPrice(String(p || ''));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const n = Number.parseFloat(price.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert(t('common.error'), t('staff.vipPrice.invalidAmount'));
      return;
    }
    try {
      await updateVipPrice(n);
      setCurrent(n);
      Alert.alert(t('staff.vipPrice.savedTitle'), t('staff.vipPrice.savedBody'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('staff.vipPrice.saveError'));
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle
          title={t('staff.vipPrice.title')}
          subtitle={t('staff.vipPrice.subtitle', { current: String(current) })}
        />
        <Input label={t('staff.vipPrice.newLabel')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <PrimaryButton label={t('common.save')} onPress={save} />
        <Text style={styles.hint}>{t('staff.vipPrice.hint')}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: spacing.md, color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
