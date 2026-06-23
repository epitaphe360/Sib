// Redirect to the tab registration screen
import { Redirect } from 'expo-router';

export default function OnSiteRegistrationRedirect() {
  return <Redirect href={'/(service-client)/(tabs)/registration' as never} />;
}
