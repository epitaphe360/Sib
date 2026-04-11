/**
 * Service CDN pour optimisation médias
 * Support Cloudflare, Cloudinary, Imgix, BunnyCDN
 */

import { supabase } from '../lib/supabase';

export interface CDNConfig {
  provider: 'cloudflare' | 'cloudinary' | 'imgix' | 'bunny' | 'custom';
  cdn_url: string;
  auto_optimize: boolean;
  webp_conversion: boolean;
  lazy_loading: boolean;
  responsive_images: boolean;
  image_presets: Record<string, ImagePreset>;
}

export interface ImagePreset {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
}

export interface CDNImageOptions {
  preset?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

class CDNService {
  private config: CDNConfig | null = null;

  /**
   * Charger la configuration CDN
   */
  async loadConfig(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('cdn_config')
        .select('provider, cdn_url, auto_optimize, webp_conversion, lazy_loading, responsive_images, image_presets, is_active')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      this.config = data;
    } catch (error) {
      console.error('❌ Erreur loadConfig:', error);
      this.config = null;
    }
  }

  /**
   * Obtenir l'URL optimisée d'une image
   */
  async getOptimizedImageUrl(
    originalUrl: string,
    options?: CDNImageOptions
  ): Promise<string> {
    // Charger la config si pas encore fait
    if (!this.config) {
      await this.loadConfig();
    }

    // Si pas de CDN configuré, retourner l'URL originale
    if (!this.config || !this.config.auto_optimize) {
      return originalUrl;
    }

    // Appliquer le preset si spécifié
    let finalOptions = options;
    if (options?.preset && this.config.image_presets[options.preset]) {
      const preset = this.config.image_presets[options.preset];
      finalOptions = {
        ...preset,
        ...options, // options override preset
      };
    }

    // Générer l'URL selon le provider
    switch (this.config.provider) {
      case 'cloudflare':
        return this.getCloudflareImageUrl(originalUrl, finalOptions);

      case 'cloudinary':
        return this.getCloudinaryImageUrl(originalUrl, finalOptions);

      case 'imgix':
        return this.getImgixImageUrl(originalUrl, finalOptions);

      case 'bunny':
        return this.getBunnyImageUrl(originalUrl, finalOptions);

      default:
        return originalUrl;
    }
  }

  /**
   * Cloudflare Images URL
   */
  private getCloudflareImageUrl(url: string, options?: CDNImageOptions): string {
    if (!this.config) return url;

    const params: string[] = [];

    if (options?.width) params.push(`width=${options.width}`);
    if (options?.height) params.push(`height=${options.height}`);
    if (options?.quality) params.push(`quality=${options.quality}`);
    if (options?.format && options.format !== 'auto') params.push(`format=${options.format}`);
    if (options?.fit) params.push(`fit=${options.fit}`);

    const queryString = params.join(',');
    return `${this.config.cdn_url}/${queryString}/${encodeURIComponent(url)}`;
  }

  /**
   * Cloudinary URL
   */
  private getCloudinaryImageUrl(url: string, options?: CDNImageOptions): string {
    if (!this.config) return url;

    const transformations: string[] = [];

    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.quality) transformations.push(`q_${options.quality}`);
    if (options?.format && options.format !== 'auto') transformations.push(`f_${options.format}`);
    if (options?.fit) transformations.push(`c_${options.fit}`);

    const transformation = transformations.join(',');
    const encodedUrl = encodeURIComponent(url);

    return `${this.config.cdn_url}/image/fetch/${transformation}/${encodedUrl}`;
  }

  /**
   * Imgix URL
   */
  private getImgixImageUrl(url: string, options?: CDNImageOptions): string {
    if (!this.config) return url;

    const params = new URLSearchParams();

    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    if (options?.quality) params.append('q', options.quality.toString());
    if (options?.format && options.format !== 'auto') params.append('fm', options.format);
    if (options?.fit) params.append('fit', options.fit);

    // Auto WebP si supporté
    if (this.config.webp_conversion) {
      params.append('auto', 'format');
    }

    return `${this.config.cdn_url}/${encodeURIComponent(url)}?${params.toString()}`;
  }

  /**
   * BunnyCDN URL
   */
  private getBunnyImageUrl(url: string, options?: CDNImageOptions): string {
    if (!this.config) return url;

    const params = new URLSearchParams();

    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.quality) params.append('quality', options.quality.toString());

    return `${this.config.cdn_url}?url=${encodeURIComponent(url)}&${params.toString()}`;
  }

  /**
   * Générer un srcset pour responsive images
   */
  async getResponsiveSrcSet(originalUrl: string): Promise<string> {
    if (!this.config?.responsive_images) {
      return `${originalUrl} 1x`;
    }

    const sizes = [480, 768, 1024, 1920];
    const srcsetParts: string[] = [];

    for (const width of sizes) {
      const optimizedUrl = await this.getOptimizedImageUrl(originalUrl, { width });
      srcsetParts.push(`${optimizedUrl} ${width}w`);
    }

    return srcsetParts.join(', ');
  }

  /**
   * Générer une image avec lazy loading
   */
  getLazyLoadingAttributes(originalUrl: string, alt: string = ''): {
    src: string;
    'data-src': string;
    alt: string;
    loading: 'lazy';
    class: string;
  } {
    // Placeholder tiny base64 (1x1 transparent pixel)
    const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    return {
      src: placeholder,
      'data-src': originalUrl,
      alt,
      loading: 'lazy',
      class: 'lazyload',
    };
  }

  /**
   * Purger le cache CDN
   */
  async purgeCache(urls: string[]): Promise<boolean> {
    if (!this.config) {
      console.warn('CDN not configured');
      return false;
    }

    try {
      // Appeler l'Edge Function pour purger le cache
      const { error } = await supabase.functions.invoke('purge-cdn-cache', {
        body: {
          provider: this.config.provider,
          urls,
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur purgeCache:', error);
      return false;
    }
  }

  /**
   * Statistiques CDN
   */
  async getCDNStats(): Promise<{
    bandwidth_saved: number;
    requests_served: number;
    cache_hit_rate: number;
  } | null> {
    if (!this.config) return null;

    try {
      // Appeler l'Edge Function pour récupérer les stats
      const { data, error } = await supabase.functions.invoke('get-cdn-stats', {
        body: {
          provider: this.config.provider,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur getCDNStats:', error);
      return null;
    }
  }

  /**
   * Vérifier si le CDN est configuré
   */
  isConfigured(): boolean {
    return this.config !== null && this.config.auto_optimize;
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): CDNConfig | null {
    return this.config;
  }

  /**
   * Précharger une image
   */
  preloadImage(url: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Batch optimization de plusieurs images
   */
  async optimizeMultipleImages(
    urls: string[],
    options?: CDNImageOptions
  ): Promise<string[]> {
    const optimizedUrls = await Promise.all(
      urls.map(url => this.getOptimizedImageUrl(url, options))
    );
    return optimizedUrls;
  }
}

export const cdnService = new CDNService();
export default cdnService;
