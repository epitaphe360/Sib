import { defineConfig, mergeConfig } from 'vitest/config';
import { resolve } from 'path';
import base from './vitest.config';

/** Fichiers logique mobile — objectif couverture 100 % */
const LOGIC_COVERAGE_INCLUDE = [
  'apps/mobile/src/lib/badgeAssetUrl.ts',
  'apps/mobile/src/lib/networkingPermissions.ts',
  'apps/mobile/src/lib/partnerTier.ts',
  'apps/mobile/src/lib/avatarColor.ts',
  'apps/mobile/src/lib/mediaUrl.ts',
  'apps/mobile/src/lib/sanitizeIlike.ts',
  'apps/mobile/src/lib/errors.ts',
  'apps/mobile/src/lib/withTimeout.ts',
  'apps/mobile/src/lib/withRetry.ts',
  'apps/mobile/src/lib/locale.ts',
  'apps/mobile/src/lib/demoQuickLogin.ts',
  'apps/mobile/src/lib/supabaseError.ts',
  'apps/mobile/src/lib/authTokens.ts',
  'apps/mobile/src/lib/qrAccessLevels.ts',
  'apps/mobile/src/lib/stripHtml.ts',
  'apps/mobile/src/lib/badgeDisplay.ts',
  'apps/mobile/src/data/bankTransfer.ts',
  'apps/mobile/src/data/salons.ts',
  'apps/mobile/src/data/urbaCatalog.ts',
  'apps/mobile/src/navigation/roleConfig.ts',
  'apps/mobile/src/config/brandAssets.ts',
  'apps/mobile/src/config/banners.ts',
  'apps/mobile/src/theme.ts',
];

export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        include: LOGIC_COVERAGE_INCLUDE,
        exclude: ['**/*.d.ts'],
        reporter: ['text', 'json-summary'],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
    resolve: {
      alias: {
        '@mobile': resolve(__dirname, './apps/mobile/src'),
      },
    },
  }),
);
