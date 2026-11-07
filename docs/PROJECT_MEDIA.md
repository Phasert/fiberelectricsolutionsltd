# Project media operations

Administrators can create a project with only a name, optionally add a short description, attach ordered images and videos, select an image cover, and keep the result as a draft. Publication requires at least one valid media item and a cover. Public project pages mix images and videos in the saved order; videos use native controls and metadata-only preloading.

## Formats and limits

- Images: JPEG, PNG, WebP; 10 MB by default. Images are decoded, orientation-normalized, preserved privately, and emitted as responsive WebP derivatives.
- Videos: MP4 and QuickTime MOV; 150 MB by default. The server verifies an ISO media container signature and preserves the original. Browser-compatible video is served only when referenced by a published project.
- HEIC/HEIF: accepted by the archive preparation report but marked `requires-conversion`. Convert to a browser-safe image before admin upload while retaining the HEIC original outside Git.

Limits are configurable with `EDITORIAL_MEDIA_MAX_BYTES`, `EDITORIAL_VIDEO_MAX_BYTES`, and `EDITORIAL_MEDIA_DAILY_ADMIN_LIMIT`. Storage uploads remain protected by the existing server-only administrator session and an explicit, fail-closed target registry. Live uploads require `EDITORIAL_MEDIA_LIVE_ENABLED=true`, `EDITORIAL_MEDIA_LIVE_ENVIRONMENT=staging|production`, and exact matching project and bucket allowlist values. The registered targets are staging `fesr-c3ae1` / `fesr-c3ae1.firebasestorage.app` and production `fesproject-45db0` / `fesproject-45db0.firebasestorage.app`; arbitrary environment values cannot authorize another target.

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

Before the authorized production migration, the prepared project was held locally with these intended values:

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

### Code-backed publication

On 6 Nov 2026, the five approved stills were converted offline from HEIC to orientation-preserving 1800-pixel-wide JPEG derivatives and added under `public/images/projects/tommys-brentwood/`. The originals remain ignored and uncommitted. A curated project record now provides `/projects/tommys-brentwood`, the published project listing entry, and a three-image Featured Work slideshow on the homepage. Firebase-managed records with the same slug replace the curated fallback automatically once an approved Firebase target is available, so the static publication does not create a duplicate public project. The fallback remains active until the approved migration creates `projectMigrations/tommys-brentwood`; after that marker exists, drafting, unpublishing or deleting the managed project cannot resurrect the fallback.

The migration preserves the complete source ZIP—12 images and 12 videos—under the private Storage source-archive prefix. The five selected HEIC originals have reviewed JPEG conversions and become Media Library records. The remaining 19 files remain recoverable from the private archive for future administrator review and are not automatically exposed or published.

The Featured Work slideshow uses the existing manual previous/next, dot, and pause controls; automatic advancement stops during interaction and for reduced-motion users. Portrait images use `object-contain` without zoom transforms so electrical equipment is not clipped. The general electrical-and-fiber hero remains unchanged.

Firebase target audit (7 Nov 2026): `.firebaserc` continues to default local tooling to the `fes-local` emulator project. The deployed browser bundle independently resolves Firebase Authentication to production project `fesproject-45db0`; the application configuration names bucket `fesproject-45db0.firebasestorage.app`. Editorial media now uses an immutable two-environment registry instead of a staging-only constant. This change adds an explicit production option while preserving staging protection, administrator sessions, trusted-origin checks, and deny-all browser client rules. The live gate remains off by default and this audit does not authorize a production write.

For a read-only migration preflight, use either Application Default Credentials via `GOOGLE_APPLICATION_CREDENTIALS` pointing to an untracked file outside the repository, or the existing ignored `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` pair. The identity needs only Firestore read access (for example `roles/datastore.viewer`) and Storage metadata/object read access (for example `roles/storage.objectViewer`) on `fesproject-45db0`. Never commit a key or place it in screenshots or logs. Run `node --env-file=.env.local scripts/migrate-tommys-brentwood.mjs --check-remote`; it performs no writes. A separate, explicitly approved write identity is required for the later import.

### Production-readiness evidence — 7 Nov 2026

- The credentialed `--check-remote` preflight passed against `fesproject-45db0` and bucket `fesproject-45db0.firebasestorage.app`. The bucket exists; the private archive object does not yet exist.
- No `projects/tommys-brentwood`, `projectSlugs/tommys-brentwood`, `projectMigrations/tommys-brentwood`, `mediaImportArchives/tommys-brentwood`, or any of the five deterministic media IDs exists. No duplicate media checksum was found.
- Anonymous production Firestore and Storage listing probes both returned HTTP 403. Repository deny-all client rules also passed the local emulator suite; no production rules were changed.
- Two independent dry-runs produced byte-identical plans (SHA-256 `9892563966d91adf3acfa7a48c5af76159cdf6bb55a83d949d34b061679584e0`). The apply path uses deterministic document/object IDs, checksum conflict guards, merge writes, preserved creation timestamps, and transactional slug/reference updates.
- Lint, route/type generation, 21 unit tests, 101 Firebase emulator tests, and the production build passed. The browser matrix passed at 1440, 768, 390, and 360 pixels for all eight admin workspaces, the public routes, `/projects`, and `/projects/tommys-brentwood`, with no overflow, unlabelled controls, failed requests, unexpected responses, or actionable console errors.
- The default migration remains Draft-only. For the separately authorized zero-downtime cutover, `--publish` is required: the script uploads and verifies every object, creates Ready media records, prepares a complete Draft project while the curated fallback remains active, then atomically publishes the project, claims the slug, writes references/archive inventory, remaps a legacy homepage selection when necessary, and creates the permanent fallback-suppression marker.

### Authorized production migration — 7 Nov 2026

The approved migration completed against Firebase project `fesproject-45db0` and Storage bucket `fesproject-45db0.firebasestorage.app`. The post-write authenticated preflight confirmed the project, slug, permanent migration marker, archive inventory, private archive object, and all five deterministic media records exist. Every selected media checksum still matches the reviewed local source. The project is Published with `tommys-brentwood-img-0670` as its cover.

Storage now contains 21 deterministic objects for this import: the complete private 24-file ZIP, five private reviewed JPEG originals, and 15 public WebP derivatives (`sm`, `md`, and `lg` for each selected photograph). The archive inventory records 24 originals—12 images and 12 videos—with five selected and 19 preserved but unpublished. Firestore contains the Published project, slug, fallback-suppression marker, archive inventory, five Ready media records, and five media-reference records.

The initial live check immediately after cutover still returned the curated image URLs from the application's one-hour server data cache. Tommy's Brentwood remained visible on the homepage, Projects listing, and unchanged detail URL during that interval. A clean production deployment is required to cold-start the managed read path; live Firebase-media and administrator verification must be recorded after that deployment before calling the transition complete.

The owner approved the zero-downtime Published import on 7 Nov 2026. The exact command is:

```powershell
$env:FES_APPROVED_FIREBASE_PROJECT='fesproject-45db0'
node --env-file=.env.local scripts/migrate-tommys-brentwood.mjs --check-remote --apply --publish --allow-production
```

This command uploads the complete 24-file ZIP privately, uploads and download-verifies the five reviewed JPEG originals plus responsive WebP derivatives, and creates the project, slug, migration marker, archive inventory, five media, and five media-reference records. The marker and Published project cut over in the same transaction only after the prepared Draft and every Ready media record pass verification. A completed rerun is a verified no-op; a partial or conflicting cutover stops. Run the read-only command once more immediately before the approved write window and stop on any newly reported conflict.

## Storage layout

- Private originals: `editorial/private/originals/<mediaId>/<version>/source.<ext>`
- Public image derivatives: `editorial/public/derivatives/<mediaId>/<version>/<variant>.webp`
- Firestore media records store type, checksum, size, dimensions when available, processing status, project assignment, accessibility text, and derivative references.

Deleting referenced media is blocked. Deleting a project removes references but does not silently delete original media. Firestore and Storage client rules remain deny-all; trusted server routes enforce administrator authorization and public publication eligibility.
