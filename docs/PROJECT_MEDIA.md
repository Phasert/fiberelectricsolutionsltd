# Project media operations

Administrators can create a project with only a name, optionally add a short description, attach ordered images and videos, select an image cover, and keep the result as a draft. Publication requires at least one valid media item and a cover. Public project pages mix images and videos in the saved order; videos use native controls and metadata-only preloading.

## Formats and limits

- Images: JPEG, PNG, WebP; 10 MB by default. Images are decoded, orientation-normalized, preserved privately, and emitted as responsive WebP derivatives.
- Videos: MP4 and QuickTime MOV; 150 MB by default. The server verifies an ISO media container signature and preserves the original. Browser-compatible video is served only when referenced by a published project.
- HEIC/HEIF: accepted by the archive preparation report but marked `requires-conversion`. Convert to a browser-safe image before admin upload while retaining the HEIC original outside Git.

Limits are configurable with `EDITORIAL_MEDIA_MAX_BYTES`, `EDITORIAL_VIDEO_MAX_BYTES`, and `EDITORIAL_MEDIA_DAILY_ADMIN_LIMIT`. Storage uploads remain protected by the existing server-only administrator session and approved-staging feature gate.

## Preparing a ZIP

Run:

```powershell
bun run media:prepare -- "public/Tommys Brent wood-1-001.zip" "Tommy's Brentwood"
```

The command extracts into the operating system temporary directory, hashes every file, detects exact duplicates, checks supported containers, preserves archive ordering by natural path order, and writes an ignored `media-imports/<slug>/manifest.json`. It does not upload or publish anything.

For Tommy's Brentwood, the supplied archive contains HEIC files and MOV videos. Convert HEIC to WebP/JPEG and use an asynchronous media worker with FFmpeg for video metadata, poster extraction, and H.264/AAC MP4 fallback. Do not run expensive transcoding in a Vercel request. A managed service can be evaluated later, but no paid dependency is required for compatible uploads.

## Tommy's Brentwood curation record

The local archive `Tommys Brent wood-1-001.zip` was inspected without accessing Google Photos. Its SHA-256 is `b0e4bfe38b5b89f6ae772753e12c848396b6ef552a305406740c0ed95e73ef71`.

Count reconciliation:

- Archive: 24 files — 12 images (11 HEIC and 1 PNG) and 12 video containers (7 MOV and 5 MP4).
- Album report: 19 visible items — 12 photos and 7 videos.
- Reconciliation: the five MP4 files share basenames and capture times with five HEIC photos and are 1–3 second Live Photo motion components. Excluding those paired components as separate gallery videos produces the album's 19 visible items. No archive files were silently discarded.
- Exact hash duplicates: none. Invalid or corrupt container signatures found by the local audit: none.

The prepared project remains local and is not present in Firebase:

- Name: `Tommy’s Brentwood`
- Slug: `tommys-brentwood`
- Description: blank
- Status: Draft
- Featured: false

Curated stills, verified from second-level capture metadata and visual inspection:

1. `IMG_0637.HEIC` — 9 Jul 2025, 15:20:57 — two open panelboards in a framed interior.
2. `IMG_0670.HEIC` — 2 Aug 2025, 11:49:18 — main breaker, copper busbars and yellow cabling. Recommended cover; suggested card focal point 50% x / 35% y.
3. `IMG_0775.HEIC` — 10 Sept 2025, 13:18:50 — wide equipment-room view.
4. `IMG_0776.HEIC` — 10 Sept 2025, 15:53:00 — breaker panel, copper busbars and colored cabling.
5. `IMG_0777.HEIC` — 11 Sept 2025, 11:18:46 — wider equipment-room view.

The proposed Featured Work still order is `IMG_0670.HEIC`, `IMG_0776.HEIC`, `IMG_0775.HEIC`. These portrait originals should not be forced into a wide crop; use the existing cover-card treatment with focal points, or retain a single cover if the composed layout clips important equipment. The general homepage hero remains unchanged.

Exclusions and review holds:

- `IMG_0778.PNG` is the unrelated 11 Sept 2025 child-on-a-ride item and must never be used on the FES website.
- `IMG_0634.HEIC` and `IMG_1864.HEIC` contain identifiable workers and remain excluded unless FES confirms public-use approval.
- `IMG_0661.MOV` matches the 23 Jul 2025 10-second candidate (10.498 seconds from local metadata). Full-quality playback review could not be completed with the available offline decoder, so it remains excluded pending human review.
- The remaining standalone videos are unselected. Live Photo MP4 companions are not treated as standalone gallery videos.
- Nothing in the archive is labelled or represented as fiber-optic work.

The machine's Windows codec can produce local review previews from HEIC, but the server's current Sharp build cannot process HEIC reliably. Approved selections therefore require deterministic HEIC-to-JPEG/WebP conversion before admin upload. FFmpeg is not installed, so video metadata normalization, poster extraction and compatibility transcoding remain pending. Temporary previews and generated manifests stay under ignored directories and are not committed.

The exact machine-readable draft selection is stored in `scripts/project-import-plans/tommys-brentwood.json`. Production action still requires approval to convert/upload media, create the Firebase draft, select homepage featured content, and later publish. Creating a draft does not authorize publication.

Firebase target audit (6 Nov 2026): `.firebaserc` defaults local tooling to the `fes-local` emulator project. The current local environment names `fesproject-45db0` and its Storage bucket, while the source-controlled editorial allowlist is hard-pinned to staging project `fesr-c3ae1` and bucket `fesr-c3ae1.firebasestorage.app`. This mismatch intentionally causes `MEDIA_LIVE_TARGET_INVALID`; therefore no live upload or draft creation can occur. Before any production-data action, the owner must explicitly identify and approve the intended Firebase project/bucket and the allowlist must be reconciled without weakening admin-session, trusted-origin, or deny-all client rules.

## Storage layout

- Private originals: `editorial/private/originals/<mediaId>/<version>/source.<ext>`
- Public image derivatives: `editorial/public/derivatives/<mediaId>/<version>/<variant>.webp`
- Firestore media records store type, checksum, size, dimensions when available, processing status, project assignment, accessibility text, and derivative references.

Deleting referenced media is blocked. Deleting a project removes references but does not silently delete original media. Firestore and Storage client rules remain deny-all; trusted server routes enforce administrator authorization and public publication eligibility.
