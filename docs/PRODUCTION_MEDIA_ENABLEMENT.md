# Production media enablement

Media writes intentionally fail closed unless the deployment identifies the exact approved target twice. This is a staging safeguard, not a Firebase Storage rules problem: browser clients never write editorial files, while authenticated Node.js route handlers validate, process and write them with Firebase Admin.

## Required Vercel production settings

Set these only on the Production environment after owner approval:

```text
FIREBASE_PROJECT_ID=fesproject-45db0
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fesproject-45db0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fesproject-45db0.firebasestorage.app
EDITORIAL_MEDIA_LIVE_ENABLED=true
EDITORIAL_MEDIA_LIVE_ENVIRONMENT=production
EDITORIAL_MEDIA_ALLOWED_PROJECT_ID=fesproject-45db0
EDITORIAL_MEDIA_ALLOWED_BUCKET=fesproject-45db0.firebasestorage.app
```

Also provide either Application Default Credentials on the runtime or the encrypted `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` for a dedicated production service account. The account must be able to verify Firebase Authentication sessions, read/write the required Firestore CMS collections, and create/read/delete objects in this one Storage bucket. Grant the narrowest project/bucket IAM roles that satisfy those operations; do not reuse the staging identity or put credentials in the repository.

After changing Vercel environment variables, redeploy production. Confirm the Media Library reports `Approved production` before testing. Use a specifically approved test image, then verify upload, derivative delivery, gallery publish/hide, slideshow draft/publish, reference-safe deletion, and cleanup. Do not change Firebase rules, billing, IAM, or customer records as part of the code deployment.

HEIC and HEIF photographs are signature-checked and converted automatically to sanitized JPEG working data before optimized WebP derivatives are generated. The uploaded HEIC/HEIF source remains private. Unsupported HEIC variants fail with a conversion message rather than being published.
