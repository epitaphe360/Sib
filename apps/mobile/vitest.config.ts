import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const LOGIC_COVERAGE_INCLUDE = [
  'src/lib/badgeAssetUrl.ts',
  'src/lib/networkingPermissions.ts',
  'src/lib/partnerTier.ts',
  'src/lib/avatarColor.ts',
  'src/lib/mediaUrl.ts',
  'src/lib/sanitizeIlike.ts',
  'src/lib/errors.ts',
  'src/lib/withTimeout.ts',
  'src/lib/withRetry.ts',
  'src/lib/locale.ts',
  'src/lib/demoQuickLogin.ts',
  'src/lib/supabaseError.ts',
  'src/lib/authTokens.ts',
  'src/lib/qrAccessLevels.ts',
  'src/lib/stripHtml.ts',
  'src/lib/badgeDisplay.ts',
  'src/data/bankTransfer.ts',
  'src/data/salons.ts',
  'src/data/urbaCatalog.ts',
  'src/navigation/roleConfig.ts',
  'src/config/brandAssets.ts',
  'src/config/banners.ts',
  'src/lib/floorPlanStandPins.ts',
];

export default defineConfig({
  plugins: [
    {
      name: 'react-native-static-assets',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/src/') && !id.includes('\\src\\')) return null;
        const transformed = code.replace(
          /require\((['"])([^'"]+\.(?:png|jpe?g|webp))\1\)/gi,
          '({ uri: "$2" })',
        );
        return transformed === code ? null : { code: transformed, map: null };
      },
    },
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.expo/**', '**/android/**'],
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
      '@mobile': resolve(__dirname, './src'),
      // Stub léger : évite de charger react-native (syntaxe Flow) dans les tests node.
      'expo-linking': resolve(__dirname, './tests/mocks/expo-linking.ts'),
    },
  },
});
