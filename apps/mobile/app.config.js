import { readFileSync } from 'fs';
import { join } from 'path';

const appJson = JSON.parse(readFileSync(join(__dirname, 'app.json'), 'utf8'));

/** Injecte EAS projectId depuis env (sans committer l'ID). */
export default () => {
  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    appJson.expo.extra?.eas?.projectId;

  return {
    ...appJson.expo,
    userInterfaceStyle: 'light',
    extra: {
      ...appJson.expo.extra,
      eas: {
        ...appJson.expo.extra?.eas,
        projectId,
      },
    },
    android: {
      ...appJson.expo.android,
      enableDangerousExperimentalLeanBuilds: false,
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            abiFilters: ['arm64-v8a'],
          },
        },
      ],
    ],
  };
};
