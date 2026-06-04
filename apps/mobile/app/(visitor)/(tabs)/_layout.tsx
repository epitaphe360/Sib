import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../../src/theme';

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', headerTitle: 'UrbaEvent', tabBarIcon: tabIcon('home-outline') }}
      />
      <Tabs.Screen name="salons" options={{ title: 'Salons', tabBarIcon: tabIcon('grid-outline') }} />
      <Tabs.Screen name="program" options={{ title: 'Programme', tabBarIcon: tabIcon('calendar-outline') }} />
      <Tabs.Screen name="exhibitors" options={{ title: 'Exposants', tabBarIcon: tabIcon('business-outline') }} />
      <Tabs.Screen name="badge" options={{ title: 'Badge', tabBarIcon: tabIcon('qr-code-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
