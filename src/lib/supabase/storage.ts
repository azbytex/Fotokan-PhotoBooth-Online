import { getSupabase } from './client';

export async function uploadPhotoboothImage(
  dataUrl: string,
  fileName: string
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    // If Supabase is not configured, return data URL directly
    return dataUrl;
  }

  try {
    // Convert base64 dataUrl to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const filePath = `sessions/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from('photobooth-photos')
      .upload(filePath, blob, {
        contentType: blob.type || 'image/png',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error, falling back to dataUrl:', error.message);
      return dataUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from('photobooth-photos')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Storage upload failed:', err);
    return dataUrl;
  }
}

