# Fiber & Electric Solutions Ltd.

Production-oriented website and content-management application for Fiber & Electric Solutions Ltd. (FES), established in 2008.

## Stack

- Next.js 16 App Router and React 19
- TypeScript (strict) and Tailwind CSS 4
- Firebase Authentication, Firestore and Storage
- Bun

## Local development

Install the locked dependencies and start the Webpack development server:

```powershell
bun install --frozen-lockfile
bun run dev
```

Copy `.env.example` to an ignored local environment file and provide only the values needed for the target environment. Never commit Firebase Admin credentials, SMTP credentials, session cookies or customer data.

The default Firebase tooling project is the local emulator project. Live quote submission and editorial-media writes fail closed unless their explicit environment gates and exact approved project/bucket allowlists match. See [Firebase setup](docs/FIREBASE_SETUP.md) and the [operations runbook](docs/FES_OPERATIONS_RUNBOOK.md).

## Current application

Public routes provide the homepage, company profile, electrical and fiber-optic services, category-based project gallery, articles/resources, quote request, contact and privacy experiences.

The protected CMS contains:

- Dashboard — live gallery, media, article/tip and enquiry summaries.
- Media & Projects — Gallery and Media Library tabs sharing one media pipeline and visual picker.
- Articles & Tips — articles, external resources, company updates and practical tips.
- Quote Requests — private enquiry review, notes, status and protected attachments.
- Site Content — public copy, services, and the editable three-slide homepage hero.
- Settings — public business and contact presentation settings.

Legacy administrator URLs are retained as redirects where bookmarks or old links may still exist. Existing project documents and slugs remain supported for public compatibility; the client-facing workflow is category-gallery based and does not expose a named-project creation action.

See [CMS structure](docs/CMS_STRUCTURE.md), [project media operations](docs/PROJECT_MEDIA.md), and [homepage slideshow management](docs/HOMEPAGE_SLIDESHOWS.md).

## Media architecture

Editorial uploads use server-authorized routes. Images are decoded and validated, originals remain private, and responsive WebP derivatives are served publicly only when eligible. Videos use browser-compatible source files and poster metadata; expensive transcoding is not performed in a Vercel request.

The reusable visual media picker is used by homepage hero slides, resources and site-content image fields. Referenced media cannot be silently deleted. Publication repositories return sanitized public records and exclude drafts.

The Tommy's Brentwood source archive, migration marker, originals and derivatives are historical production records and must be preserved. The idempotent migration script defaults to dry-run; do not apply it to production without explicit authorization.

## Verification

```powershell
bun run lint
bun run typecheck
bun run test:unit
bun run test:email
bun run test       # Firebase Auth, Firestore and Storage emulators
bun run build
```

Browser acceptance scripts under `scripts/` cover responsive public/admin workflows. Live-staging acceptance is target-locked and must only be run with explicit authorization.

On the affected Windows D: drive, dependency junction/corruption can prevent Vite or Next.js from writing generated files. Treat an `EPERM` under `node_modules/.vite-temp` or `.next` as an environment failure until reproduced from a healthy locked install; do not repeatedly reinstall into a known-corrupt directory.

## Deployment boundaries

- Set `SITE_URL` to the approved canonical HTTPS origin before indexing.
- Keep browser Firestore and Storage access deny-by-default.
- Do not change Rules, IAM, billing, retention policy or production data as part of an application deploy without separate approval.
- Verify security headers, robots/sitemap output, authenticated CMS workflows and rollback readiness on the deployed target.

The detailed security/performance status and remaining owner actions are recorded in [the security and performance audit](docs/FES_SECURITY_PERFORMANCE_AUDIT.md).
