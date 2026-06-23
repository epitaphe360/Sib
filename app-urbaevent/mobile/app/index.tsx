import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { BootScreen } from '../src/components/BootScreen';
import { isOnboardingComplete } from '../src/lib/onboarding';
import { getHomePath } from '../src/navigation/roleConfig';

const ONBOARDING_BOOT_MS = 800;
const AUTH_WAIT_MS = 5000;

export default function Index() {
  const { user, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isOnboardingComplete()
      .then((done) => { if (!cancelled) setOnboardingDone(done); })
      .catch(() => { if (!cancelled) setOnboardingDone(true); });
    const timer = setTimeout(() => {
      if (!cancelled) setOnboardingDone((prev) => (prev === null ? true : prev));
    }, ONBOARDING_BOOT_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setAuthTimedOut(true), AUTH_WAIT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const waiting = (isLoading && !authTimedOut) || onboardingDone === null;

  useEffect(() => {
    if (!waiting) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [waiting]);

  if (waiting) {
    return <BootScreen />;
  }

  if (!onboardingDone && !user) {
    return <Redirect href={'/onboarding' as never} />;
  }

  if (user) {
    return <Redirect href={getHomePath(user.type) as never} />;
  }

  return <Redirect href="/(visitor)/(tabs)" />;
}
