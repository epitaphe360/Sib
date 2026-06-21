import { Redirect } from 'expo-router';

/** Les salons sont présentés sur l'accueil UrbaEvent — évite la duplication. */
export default function SalonsScreen() {
  return <Redirect href="/(visitor)/(tabs)" />;
}
