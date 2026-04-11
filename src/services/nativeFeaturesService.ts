/**
 * Native Features Service
 * Gère les fonctionnalités natives (caméra, géolocalisation, etc.)
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Share, ShareResult } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';

class NativeFeaturesService {
  private isNative = Capacitor.isNativePlatform();

  /**
   * Prendre une photo avec la caméra
   */
  async takePhoto(): Promise<string | null> {
    if (!this.isNative) {
      toast.error('Cette fonctionnalité nécessite l\'application mobile');
      return null;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      return image.base64String ? `data:image/${image.format};base64,${image.base64String}` : null;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error('Erreur lors de la prise de photo');
      return null;
    }
  }

  /**
   * Choisir une image depuis la galerie
   */
  async pickImage(): Promise<string | null> {
    if (!this.isNative) {
      toast.error('Cette fonctionnalité nécessite l\'application mobile');
      return null;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      return image.base64String ? `data:image/${image.format};base64,${image.base64String}` : null;
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Erreur lors de la sélection de l\'image');
      return null;
    }
  }

  /**
   * Obtenir la position GPS actuelle
   */
  async getCurrentPosition(): Promise<Position | null> {
    if (!this.isNative) {
      // Fallback sur l'API Web Geolocation
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed
              },
              timestamp: position.timestamp
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Impossible d\'obtenir votre position');
            resolve(null);
          }
        );
      });
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      return position;
    } catch (error) {
      console.error('Error getting position:', error);
      toast.error('Impossible d\'obtenir votre position');
      return null;
    }
  }

  /**
   * Partager du contenu
   */
  async share(params: {
    title: string;
    text: string;
    url?: string;
  }): Promise<boolean> {
    if (!this.isNative) {
      // Fallback sur l'API Web Share
      if (navigator.share) {
        try {
          await navigator.share(params);
          return true;
        } catch (error) {
          console.error('Web Share error:', error);
          return false;
        }
      } else {
        toast.error('Le partage n\'est pas supporté sur ce navigateur');
        return false;
      }
    }

    try {
      await Share.share(params);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Erreur lors du partage');
      return false;
    }
  }

  /**
   * Sauvegarder un fichier
   */
  async saveFile(params: {
    path: string;
    data: string;
    directory?: Directory;
  }): Promise<boolean> {
    if (!this.isNative) {
      // Fallback: téléchargement via blob
      const link = document.createElement('a');
      link.href = params.data;
      link.download = params.path;
      link.click();
      return true;
    }

    try {
      await Filesystem.writeFile({
        path: params.path,
        data: params.data,
        directory: params.directory || Directory.Documents
      });

      toast.success('Fichier sauvegardé');
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Erreur lors de la sauvegarde');
      return false;
    }
  }

  /**
   * Obtenir les informations de l'appareil
   */
  async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!this.isNative) {
      return {
        model: 'Web Browser',
        platform: 'web',
        operatingSystem: 'unknown',
        osVersion: 'unknown',
        manufacturer: 'unknown',
        isVirtual: false,
        webViewVersion: 'unknown'
      };
    }

    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }

  /**
   * Vérifier le statut réseau
   */
  async getNetworkStatus(): Promise<ConnectionStatus | null> {
    if (!this.isNative) {
      return {
        connected: navigator.onLine,
        connectionType: 'wifi'
      };
    }

    try {
      const status = await Network.getStatus();
      return status;
    } catch (error) {
      console.error('Error getting network status:', error);
      return null;
    }
  }

  /**
   * Haptic feedback (vibration)
   */
  async vibrate(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.isNative) {
      // Fallback sur l'API Vibration du navigateur
      if (navigator.vibrate) {
        const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
        navigator.vibrate(duration);
      }
      return;
    }

    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light :
                         style === 'medium' ? ImpactStyle.Medium :
                         ImpactStyle.Heavy;

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }

  /**
   * Ouvrir une URL dans le navigateur natif
   */
  openUrl(url: string): void {
    if (this.isNative) {
      window.open(url, '_system');
    } else {
      window.open(url, '_blank');
    }
  }

  /**
   * Vérifier si c'est une plateforme native
   */
  isNativePlatform(): boolean {
    return this.isNative;
  }

  /**
   * Obtenir le nom de la plateforme
   */
  getPlatform(): string {
    return Capacitor.getPlatform();
  }

  /**
   * Vérifier si une fonctionnalité est disponible
   */
  isFeatureAvailable(feature: 'camera' | 'geolocation' | 'share' | 'filesystem' | 'haptics'): boolean {
    if (!this.isNative) {
      // Vérifier le support web
      switch (feature) {
        case 'camera':
          return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        case 'geolocation':
          return !!navigator.geolocation;
        case 'share':
          return !!navigator.share;
        case 'filesystem':
          return false;
        case 'haptics':
          return !!navigator.vibrate;
        default:
          return false;
      }
    }

    return Capacitor.isPluginAvailable(
      feature === 'camera' ? 'Camera' :
      feature === 'geolocation' ? 'Geolocation' :
      feature === 'share' ? 'Share' :
      feature === 'filesystem' ? 'Filesystem' :
      'Haptics'
    );
  }
}

export const nativeFeaturesService = new NativeFeaturesService();
export default nativeFeaturesService;
