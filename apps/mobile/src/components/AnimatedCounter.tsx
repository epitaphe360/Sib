import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

function parseStatValue(raw: string): { prefix: string; target: number; suffix: string } {
  const m = raw.match(/^(\D*)([\d\s]+)(\D*)$/);
  if (!m) return { prefix: '', target: 0, suffix: raw };
  const num = Number.parseInt(m[2].replace(/\s/g, ''), 10);
  return { prefix: m[1] ?? '+', target: Number.isFinite(num) ? num : 0, suffix: m[3] ?? '' };
}

function formatNum(n: number, template: string): string {
  const spaced = n >= 1000 ? n.toLocaleString('fr-FR').replace(/\s/g, ' ') : String(n);
  const m = template.match(/^(\D*)([\d\s]+)(\D*)$/);
  if (!m) return template;
  return `${m[1] ?? ''}${spaced}${m[3] ?? ''}`;
}

export function AnimatedCounter({ label, value }: { label: string; value: string }) {
  const { target } = parseStatValue(value);
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(formatNum(0, value));

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => {
      setDisplay(formatNum(Math.round(v), value));
    });
    Animated.timing(anim, {
      toValue: target,
      duration: 1400,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [anim, target, value]);

  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{display}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center', flex: 1 },
  value: { fontSize: 22, fontWeight: '800', color: colors.primary },
  label: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
});
