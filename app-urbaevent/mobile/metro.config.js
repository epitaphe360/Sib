const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Supabase web bundle — évite écran blanc Metro (Unable to resolve @opentelemetry/api)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@opentelemetry/api': require.resolve('@opentelemetry/api'),
};

module.exports = config;
