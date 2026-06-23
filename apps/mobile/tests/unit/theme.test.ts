import { describe, it, expect } from 'vitest';
import { colors, typography, spacing, radius, shadows, fonts } from '../../src/theme';

describe('Mobile — theme tokens', () => {
  it('couleurs plateforme UrbaEvent', () => {
    expect(colors.primary).toBe('#1B365D');
    expect(colors.platform.bg).toBe('#F9F9FF');
    expect(colors.platform.accentBlue).toBe('#4598D1');
    expect(colors.semantic.successGreen).toBe('#4CAF50');
  });

  it('typographie et espacements', () => {
    expect(typography.titleXl).toBe(34);
    expect(spacing.md).toBe(16);
    expect(radius.full).toBe(999);
  });

  it('ombres et polices', () => {
    expect(shadows.md.elevation).toBe(4);
    expect(fonts.body).toBe('Inter_400Regular');
    expect(fonts.display).toBe('PlayfairDisplay_700Bold');
  });
});
