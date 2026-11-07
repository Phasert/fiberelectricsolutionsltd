# FES CMS structure

The protected content manager has eight primary workspaces:

1. **Dashboard** — publication totals, draft counts, recent content, enquiries and quick actions.
2. **Projects** — complete project records, publication status, cover media and ordered galleries.
3. **Media Library** — the single store for editorial images and videos, crops, slideshow placement and usage-safe deletion.
4. **Articles & Tips** — one workspace for articles, resources and short tips while preserving their existing collections and public routes.
5. **Homepage** — references published projects, resources and enabled tips; it does not duplicate their records or files.
6. **Quote Requests** — private customer enquiries, attachments, notes and workflow status.
7. **Site Content** — general wording, service information and reusable calls to action.
8. **Settings** — company identity, contact details, social links, branding and SEO configuration.

Legacy admin URLs for Featured Content, Resources and Tips remain as redirects so bookmarks do not break. Existing resource and tip API routes and collections are intentionally retained; this is a workspace merge, not a destructive data migration.

## Content ownership

- Media Library owns files and media metadata.
- Projects and resources reference media IDs.
- Homepage references already-published content and enabled tips.
- Site Content owns general public wording and service information.

Public media eligibility is derived from published references. Private originals stay in `editorial/private/originals`; public pages use immutable optimized derivatives.

## Tommy's Brentwood migration

Tommy's Brentwood currently has a temporary code-backed fallback. `scripts/migrate-tommys-brentwood.mjs` prepares an idempotent Firebase project, five media records, optimized derivatives, reverse references and the slug record.

The script is dry-run by default:

```powershell
bun run cms:migrate:tommys
```

An emulator write requires `--apply`. A non-emulator write is additionally blocked unless `--allow-production` is supplied and `FES_APPROVED_FIREBASE_PROJECT` exactly matches the configured Firebase project. Production application and publication require explicit approval.

After a managed `projectSlugs/tommys-brentwood` record exists, Firestore becomes authoritative. Drafting or unpublishing that project removes it from the public project list, homepage fallback and public route. Previously cached or downloaded media cannot be revoked retroactively.

## Operational limitations

- HEIC normalization and expensive video transcoding stay in the offline import workflow; they are not run inside Vercel requests.
- Video upload accepts supported containers but poster generation and compatibility transcoding remain offline responsibilities.
- No Firebase rules, billing configuration or production content is changed by the application repository alone.
