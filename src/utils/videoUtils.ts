
/**
 * Helper to convert various video URLs into embeddable iframe URLs.
 * Returns null if the URL cannot be converted or is not a supported video platform.
 */
export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Already an embed URL
    if (url.includes('/embed/')) return url;
    
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    // Already an embed URL
    if (url.includes('player.vimeo.com')) return url;

    const videoId = url.split('/').pop();
    // Basic check if it looks like an ID (usually numeric for Vimeo)
    if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
    }
  }

  // Dailymotion
  if (url.includes('dailymotion.com')) {
      if (url.includes('/embed/')) return url;
      const videoId = url.split('/video/')[1]?.split('?')[0];
      if (videoId) {
          return `https://www.dailymotion.com/embed/video/${videoId}`;
      }
  }

  // If we can't determine it's a safe embeddable video, return null
  // This prevents trying to frame sites like google.com
  return null;
};
