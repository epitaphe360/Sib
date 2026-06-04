import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { ROLE_LABELS } from '../../../src/navigation/roleConfig';
import { colors, spacing } from '../../../src/theme';

export default function ExhibitorProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(visitor)');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Déconnexion impossible');
    }
  };

  return (
    <Screen>
      <ScrollView>
        <ScreenTitle title="Profil exposant" subtitle={user?.email} />
        <Card>
          <Text style={styles.row}>Nom : {user?.name}</Text>
          <Text style={styles.row}>Rôle : {user ? ROLE_LABELS[user.type] : '—'}</Text>
        </Card>
        <PrimaryButton label="Se déconnecter" onPress={handleSignOut} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { fontSize: 15, color: colors.text, marginBottom: spacing.sm },
});
