/**
 * Script de nettoyage d'urgence pour localStorage
 * À exécuter dans la console navigateur si admin auto-connecté
 */

// Nettoyage complet
function cleanupAuth() {

  // Supprimer toutes les clés d'auth
  const keysToRemove = [
    'sib-auth-storage',
    'sb-sbyizudifmqakzxjlndr-auth-token',
    'supabase.auth.token',
    'supabase.auth.refreshToken'
  ];

  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });

  // Nettoyer sessionStorage
  sessionStorage.clear();

  // Vérifier ce qui reste
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
    }
  }

}

// Vérifier l'état actuel
function checkAuthStatus() {

  const authStorage = localStorage.getItem('sib-auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);

      if (parsed.state?.user?.type === 'admin') {
      }
    } catch (e) {
      console.error('❌ Impossible de parser le localStorage:', e);
    }
  } else {
  }

  // Vérifier Supabase
  const supabaseToken = localStorage.getItem('sb-sbyizudifmqakzxjlndr-auth-token');
  if (supabaseToken) {
  } else {
  }
}

// Export pour utilisation dans console
if (globalThis.window !== undefined) {
  (globalThis as any).cleanupAuth = cleanupAuth;
  (globalThis as any).checkAuthStatus = checkAuthStatus;
}

export { cleanupAuth, checkAuthStatus };
