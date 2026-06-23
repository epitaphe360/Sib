/** Échelle typographique stricte — 6 niveaux */

export const typeScale = {
  /** Hero / onboarding — 34 */
  display: { fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  /** Titres écran — 26 */
  title: { fontSize: 26, lineHeight: 32, letterSpacing: 0.2 },
  /** Sous-titres / sections — 17 */
  subtitle: { fontSize: 17, lineHeight: 24, letterSpacing: 0.1 },
  /** Corps — 15 */
  body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  /** Labels / chips — 13 */
  label: { fontSize: 13, lineHeight: 18, letterSpacing: 0.3 },
  /** Captions / meta — 11 */
  caption: { fontSize: 11, lineHeight: 16, letterSpacing: 0.4 },
} as const;
