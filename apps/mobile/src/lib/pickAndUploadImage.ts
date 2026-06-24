import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export class ImagePickCancelled extends Error {
  constructor() {
    super('cancelled');
    this.name = 'ImagePickCancelled';
  }
}

function extFromUri(uri: string): string {
  const match = uri.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (match && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(match)) return match === 'jpeg' ? 'jpg' : match;
  return 'jpg';
}

function mimeFromExt(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

export async function pickAndUploadImage(userId: string, folder: string): Promise<string> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission refusée pour accéder à la galerie');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (result.canceled || !result.assets[0]?.uri) {
    throw new ImagePickCancelled();
  }

  const uri = result.assets[0].uri;
  const ext = extFromUri(uri);
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from('images').upload(path, blob, {
    contentType: mimeFromExt(ext),
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || 'Upload impossible');
  }

  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}
