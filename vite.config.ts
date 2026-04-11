import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load local env files so process.env contains values during Vite config evaluation
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// ============================================
// Railway/Nixpacks: Map Railway env vars to VITE_ prefixed .env file
// Railway may store variables as SUPABASE_URL or VITE_SUPABASE_URL
// Vite ONLY reads VITE_ prefixed variables, so we must map both
// ============================================
const envMappings: Record<string, string[]> = {
  'VITE_SUPABASE_URL': ['VITE_SUPABASE_URL', 'SUPABASE_URL'],
  'VITE_SUPABASE_ANON_KEY': ['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
  'VITE_SUPABASE_SERVICE_ROLE_KEY': ['VITE_SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  'VITE_FIREBASE_API_KEY': ['VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY'],
  'VITE_FIREBASE_AUTH_DOMAIN': ['VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN'],
  'VITE_FIREBASE_PROJECT_ID': ['VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID'],
  'VITE_FIREBASE_STORAGE_BUCKET': ['VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET'],
  'VITE_FIREBASE_MESSAGING_SENDER_ID': ['VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID'],
  'VITE_FIREBASE_APP_ID': ['VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID'],
  'VITE_SHOW_DEMO_LOGINS': ['VITE_SHOW_DEMO_LOGINS', 'SHOW_DEMO_LOGINS'],
  'VITE_EXHIBITORS_SERVER_URL': ['VITE_EXHIBITORS_SERVER_URL', 'EXHIBITORS_SERVER_URL'],
};

// Find value for each VITE_ var, checking multiple possible names
const envLines: string[] = [];
for (const [viteKey, candidates] of Object.entries(envMappings)) {
  let value = '';
  let foundAs = '';
  for (const candidate of candidates) {
    if (process.env[candidate] && process.env[candidate]!.length > 0) {
      value = process.env[candidate]!;
      foundAs = candidate;
      break;
    }
  }
  if (value) {
    envLines.push(`${viteKey}=${value}`);
    console.log(`   ✅ ${viteKey} (from ${foundAs}) = ${value.substring(0, 15)}...`);
  } else {
    console.log(`   ❌ ${viteKey} — NOT FOUND in env (tried: ${candidates.join(', ')})`);
  }
}

const isRailwayRuntime = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.NIXPACKS
);

if (envLines.length > 0 && isRailwayRuntime) {
  const envPath = path.resolve(__dirname, '.env');
  fs.writeFileSync(envPath, envLines.join('\n') + '\n', 'utf8');
  console.log(`\n📝 Wrote ${envLines.length} VITE_ variables to .env (Railway runtime)`);
} else if (envLines.length > 0) {
  console.log(`\n📝 Loaded ${envLines.length} variables from local env files (.env/.env.local)`);
} else {
  console.log('⚠️  No VITE_ variables found in process.env! Check Railway Dashboard → Variables');
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 9323,
    hmr: {
      port: 9323,
      overlay: false
    },
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    // Fix COEP issue with reCAPTCHA
    middlewareMode: false,
    headers: {
      // COEP is disabled to allow reCAPTCHA and other cross-origin resources
      // 'Cross-Origin-Embedder-Policy': 'credentialless',
      // 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 9323,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      // Externalize optional dependencies that may not be installed
      external: ['@sentry/react'],
      output: {
        // Use content-based hashing for better cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'router-vendor': ['react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          'icons-vendor': ['lucide-react'],
          'radix-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slot'
          ],
          'charts-vendor': ['recharts'],
          'utils-vendor': ['zustand', 'clsx', 'tailwind-merge']
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* in production for security
        drop_debugger: true,
        pure_funcs: ['console.debug', 'console.trace']
      }
    },
    reportCompressedSize: false,
    cssCodeSplit: true,
    // Ensure proper cache busting with content-based hashing
    assetsInlineLimit: 0
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-avatar',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot'
    ],
  },
});
