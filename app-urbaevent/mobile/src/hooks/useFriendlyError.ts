import { useCallback } from 'react';
import { getErrorMessage } from '../lib/errors';
import { useI18n } from '../i18n/I18nProvider';

/** Message d'erreur lisible, traduit (FR/AR). */
export function useFriendlyError() {
  const { t } = useI18n();
  return useCallback(
    (error: unknown, fallbackKey = 'errors.generic') =>
      getErrorMessage(error, t(fallbackKey)),
    [t]
  );
}
