/**
 * Plan schématique du Parc d'Exposition Mohammed VI — El Jadida
 * Rendu SVG React Native — pas d'image statique requise.
 * Sélection de hall interactive : onHallSelect(hall) → filtre les stands.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors, fonts, radius } from '../theme';
import { SALON_INFO } from '../data/salons';

interface Hall {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  accentColor: string;
}

const HALLS: Hall[] = [
  { id: 'A', label: 'Hall A', sub: 'Accueil & Enregistrement', x: 10,  y: 55,  w: 88,  h: 70, color: '#1B365D', accentColor: '#F39200' },
  { id: 'B', label: 'Hall B', sub: 'Matériaux & Construction',  x: 108, y: 55,  w: 88,  h: 70, color: '#1E4272', accentColor: '#F39200' },
  { id: 'C', label: 'Hall C', sub: 'Équipements & BTP',         x: 206, y: 55,  w: 88,  h: 70, color: '#1E4272', accentColor: '#F39200' },
  { id: 'D', label: 'Hall D', sub: 'VIP & Conférences',         x: 10,  y: 140, w: 132, h: 75, color: '#2C1810', accentColor: '#F39200' },
  { id: 'E', label: 'Hall E', sub: 'Zone Expo Principale',      x: 152, y: 140, w: 142, h: 75, color: '#0D2B1E', accentColor: '#27AE60' },
];

const W = 304;
const H = 240;

interface Props {
  selectedHall?: string;
  onHallSelect?: (hall: string) => void;
}

export function VenueFloorPlan({ selectedHall, onHallSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={240} viewBox={`0 0 ${W} ${H}`} style={styles.svg}>
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F1E35" stopOpacity="1" />
            <Stop offset="1" stopColor="#0A1628" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Fond */}
        <Rect x={0} y={0} width={W} height={H} fill="url(#bgGrad)" rx={8} />

        {/* Ligne de titre */}
        <Rect x={10} y={10} width={W - 20} height={36} rx={6} fill="rgba(243,146,0,0.12)" />
        <SvgText x={W / 2} y={22} textAnchor="middle" fill="#F39200" fontSize={9} fontWeight="bold" letterSpacing={1.5}>
          PARC D'EXPOSITION MOHAMMED VI
        </SvgText>
        <SvgText x={W / 2} y={38} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={8}>
          El Jadida — {SALON_INFO.name}
        </SvgText>

        {/* Entrée principale */}
        <Rect x={120} y={46} width={64} height={8} rx={4} fill="#F39200" />
        <SvgText x={152} y={53} textAnchor="middle" fill="#0A1628" fontSize={7} fontWeight="bold">
          ↓ ENTRÉE
        </SvgText>

        {/* Halls */}
        {HALLS.map((hall) => {
          const isSelected = selectedHall === hall.id;
          const isActive = hall.id === 'A'; // Hall A = entrée/accueil
          return (
            <G
              key={hall.id}
              onPress={() => onHallSelect?.(hall.id)}
            >
              {/* Ombre portée */}
              <Rect
                x={hall.x + 2}
                y={hall.y + 2}
                width={hall.w}
                height={hall.h}
                rx={5}
                fill="rgba(0,0,0,0.35)"
              />
              {/* Corps du hall */}
              <Rect
                x={hall.x}
                y={hall.y}
                width={hall.w}
                height={hall.h}
                rx={5}
                fill={isSelected ? hall.accentColor + '30' : hall.color + 'CC'}
                stroke={isSelected ? hall.accentColor : 'rgba(255,255,255,0.18)'}
                strokeWidth={isSelected ? 2 : 1}
              />
              {/* Bande de couleur accent en haut */}
              <Rect
                x={hall.x + 1}
                y={hall.y + 1}
                width={hall.w - 2}
                height={3}
                rx={4}
                fill={hall.accentColor}
              />
              {/* Code hall */}
              <Rect
                x={hall.x + 6}
                y={hall.y + 8}
                width={28}
                height={18}
                rx={4}
                fill={isSelected ? hall.accentColor : 'rgba(255,255,255,0.15)'}
              />
              <SvgText
                x={hall.x + 20}
                y={hall.y + 20}
                textAnchor="middle"
                fill={isSelected ? '#0A1628' : '#fff'}
                fontSize={9}
                fontWeight="bold"
              >
                {hall.id}
              </SvgText>
              {/* Label principal */}
              <SvgText
                x={hall.x + hall.w / 2}
                y={hall.y + 35}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={10}
                fontWeight="bold"
              >
                {hall.label}
              </SvgText>
              {/* Sous-titre */}
              <SvgText
                x={hall.x + hall.w / 2}
                y={hall.y + 48}
                textAnchor="middle"
                fill="rgba(255,255,255,0.65)"
                fontSize={7}
              >
                {hall.sub.slice(0, 22)}
              </SvgText>
              {hall.sub.length > 22 && (
                <SvgText
                  x={hall.x + hall.w / 2}
                  y={hall.y + 57}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.65)"
                  fontSize={7}
                >
                  {hall.sub.slice(22).trim()}
                </SvgText>
              )}
              {/* Point d'accès */}
              {hall.id === 'D' && (
                <>
                  <Rect x={hall.x + 10} y={hall.y + hall.h - 18} width={50} height={12} rx={3} fill="rgba(212,175,55,0.2)" />
                  <SvgText x={hall.x + 35} y={hall.y + hall.h - 9} textAnchor="middle" fill="#F39200" fontSize={7}>
                    ★ Lounge VIP
                  </SvgText>
                </>
              )}
            </G>
          );
        })}

        {/* Issues de secours */}
        <Circle cx={10} cy={145} r={5} fill="#E74C3C" opacity={0.8} />
        <SvgText x={17} y={148} fill="rgba(255,255,255,0.5)" fontSize={6}>Issue</SvgText>
        <Circle cx={W - 10} cy={145} r={5} fill="#E74C3C" opacity={0.8} />
        <SvgText x={W - 18} y={148} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize={6}>Issue</SvgText>

        {/* Légende */}
        <Rect x={10} y={H - 20} width={W - 20} height={14} rx={3} fill="rgba(255,255,255,0.05)" />
        <Circle cx={20} cy={H - 13} r={3} fill="#F39200" />
        <SvgText x={26} y={H - 9} fill="rgba(255,255,255,0.55)" fontSize={6.5}>Hall sélectionné</SvgText>
        <Circle cx={110} cy={H - 13} r={3} fill="#E74C3C" />
        <SvgText x={116} y={H - 9} fill="rgba(255,255,255,0.55)" fontSize={6.5}>Issue de secours</SvgText>
        <Circle cx={200} cy={H - 13} r={3} fill="#27AE60" />
        <SvgText x={206} y={H - 9} fill="rgba(255,255,255,0.55)" fontSize={6.5}>Zone expo</SvgText>
      </Svg>

      <Text style={styles.caption}>Appuyez sur un hall pour filtrer les stands</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0A1628',
    marginBottom: 12,
  },
  svg: { display: 'flex' },
  caption: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: '#0A1628',
  },
});
