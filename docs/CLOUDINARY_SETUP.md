# Cloudinary Setup — Media

Cloudinary stores all uploaded media (story photos, gallery images, profile photos) and the generated invoice PDFs.

---

## Get credentials

Cloudinary Dashboard → Settings → Access Keys (or the dashboard home).

| Value | Env var |
|---|---|
| Cloud name | `CLOUDINARY_CLOUD_NAME` |
| API key | `CLOUDINARY_API_KEY` |
| API secret | `CLOUDINARY_API_SECRET` |

The backend configures the SDK with `secure: true` (always HTTPS delivery). Without these vars, any upload call throws — expected in local preview mode without media provisioned.

---

## Folders used

| Folder | Contents | Access |
|---|---|---|
| `badlaav/invoices` | Generated invoice PDFs (raw resources). | **Authenticated** — served via signed URLs only. |
| `badlaav/stories` | Story CMS photos. | Public delivery. |
| `badlaav/gallery` | Gallery CMS images. | Public delivery. |
| `dnyanpith/profile-photos` | User profile photos (`public_id` = userId, overwrite on re-upload). | Public delivery. |

> Note: in the current code the profile-photo folder is literally `dnyanpith/profile-photos` (a carryover from the parent project). Story, gallery, and invoice folders are all under `badlaav/`. This only affects where assets are stored in your Cloudinary account; it does not affect the public site branding.

---

## Signed URLs for invoices

Invoice PDFs are stored as **authenticated** raw resources in `badlaav/invoices`, so they are not publicly fetchable by URL. The backend generates a **signed URL** when a user or admin needs to view/download one, with a default expiry of **7 days**. After expiry the link stops working and a fresh signed URL must be generated. This keeps financial documents from being shared or scraped.

---

## EXIF stripping (privacy)

All image uploads run through a Cloudinary transformation that includes `fetch_format: auto` (`f_auto`). `f_auto` re-encodes the image into the optimal delivery format, and that re-encode **strips all original EXIF metadata**, including GPS location. So uploaded photos do not leak where they were taken.

Additional transforms applied on upload:
- **Profile photos:** cropped to 400×400 (face-fill) + `f_auto`/`q_auto`.
- **Story / gallery images:** downscaled to max width 1600 (never upscaled) + `f_auto`/`q_auto`.

---

## Upload limits (enforced by the backend)

- Max file size: **2 MB** per image.
- Allowed types: **JPG, PNG, WEBP** only.
- Uploads are verified by **magic bytes**, not just the file extension or declared MIME type — a renamed/spoofed file is rejected with `415`. See [SECURITY.md](SECURITY.md).

---

## Asset durability and cleanup

- Cloudinary retains assets until explicitly deleted. The backend deletes a user's media when an admin **anonymizes** that user (GDPR right-to-erasure).
- See [BACKUP_AND_RECOVERY.md](BACKUP_AND_RECOVERY.md) for media durability notes.
