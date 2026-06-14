/**
 * Upload middleware — multer (memoryStorage) + magic-byte verification.
 *
 * Security layers (CONSTRAINT-SEC-006 / ARCHITECTURE.md §30):
 *   1. multer fileFilter: MIME allow-list gate (first, cheap check)
 *   2. multer fileSize: 2MB hard cap
 *   3. verifyMagicBytes: reads actual file bytes via `file-type` and confirms
 *      the declared MIME matches the real file signature (second gate)
 *
 * NEVER write to disk before magic-byte verification — memoryStorage only.
 *
 * file-type v22 is ESM-only. Backend is also ESM (package.json "type":"module"),
 * so direct import works. No dynamic import wrapper needed (Pitfall 9 applies
 * only to CommonJS environments — this backend is pure ESM).
 *
 * Threat coverage: T-06-07 (file upload bypass via extension/MIME spoof).
 */
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

/** MIME types allowed for profile photos (T-06-07 allow-list). */
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * Simple HTTP error with a status code.
 * Used by upload middleware to return standard error responses.
 */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status  = status;
    this.statusCode = status; // express errorHandler reads either
  }
}

/**
 * profilePhotoUpload — multer single-file handler for profile photo endpoint.
 *
 * Config:
 *   - storage: memoryStorage() — file kept in req.file.buffer, never on disk
 *   - limits.fileSize: 2MB (CONSTRAINT-SEC-006)
 *   - limits.files: 1
 *   - fileFilter: MIME allow-list (first gate — fast reject before buffer is read)
 *
 * Field name expected: 'photo'
 */
export const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB — CONSTRAINT-SEC-006
    files:    1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new HttpError(415, 'Only JPG, PNG, WEBP files accepted.'));
    }
    cb(null, true);
  },
}).single('photo');

/**
 * verifyMagicBytes — magic-byte verification middleware.
 *
 * Must run AFTER profilePhotoUpload (req.file.buffer must exist).
 * Uses `file-type` to read the actual file signature from the buffer
 * and compares it against the declared MIME (threat T-06-07).
 *
 * Rejects with 415 if:
 *   - file-type cannot detect the type (corrupted / non-image)
 *   - detected MIME does not match declared MIME (polyglot / MIME spoof)
 *   - detected MIME is not in the allow-list
 *
 * Per RESEARCH "Don't Hand-Roll → File type detection" and Security Domain V12.
 */
export async function verifyMagicBytes(req, res, next) {
  try {
    // If multer found no file, skip — route handler should return 400
    if (!req.file) return next();

    const result = await fileTypeFromBuffer(req.file.buffer);

    if (!result) {
      return res.status(415).json({ error: 'File type could not be determined. Upload a JPG, PNG, or WEBP image.' });
    }

    if (!ALLOWED_MIMES.has(result.mime)) {
      return res.status(415).json({ error: `Only JPG, PNG, WEBP files accepted. (You uploaded a ${result.mime}.)` });
    }

    // The declared MIME from the client must match the actual magic bytes
    if (result.mime !== req.file.mimetype) {
      return res.status(415).json({ error: 'File contents do not match declared type.' });
    }

    // Attach detected type for downstream use
    req.file.detectedMime = result.mime;
    next();
  } catch (err) {
    next(err);
  }
}
