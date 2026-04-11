/**
 * Traductions pour les formulaires
 */

export const formsTranslations = {
  fr: {
    // Validation générale
    'form.required': 'Ce champ est requis',
    'form.invalid': 'Valeur invalide',
    'form.too_short': 'Trop court (minimum {{min}} caractères)',
    'form.too_long': 'Trop long (maximum {{max}} caractères)',
    'form.invalid_format': 'Format invalide',
    'form.must_match': 'Doit correspondre à {{field}}',
    
    // Email
    'form.email.invalid': 'Adresse email invalide',
    'form.email.required': 'Email requis',
    'form.email.exists': 'Cet email est déjà utilisé',
    'form.email.not_found': 'Email non trouvé',
    
    // Mot de passe
    'form.password.required': 'Mot de passe requis',
    'form.password.min_length': 'Au moins {{min}} caractères',
    'form.password.max_length': 'Maximum {{max}} caractères',
    'form.password.uppercase': 'Au moins une majuscule',
    'form.password.lowercase': 'Au moins une minuscule',
    'form.password.number': 'Au moins un chiffre',
    'form.password.special': 'Au moins un caractère spécial',
    'form.password.no_match': 'Les mots de passe ne correspondent pas',
    
    // Téléphone
    'form.phone.invalid': 'Numéro de téléphone invalide',
    'form.phone.required': 'Téléphone requis',
    'form.phone.format': 'Format : +237 6XX XX XX XX',
    
    // URL
    'form.url.invalid': 'URL invalide',
    'form.url.format': 'Format : https://example.com',
    
    // Dates
    'form.date.invalid': 'Date invalide',
    'form.date.required': 'Date requise',
    'form.date.past': 'La date doit être dans le passé',
    'form.date.future': 'La date doit être dans le futur',
    'form.date.min': 'Date minimale : {{date}}',
    'form.date.max': 'Date maximale : {{date}}',
    
    // Fichiers
    'form.file.required': 'Fichier requis',
    'form.file.too_large': 'Fichier trop volumineux (max {{size}})',
    'form.file.invalid_type': 'Type de fichier non supporté',
    'form.file.upload_error': 'Erreur lors du téléversement',
    
    // Nombres
    'form.number.invalid': 'Nombre invalide',
    'form.number.min': 'Minimum : {{min}}',
    'form.number.max': 'Maximum : {{max}}',
    'form.number.positive': 'Doit être positif',
    'form.number.integer': 'Doit être un entier',
    
    // Sélection
    'form.select.required': 'Veuillez faire une sélection',
    'form.select.placeholder': 'Sélectionner...',
    'form.select.no_options': 'Aucune option disponible',
    'form.select.search': 'Rechercher...',
    
    // Checkbox / Radio
    'form.checkbox.required': 'Vous devez cocher cette case',
    'form.terms.required': 'Vous devez accepter les conditions',
    'form.privacy.required': 'Vous devez accepter la politique de confidentialité',
    
    // Messages de succès
    'form.success.saved': 'Enregistré avec succès',
    'form.success.updated': 'Mis à jour avec succès',
    'form.success.deleted': 'Supprimé avec succès',
    'form.success.sent': 'Envoyé avec succès',
    'form.success.created': 'Créé avec succès',
    
    // Messages d'erreur
    'form.error.generic': 'Une erreur est survenue',
    'form.error.network': 'Erreur de connexion',
    'form.error.server': 'Erreur serveur',
    'form.error.timeout': 'Délai d\'attente dépassé',
    'form.error.unauthorized': 'Non autorisé',
    'form.error.forbidden': 'Accès refusé',
    'form.error.not_found': 'Non trouvé',
    
    // Additional
    'form.error.max_items': 'Maximum {{max}} éléments',
    
    // Actions de formulaire
    'form.action.submit': 'Soumettre',
    'form.action.save': 'Enregistrer',
    'form.action.cancel': 'Annuler',
    'form.action.reset': 'Réinitialiser',
    'form.action.clear': 'Effacer',
    'form.action.continue': 'Continuer',
    'form.action.back': 'Retour',
    'form.action.next': 'Suivant',
    'form.action.finish': 'Terminer',
    
    // Statuts
    'form.status.saving': 'Enregistrement...',
    'form.status.loading': 'Chargement...',
    'form.status.processing': 'Traitement...',
    'form.status.uploading': 'Téléversement...',
    'form.status.draft_saved': 'Brouillon sauvegardé',
    
    // Helpers
    'form.helper.optional': 'Optionnel',
    'form.helper.required': 'Requis',
    'form.helper.character_count': '{{count}}/{{max}} caractères',
    'form.helper.remaining': '{{count}} restants',
  },
  en: {
    // General validation
    'form.required': 'This field is required',
    'form.invalid': 'Invalid value',
    'form.too_short': 'Too short (minimum {{min}} characters)',
    'form.too_long': 'Too long (maximum {{max}} characters)',
    'form.invalid_format': 'Invalid format',
    'form.must_match': 'Must match {{field}}',
    
    // Email
    'form.email.invalid': 'Invalid email address',
    'form.email.required': 'Email required',
    'form.email.exists': 'This email is already in use',
    'form.email.not_found': 'Email not found',
    
    // Password
    'form.password.required': 'Password required',
    'form.password.min_length': 'At least {{min}} characters',
    'form.password.max_length': 'Maximum {{max}} characters',
    'form.password.uppercase': 'At least one uppercase letter',
    'form.password.lowercase': 'At least one lowercase letter',
    'form.password.number': 'At least one number',
    'form.password.special': 'At least one special character',
    'form.password.no_match': 'Passwords do not match',
    
    // Phone
    'form.phone.invalid': 'Invalid phone number',
    'form.phone.required': 'Phone required',
    'form.phone.format': 'Format: +237 6XX XX XX XX',
    
    // URL
    'form.url.invalid': 'Invalid URL',
    'form.url.format': 'Format: https://example.com',
    
    // Dates
    'form.date.invalid': 'Invalid date',
    'form.date.required': 'Date required',
    'form.date.past': 'Date must be in the past',
    'form.date.future': 'Date must be in the future',
    'form.date.min': 'Minimum date: {{date}}',
    'form.date.max': 'Maximum date: {{date}}',
    
    // Files
    'form.file.required': 'File required',
    'form.file.too_large': 'File too large (max {{size}})',
    'form.file.invalid_type': 'Unsupported file type',
    'form.file.upload_error': 'Upload error',
    
    // Numbers
    'form.number.invalid': 'Invalid number',
    'form.number.min': 'Minimum: {{min}}',
    'form.number.max': 'Maximum: {{max}}',
    'form.number.positive': 'Must be positive',
    'form.number.integer': 'Must be an integer',
    
    // Selection
    'form.select.required': 'Please make a selection',
    'form.select.placeholder': 'Select...',
    'form.select.no_options': 'No options available',
    'form.select.search': 'Search...',
    
    // Checkbox / Radio
    'form.checkbox.required': 'You must check this box',
    'form.terms.required': 'You must accept the terms',
    'form.privacy.required': 'You must accept the privacy policy',
    
    // Success messages
    'form.success.saved': 'Saved successfully',
    'form.success.updated': 'Updated successfully',
    'form.success.deleted': 'Deleted successfully',
    'form.success.sent': 'Sent successfully',
    'form.success.created': 'Created successfully',
    
    // Error messages
    'form.error.generic': 'An error occurred',
    'form.error.network': 'Connection error',
    'form.error.server': 'Server error',
    'form.error.timeout': 'Timeout exceeded',
    
    // Additional
    'form.error.max_items': 'Maximum {{max}} items',
    'form.error.unauthorized': 'Unauthorized',
    'form.error.forbidden': 'Access denied',
    'form.error.not_found': 'Not found',
    
    // Form actions
    'form.action.submit': 'Submit',
    'form.action.save': 'Save',
    'form.action.cancel': 'Cancel',
    'form.action.reset': 'Reset',
    'form.action.clear': 'Clear',
    'form.action.continue': 'Continue',
    'form.action.back': 'Back',
    'form.action.next': 'Next',
    'form.action.finish': 'Finish',
    
    // Statuses
    'form.status.saving': 'Saving...',
    'form.status.loading': 'Loading...',
    'form.status.processing': 'Processing...',
    'form.status.uploading': 'Uploading...',
    'form.status.draft_saved': 'Draft saved',
    
    // Helpers
    'form.helper.optional': 'Optional',
    'form.helper.required': 'Required',
    'form.helper.character_count': '{{count}}/{{max}} characters',
    'form.helper.remaining': '{{count}} remaining',
  },
};
