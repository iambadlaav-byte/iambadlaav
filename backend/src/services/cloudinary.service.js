/**
 * Cloudinary service — profile photo upload + signed URL helpers.
 *
 * Profile photo pipeline:
 *   buffer → upload_stream → transformation (400×400 fill face + f_auto/q_auto)
 *   f_auto re-encodes the image which strips EXIF metadata (T-06-09 / RESEARCH Pitfall 12).
 *   Resource stored at dnyanpith/profile-photos/<userId> (overwrite: true).
 *
 * EXIF stripping: Cloudinary's fetch_format:'auto' transformation forces a re-encode
 * into the optimal delivery format, which strips all original EXIF data including GPS.
 * This satisfies CONSTRAINT-MEDIA-001 and threat T-06-09.
 *
 * Never logs buffer contents or API secrets (CLAUDE.md backend rule / T-06-14).
 */
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../lib/logger.js';

// Config via environment variables — CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
// CLOUDINARY_API_SECRET must be set. At runtime without credentials, upload calls
// will throw — that is expected in local-preview mode without provisioning.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a profile photo buffer to Cloudinary.
 * Overwrites any prior photo for this userId (public_id is the userId).
 * Transformation: 400×400 face-fill crop + f_auto/q_auto for EXIF strip + optimal delivery.
 *
 * @param {Buffer} buffer  - image buffer from multer memoryStorage
 * @param {string} userId  - used as the Cloudinary public_id (scoped to folder)
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export function uploadProfilePhoto(buffer, userId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:          'dnyanpith/profile-photos',
        public_id:       userId,
        overwrite:       true,
        resource_type:   'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { fetch_format: 'auto', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error({ err: error, userId }, 'cloudinary.profile_photo.upload_failed');
          return reject(error);
        }
        logger.info({ publicId: result.public_id, userId }, 'cloudinary.profile_photo.uploaded');
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Upload a generic media image buffer to Cloudinary (stories, gallery, etc.).
 * Re-usable beyond stories — keep it generic so a Gallery feature can call it too.
 *
 * Transformation: max width 1600 (downscale only, never upscale) + f_auto/q_auto.
 * f_auto re-encodes into the optimal delivery format which strips all original
 * EXIF metadata including GPS (T-06-09 / CONSTRAINT-MEDIA-001).
 *
 * @param {Buffer} buffer            - image buffer from multer memoryStorage
 * @param {object} opts
 * @param {string} opts.folder       - Cloudinary folder (e.g. 'badlaav/stories')
 * @param {string} [opts.publicId]   - optional public_id; Cloudinary auto-generates if absent
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export function uploadMediaImage(buffer, { folder, publicId } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        ...(publicId ? { public_id: publicId } : {}),
        resource_type: 'image',
        transformation: [
          // crop:'limit' downscales oversized images but never upscales smaller ones
          { width: 1600, crop: 'limit' },
          { fetch_format: 'auto', quality: 'auto' }, // re-encode strips EXIF
        ],
      },
      (error, result) => {
        if (error) {
          logger.error({ err: error, folder }, 'cloudinary.media_image.upload_failed');
          return reject(error);
        }
        logger.info({ publicId: result.public_id, folder }, 'cloudinary.media_image.uploaded');
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Generate a signed URL for a private Cloudinary asset (e.g. invoice PDF).
 * Default expiry: 7 days (604800s) — enough for a user to download their invoice.
 *
 * @param {string} publicId   - Cloudinary public_id of the asset
 * @param {number} expirySec  - expiry in seconds (default 7 days)
 * @returns {string} signed URL
 */
export function signedInvoiceUrl(publicId, expirySec = 7 * 24 * 60 * 60) {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    type:          'authenticated',
    sign_url:      true,
    expires_at:    Math.floor(Date.now() / 1000) + expirySec,
  });
}

/**
 * Delete a Cloudinary asset by public_id.
 * Used when admin anonymizes a user (Plan 07 — right-to-erasure per §28.8).
 *
 * @param {string} publicId       - Cloudinary public_id
 * @param {string} resourceType   - 'image' | 'video' | 'raw'
 * @returns {Promise<object>} Cloudinary deletion result
 */
export async function deleteAsset(publicId, resourceType = 'image') {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  logger.info({ publicId, resourceType, result: result.result }, 'cloudinary.asset.deleted');
  return result;
}
