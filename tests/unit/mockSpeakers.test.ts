import { describe, it, expect } from 'vitest';
import { MOCK_SPEAKERS } from '../../src/config/mockSpeakers';

describe('mockSpeakers', () => {
  it('should export an array of speakers', () => {
    expect(Array.isArray(MOCK_SPEAKERS)).toBe(true);
    expect(MOCK_SPEAKERS.length).toBeGreaterThan(0);
  });

  it('each speaker should have required fields', () => {
    MOCK_SPEAKERS.forEach((speaker) => {
      expect(speaker.id).toBeDefined();
      expect(speaker.first_name).toBeDefined();
      expect(speaker.last_name).toBeDefined();
      expect(speaker.title).toBeDefined();
      expect(speaker.company).toBeDefined();
      expect(speaker.bio).toBeDefined();
      expect(typeof speaker.featured).toBe('boolean');
    });
  });

  it('should have at least one featured speaker', () => {
    const featured = MOCK_SPEAKERS.filter(s => s.featured);
    expect(featured.length).toBeGreaterThan(0);
  });

  it('speakers should have unique IDs', () => {
    const ids = MOCK_SPEAKERS.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('speakers should have sort_order defined', () => {
    MOCK_SPEAKERS.forEach(speaker => {
      expect(typeof speaker.sort_order).toBe('number');
    });
  });
});
