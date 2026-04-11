import { allTranslations } from '../src/store/translations.js';
import { useLanguageStore } from '../src/store/languageStore.js';

console.log('🔍 Test des traductions...\n');

// Test 1: Vérifier que allTranslations est chargé
console.log('📦 allTranslations loaded:', !!allTranslations);
console.log('📦 Languages disponibles:', Object.keys(allTranslations));

// Test 2: Vérifier les clés nav
const frTranslations = allTranslations.fr;
console.log('\n🇫🇷 Traductions FR:');
console.log('  nav.home:', frTranslations['nav.home']);
console.log('  nav.exhibitors:', frTranslations['nav.exhibitors']);
console.log('  nav.partners:', frTranslations['nav.partners']);
console.log('  nav.networking:', frTranslations['nav.networking']);
console.log('  nav.information:', frTranslations['nav.information']);
console.log('  nav.login:', frTranslations['nav.login']);
console.log('  nav.register:', frTranslations['nav.register']);

console.log('\n✅ Test terminé');
