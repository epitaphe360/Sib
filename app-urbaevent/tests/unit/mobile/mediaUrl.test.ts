import { describe, it, expect } from 'vitest';
import {
  classifyMediaUrl,
  extractYoutubeId,
  extractVimeoId,
  buildEmbedHtml,
  resolveMediaSource,
} from '../../../../apps/mobile/src/lib/mediaUrl';

describe('Mobile — mediaUrl', () => {
  it('classifie les URLs', () => {
    expect(classifyMediaUrl('')).toBe('unknown');
    expect(classifyMediaUrl('https://youtube.com/watch?v=abc')).toBe('youtube');
    expect(classifyMediaUrl('https://youtu.be/abc')).toBe('youtube');
    expect(classifyMediaUrl('https://vimeo.com/123')).toBe('vimeo');
    expect(classifyMediaUrl('https://cdn.test/audio.mp3')).toBe('audio');
    expect(classifyMediaUrl('https://cdn.test/video.mp4')).toBe('direct');
  });

  it('extrait IDs YouTube', () => {
    expect(extractYoutubeId('https://youtube.com/watch?v=AbC123_xZ')).toBe('AbC123_xZ');
    expect(extractYoutubeId('https://youtu.be/AbC123_xZ')).toBe('AbC123_xZ');
    expect(extractYoutubeId('https://youtube.com/embed/AbC123_xZ')).toBe('AbC123_xZ');
    expect(extractYoutubeId('https://youtube.com/shorts/AbC123_xZ')).toBe('AbC123_xZ');
    expect(extractYoutubeId('https://example.com')).toBeNull();
  });

  it('extrait ID Vimeo', () => {
    expect(extractVimeoId('https://vimeo.com/987654')).toBe('987654');
    expect(extractVimeoId('https://vimeo.com/video/987654')).toBe('987654');
    expect(extractVimeoId('https://example.com')).toBeNull();
  });

  it('génère HTML embed', () => {
    expect(buildEmbedHtml('https://youtube.com/watch?v=abc')).toContain('youtube.com/embed/abc');
    expect(buildEmbedHtml('https://vimeo.com/123')).toContain('player.vimeo.com/video/123');
    expect(buildEmbedHtml('https://example.com/video.mp4')).toBeNull();
    expect(buildEmbedHtml('https://youtube.com/watch?v=abc123')).toContain('abc123');
  });

  it('buildEmbedHtml vimeo sans id', () => {
    expect(buildEmbedHtml('https://vimeo.com/')).toBeNull();
  });

  it('buildEmbedHtml youtube sans id', () => {
    expect(buildEmbedHtml('https://youtube.com/watch?v=')).toBeNull();
  });

  it('résout source média', () => {
    expect(resolveMediaSource('https://youtu.be/a', null)).toEqual({
      url: 'https://youtu.be/a',
      kind: 'youtube',
    });
    expect(resolveMediaSource(null, 'https://x.com/a.mp3')).toEqual({
      url: 'https://x.com/a.mp3',
      kind: 'audio',
    });
    expect(resolveMediaSource(null, null)).toEqual({ url: null, kind: 'unknown' });
  });
});
