/** Verrou global — évite double verifyOtp quand auth-callback remonte (Android / Gmail). */
let authCallbackInFlight = false;
let authCallbackDone = false;

export function tryBeginAuthCallback(): boolean {
  if (authCallbackDone || authCallbackInFlight) return false;
  authCallbackInFlight = true;
  return true;
}

export function markAuthCallbackDone(): void {
  authCallbackDone = true;
  authCallbackInFlight = false;
}

export function releaseAuthCallback(): void {
  authCallbackInFlight = false;
}

export function resetAuthCallbackState(): void {
  authCallbackInFlight = false;
  authCallbackDone = false;
}
