/**
 * @vitest-environment node
 * Tests — qualité statique du code mobile (sans runtime Expo)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const MOBILE_ROOT = resolve(__dirname, '../../../apps/mobile');

function read(path: string) {
  return readFileSync(join(MOBILE_ROOT, path), 'utf8');
}

function walkTsFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.expo') {
      walkTsFiles(full, acc);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('Mobile — qualité statique', () => {
  describe('versions et identité', () => {
    it('app.json et package.json alignés sur 1.0.16', () => {
      const appJson = JSON.parse(read('app.json'));
      const pkg = JSON.parse(read('package.json'));
      expect(appJson.expo.version).toBe('1.0.16');
      expect(pkg.version).toBe('1.0.16');
      expect(appJson.expo.name).toBe('UrbaEvent');
      expect(appJson.expo.android.package).toBe('com.urbacom.urbaevent');
    });
  });

  describe('assets logo', () => {
    const required = [
      'assets/brand/urbaevent-logo-master.png',
      'assets/brand/logo-sib2026.png',
      'assets/brand/logo-ministere.png',
      'assets/icon.png',
      'assets/splash.png',
      'assets/adaptive-icon.png',
      'assets/notification-icon.png',
    ];
    for (const f of required) {
      it(`fichier présent: ${f}`, () => {
        expect(existsSync(join(MOBILE_ROOT, f))).toBe(true);
      });
    }
  });

  describe('pas de code debug en production', () => {
    it('aucun fetch vers serveur debug local', () => {
      const srcDir = join(MOBILE_ROOT, 'src');
      const appDir = join(MOBILE_ROOT, 'app');
      const files = [...walkTsFiles(srcDir), ...walkTsFiles(appDir)];
      const offenders = files.filter((f) => {
        const content = readFileSync(f, 'utf8');
        return content.includes('127.0.0.1:7925') || content.includes('#region agent log');
      });
      expect(offenders).toEqual([]);
    });
  });

  describe('architecture UrbaEvent hub → salon', () => {
    it('SalonContext ne force pas SIB par défaut', () => {
      const ctx = read('src/context/SalonContext.tsx');
      expect(ctx).not.toMatch(/is_default|auto.*sib|SIB.*default/i);
      expect(ctx).toContain('@urbaevent/active_salon_id');
    });

    it('SalonGate protège les écrans salon', () => {
      const gated = [
        'app/(visitor)/(tabs)/badge.tsx',
        'app/(visitor)/(tabs)/explore.tsx',
        'app/(visitor)/map.tsx',
        'app/(visitor)/scan-connect.tsx',
        'app/(visitor)/(tabs)/network-hub.tsx',
      ];
      for (const f of gated) {
        const content = read(f);
        expect(content, `${f} doit utiliser SalonGate`).toContain('SalonGate');
      }
    });

    it('onglets Badge/Explorer masqués sans salon actif', () => {
      const layout = read('app/(visitor)/(tabs)/_layout.tsx');
      expect(layout).toContain('salonTabs');
      expect(layout).toContain('href: salonTabs ? undefined : null');
    });

    it('BrandLogo utilisé sur écrans clés', () => {
      for (const f of [
        'src/components/home/UrbaEventHomeHero.tsx',
        'app/(auth)/login.tsx',
        'app/onboarding.tsx',
        'src/components/guards/SalonGate.tsx',
      ]) {
        expect(read(f)).toContain('BrandLogo');
      }
    });
  });

  describe('permissions messages VIP', () => {
    it('NewMessageScreen vérifie canSendMessages', () => {
      expect(read('src/screens/NewMessageScreen.tsx')).toContain('canSendMessages');
    });
    it('speed-networking restreint aux VIP', () => {
      expect(read('app/(visitor)/speed-networking.tsx')).toContain('canSendMessages');
    });
  });

  describe('configuration build', () => {
    it('eas.json sans JWT secret client', () => {
      const eas = read('eas.json');
      expect(eas).not.toContain('EXPO_PUBLIC_JWT_SECRET');
      expect(eas).toContain('EXPO_PUBLIC_SITE_URL');
    });
    it('QR badge via Edge Function (pas de secret client)', () => {
      const qr = read('src/api/qr.ts');
      expect(qr).toContain("invoke('issue-badge-token'");
      expect(qr).not.toContain('EXPO_PUBLIC_JWT_SECRET');
    });
    it('google_play_url pointe vers com.urbacom.urbaevent', () => {
      expect(read('src/api/badgeConfig.ts')).toContain('com.urbacom.urbaevent');
    });
    it('logos badge par défaut bundlés (brand://)', () => {
      const cfg = read('src/api/badgeConfig.ts');
      expect(cfg).toContain("logo_main_url: 'brand://logo-sib2026.png'");
      expect(cfg).toContain("logo_ministry_url: 'brand://logo-ministere.png'");
    });
  });
});
