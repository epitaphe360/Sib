import { useMemo } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { APP_IMAGES } from '../data/images';
import { FLOOR_PLAN_HALL_HOTSPOTS } from '../data/floorPlanHotspots';
import { computeStandPins, type StandPinOverride } from '../lib/floorPlanStandPins';
import { useI18n } from '../i18n/I18nProvider';
import type { Exhibitor } from '../types';
import { colors, fonts, radius, spacing } from '../theme';

/** Plan isométrique 3D — 1024×576 px */
export const FLOOR_PLAN_ASPECT = 576 / 1024;

const PIN_SIZE = 26;

type Props = {
  remoteUrl?: string | null;
  exhibitors?: Exhibitor[];
  standPinOverrides?: Record<string, StandPinOverride>;
  selectedHall?: string;
  selectedStandId?: string;
  showAllStands?: boolean;
  onHallSelect?: (hall: string) => void;
  onStandPress?: (exhibitorId: string) => void;
};

export function InteractiveFloorPlan({
  remoteUrl,
  exhibitors = [],
  standPinOverrides = {},
  selectedHall,
  selectedStandId,
  showAllStands = false,
  onHallSelect,
  onStandPress,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const planWidth = width - spacing.md * 2;
  const planHeight = planWidth * FLOOR_PLAN_ASPECT;
  const source: ImageSourcePropType = remoteUrl ? { uri: remoteUrl } : APP_IMAGES.plan;

  const standPins = useMemo(
    () => computeStandPins(exhibitors, standPinOverrides),
    [exhibitors, standPinOverrides],
  );

  const visiblePins = useMemo(() => {
    if (showAllStands) return standPins;
    if (selectedHall) return standPins.filter((p) => p.hall === selectedHall);
    return standPins.filter((_, i) => i < 12);
  }, [showAllStands, selectedHall, standPins]);

  const uniqueHalls = useMemo(
    () => [...new Set(FLOOR_PLAN_HALL_HOTSPOTS.map((z) => z.hall))],
    [],
  );

  const renderPin = (pin: ReturnType<typeof computeStandPins>[number]) => {
    const isActive = selectedStandId === pin.exhibitorId;
    const inFocus = !selectedHall || pin.hall === selectedHall || showAllStands;
    const left = pin.x * planWidth - PIN_SIZE / 2;
    const top = pin.y * planHeight - PIN_SIZE / 2;
    const label = pin.standLabel.length > 6 ? pin.standLabel.slice(0, 6) : pin.standLabel;

    return (
      <Pressable
        key={pin.exhibitorId}
        accessibilityRole="button"
        accessibilityLabel={`Stand ${pin.standLabel}, ${pin.companyName}`}
        onPress={() => onStandPress?.(pin.exhibitorId)}
        style={[
          styles.standPin,
          { left, top, width: PIN_SIZE, height: PIN_SIZE },
          inFocus ? styles.standPinFocus : styles.standPinDim,
          isActive && styles.standPinActive,
        ]}
      >
        <Text style={[styles.standPinText, isActive && styles.standPinTextActive]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        style={styles.zoomScroll}
        contentContainerStyle={styles.zoomContent}
        maximumZoomScale={Platform.OS === 'ios' ? 3 : 1}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        centerContent
      >
        <View style={{ width: planWidth, height: planHeight }}>
          <Image
            source={source}
            style={{ width: planWidth, height: planHeight }}
            resizeMode="contain"
          />

          {FLOOR_PLAN_HALL_HOTSPOTS.map((zone) => {
            const isSelected = selectedHall === zone.hall;
            return (
              <Pressable
                key={zone.id}
                accessibilityRole="button"
                accessibilityLabel={`${zone.label}${isSelected ? `, ${t('map.hallSelected')}` : ''}`}
                onPress={() => onHallSelect?.(zone.hall)}
                style={[
                  styles.hotspot,
                  {
                    left: zone.x * planWidth,
                    top: zone.y * planHeight,
                    width: zone.w * planWidth,
                    height: zone.h * planHeight,
                  },
                  isSelected && styles.hotspotSelected,
                  selectedHall && !isSelected && styles.hotspotDim,
                ]}
              />
            );
          })}

          {visiblePins.map(renderPin)}
        </View>
      </ScrollView>

      <View style={styles.legendRow}>
        {uniqueHalls.map((h) => (
          <Pressable
            key={h}
            onPress={() => onHallSelect?.(h)}
            style={[styles.legendChip, selectedHall === h && styles.legendChipActive]}
          >
            <Text style={[styles.legendText, selectedHall === h && styles.legendTextActive]}>
              Hall {h}
            </Text>
          </Pressable>
        ))}
        {selectedHall ? (
          <Pressable onPress={() => onHallSelect?.('')} style={styles.legendClear}>
            <Text style={styles.legendClearText}>{t('map.allHalls')}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.caption}>
        {selectedHall || showAllStands ? t('map.tapStand') : t('map.tapHall')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: '#0A1628',
    marginBottom: spacing.md,
  },
  zoomScroll: { maxHeight: 420 },
  zoomContent: { alignItems: 'center', padding: spacing.xs },
  hotspot: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(243, 146, 0, 0.45)',
    backgroundColor: 'rgba(243, 146, 0, 0.08)',
    borderRadius: 4,
  },
  hotspotSelected: {
    borderColor: colors.gold,
    borderWidth: 2.5,
    backgroundColor: 'rgba(243, 146, 0, 0.22)',
  },
  hotspotDim: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'transparent',
  },
  standPin: {
    position: 'absolute',
    borderRadius: PIN_SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  standPinFocus: { opacity: 1 },
  standPinDim: { opacity: 0.45 },
  standPinActive: {
    backgroundColor: colors.gold,
    borderColor: colors.primaryDark,
    transform: [{ scale: 1.12 }],
  },
  standPinText: {
    fontFamily: fonts.bodyBold,
    fontSize: 7,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  standPinTextActive: {
    color: colors.primaryDark,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    justifyContent: 'center',
  },
  legendChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  legendChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  legendText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  legendTextActive: {
    color: colors.primaryDark,
  },
  legendClear: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  legendClearText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.gold,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
});
