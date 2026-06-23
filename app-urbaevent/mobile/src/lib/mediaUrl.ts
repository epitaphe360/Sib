export type MediaStreamKind = 'direct' | 'youtube' | 'vimeo' | 'audio' | 'unknown';

export function classifyMediaUrl(url: string | null | undefined): MediaStreamKind {
  if (!url?.trim()) return 'unknown';
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('vimeo.com')) return 'vimeo';
  if (/\.(mp3|m4a|wav|ogg|aac)(\?|$)/i.test(lower)) return 'audio';
  return 'direct';
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/i,
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?&/]+)/i,
    /youtube\.com\/shorts\/([^?&/]+)/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] ?? null;
}

export function buildEmbedHtml(url: string): string | null {
  const kind = classifyMediaUrl(url);
  if (kind === 'youtube') {
    const id = extractYoutubeId(url);
    if (!id) return null;
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/></head><body style="margin:0;background:#000"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?playsinline=1&rel=0" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></body></html>`;
  }
  if (kind === 'vimeo') {
    const id = extractVimeoId(url);
    if (!id) return null;
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/></head><body style="margin:0;background:#000"><iframe width="100%" height="100%" src="https://player.vimeo.com/video/${id}?playsinline=1" frameborder="0" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe></body></html>`;
  }
  return null;
}

export function resolveMediaSource(videoUrl: string | null | undefined, audioUrl: string | null | undefined): {
  url: string | null;
  kind: MediaStreamKind;
} {
  const video = videoUrl?.trim() || null;
  const audio = audioUrl?.trim() || null;
  if (video) return { url: video, kind: classifyMediaUrl(video) };
  if (audio) return { url: audio, kind: 'audio' };
  return { url: null, kind: 'unknown' };
}
