import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the translations file
const translationsFile = path.join(__dirname, '../src/store/translations.ts');
let content = fs.readFileSync(translationsFile, 'utf-8');

// Keys to add to all 3 languages
const keysToAdd = {
  fr: `
    // Auth Additional
    'auth.forgotten_password': 'Mot de passe oublié',
    'auth.forgotten_password_desc': 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    'auth.email': 'Email',
    'auth.email_placeholder': 'votre@email.com',
    'auth.send_reset_link': 'Envoyer le lien',
    'auth.go_login': 'Aller à la page de connexion',
    
    // Common Errors
    'common.error_401': '401 - Accès non autorisé',
    'common.error_401_desc': 'Veuillez vous connecter pour accéder à cette page.',
    'common.error_403': '403 - Accès interdit',
    'common.error_403_desc': 'Vous n\\'avez pas les permissions nécessaires pour accéder à cette page.',
    'common.back_dashboard': 'Retour au tableau de bord',
    'common.sending': 'Envoi...',`,
  en: `
    // Auth Additional
    'auth.forgotten_password': 'Forgotten password',
    'auth.forgotten_password_desc': 'Enter your email address and we will send you a link to reset your password.',
    'auth.email': 'Email',
    'auth.email_placeholder': 'your@email.com',
    'auth.send_reset_link': 'Send reset link',
    'auth.go_login': 'Go to login page',
    
    // Common Errors
    'common.error_401': '401 - Unauthorized',
    'common.error_401_desc': 'Please log in to access this page.',
    'common.error_403': '403 - Forbidden',
    'common.error_403_desc': 'You do not have the necessary permissions to access this page.',
    'common.back_dashboard': 'Back to dashboard',
    'common.sending': 'Sending...',`,
  ar: `
    // Auth Additional
    'auth.forgotten_password': 'نسيت كلمة المرور',
    'auth.forgotten_password_desc': 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.',
    'auth.email': 'البريد الإلكتروني',
    'auth.email_placeholder': 'بريدك@email.com',
    'auth.send_reset_link': 'إرسال رابط التصفير',
    'auth.go_login': 'الذهاب لصفحة تسجيل الدخول',
    
    // Common Errors
    'common.error_401': '401 - غير مصرح',
    'common.error_401_desc': 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.',
    'common.error_403': '403 - ممنوع',
    'common.error_403_desc': 'ليس لديك الأذونات اللازمة للوصول إلى هذه الصفحة.',
    'common.back_dashboard': 'العودة إلى لوحة التحكم',
    'common.sending': 'جاري الإرسال...',`,
};

// Pattern to find where to insert in each language section
const patterns = {
  fr: /('password\.error': '[^']*',)(\s+)(},)/,
  en: /('password\.error': '[^']*',)(\s+)(},\s+ar:)/,
  ar: /('password\.error': '[^']*',)(\s+)(})/,
};

// Add keys to FR
content = content.replace(patterns.fr, `$1${keysToAdd.fr}$2$3`);

// Add keys to EN
content = content.replace(patterns.en, `$1${keysToAdd.en}$2$3`);

// Add keys to AR
content = content.replace(patterns.ar, `$1${keysToAdd.ar}$2$3`);

// Write back
fs.writeFileSync(translationsFile, content, 'utf-8');
console.log('✅ Translation keys added successfully');
