import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { ROLE_LABELS } from '../../../src/navigation/roleConfig';

export default function StaffProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <ScrollView>
        <ScreenTitle title="Profil staff" subtitle={user?.email} />
        <Text style={styles.row}>{user ? ROLE_LABELS[user.type] : ''}</Text>
        <PrimaryButton
          label="Se déconnecter"
          onPress={async () => {
            try {
              await signOut();
              router.replace('/(visitor)');
            } catch (e) {
              Alert.alert('Erreur', e instanceof Error ? e.message : 'Déconnexion impossible');
            }
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 16, fontSize: 15 },
});
