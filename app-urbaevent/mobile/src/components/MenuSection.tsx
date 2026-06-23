import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/I18nProvider';
import { fonts, radius, spacing, typeScale } from '../theme';

type Props = {
  title: string;
  children: React.ReactNode;
};

/** Section de menu groupée dans une carte — profil & paramètres */
export function MenuSection({ title, children }: Props) {
  const { colors } = useAppTheme();
  const { isRTL } = useI18n();

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.title,
          { color: colors.textMuted },
          isRTL && styles.textRtl,
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  title: {
    ...typeScale.label,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  textRtl: { writingDirection: 'rtl', textAlign: 'right', marginLeft: 0, marginRight: spacing.xs },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
