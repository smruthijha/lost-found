/**
 * storage.js — Cloudinary free-tier image upload
 * Replaces Firebase Storage entirely. No extra npm package needed.
 *
 * Uses Cloudinary's unsigned upload API:
 * POST https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
 */

const CLOUD_NAME     = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET  = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload an image file to Cloudinary.
 *
 * @param {File}     file        - The image File object from input/drop
 * @param {Function} onProgress  - Optional callback: (percent: number) => void
 * @returns {Promise<string>}    - Resolves to the public HTTPS image URL
 */
export const uploadImage = (file, onProgress) =>
  new Promise((resolve, reject) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      reject(new Error("Cloudinary env vars missing. Check REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in your .env"));
      return;
    }

    const formData = new FormData();
    formData.append("file",           file);
    formData.append("upload_preset",  UPLOAD_PRESET);
    formData.append("folder",         "campus-lost-found");

    // Use XMLHttpRequest so we get upload progress
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        // Return a compressed version: max width 1200px, auto quality
        const optimizedUrl = data.secure_url.replace(
          "/upload/",
          "/upload/w_1200,q_auto,f_auto/"
        );
        resolve(optimizedUrl);
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.error?.message || "Cloudinary upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during image upload."));

    xhr.open("POST", UPLOAD_URL, true);
    xhr.send(formData);
  });

/**
 * Delete is not needed on the free plan for our use case —
 * Cloudinary manages storage automatically.
 * If you need it, use the Admin API (requires backend/server).
 */
export const deleteImage = async (_url) => {
  // No-op on free plan from browser (requires signed request with API secret)
  // To enable: set up a small Firebase Cloud Function or Vercel serverless function
  console.info("Image deletion skipped — use Cloudinary dashboard to manage assets.");
};