/**
 * Upload a File to Cloudinary using an unsigned preset.
 * Returns the secure_url of the uploaded asset.
 *
 * @param {File}   file   - Browser File object
 * @param {string} folder - Cloudinary folder (e.g. 'banners', 'products')
 * @returns {Promise<string>} secure CDN URL
 */
export async function uploadToCloudinary(file, folder = 'uploads') {
  const cloudName  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary env vars not configured (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `sarfowaa/${folder}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url;
}
