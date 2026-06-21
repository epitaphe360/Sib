import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
};

/** Bloc section avec titre clair — divulgation progressive (Nielsen #8). */
export function HomeSection({ title, subtitle, actionLabel, onAction, children }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <View style={styles.titleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{title}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={12}>
            <View style={styles.actionPill}>
              <Text style={styles.action}>{actionLabel}</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titles: { flex: 1, paddingRight: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBar: {
    width: 3,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.display,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
    paddingLeft: 11,
  },
  actionPill: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  action: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
});
