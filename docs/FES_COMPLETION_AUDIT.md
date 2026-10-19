# FES Website Completion Audit

**Audit date:** 19 October 2026

**Contract baseline:** RS Technology Group x Fiber & Electric Solutions Ltd. Website Design & Development Proposal, dated 5 October 2026
**Repository baseline:** working tree as inspected on 14 October 2026; the tree contained pre-existing modified and untracked frontend/admin work. This audit adds only this document.

## Firebase Storage confirmation and development-plan update - 19 October 2026

This update supersedes the earlier assumption that Cloud Storage still needed to be provisioned or that billing had not been approved. It is a readiness review only: no object was listed, uploaded, downloaded or deleted; no billing, bucket, IAM, retention, lifecycle or rule setting was changed; and Phase D2 was not started.

### Owner-confirmed information

- `fesr-c3ae1` remains the official development/staging Firebase project.
- The project is already on a paid Firebase plan.
- Cloud Storage has already been configured and the existing bucket is the bucket the owner intends the application to use.

Billing-plan status is recorded as owner-confirmed because the installed Firebase CLI does not expose the plan. Codex did not independently inspect or modify the linked Cloud Billing account.

### Independently verified configuration

- The signed-in Firebase CLI can access active project `fesr-c3ae1`; Firebase reports that its default Storage bucket has been created.
- Both public and server project variables in the ignored local environment select `fesr-c3ae1`. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` selects `fesr-c3ae1.firebasestorage.app`; no Auth, Firestore or Storage emulator host is set in that staging environment.
- A metadata-only request using the locally configured Firebase Admin SDK credentials successfully reached `fesr-c3ae1.firebasestorage.app`. The bucket reports `US-EAST1`, regional `STANDARD` storage, no configured retention policy, object versioning disabled and no lifecycle rules. This proves the credentials can initialize the correct bucket and read bucket metadata; it does not claim write/delete access because no live object mutation was authorized.
- `.env.local` remains excluded by the repository's `.env*` ignore rule. No credential value was printed or added to Git.
- The application initializes Admin Storage from `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, so it points at the verified bucket. However, repository upload, object read and deletion operations still call the deliberate `LIVE_STORAGE_NOT_APPROVED` guard whenever the Storage emulator host is absent. The administrator UI therefore continues to show **Live uploads blocked**.
- The checked-in `storage.rules` deny all browser reads and writes, including the separate `quote-photos/` namespace. This is appropriate for the current server-only Admin SDK architecture. The deployed ruleset was not retrieved, so parity between the checked-in and deployed rules is not independently verified.

### Phase C6 Media Library readiness

The emulator-tested foundation should be preserved. It already provides approved-administrator session checks, trusted-origin upload/update/delete routes, server-only Admin SDK access, separate `editorial/images/...` naming, JPEG/PNG/WebP allowlisting, a configurable 10 MiB limit, file-signature and dimension checks, required alt text, captions, project/category metadata, upload progress, failed-upload cleanup metadata, and cross-collection reference scanning before deletion.

Real editorial uploads still require a deliberately reviewed Phase D2 change set:

1. Replace the emulator-only guard with an explicit, default-off live-editorial-media feature flag bound to `fesr-c3ae1`; retain independent administrator and trusted-origin checks on every mutation.
2. Audit the deployed Storage rules and the bucket's IAM/ACL posture. Bucket metadata currently reports uniform bucket-level access disabled and public-access prevention inherited. Confirm that no legacy object ACL or IAM grant can bypass the intended controlled delivery path. Do not deploy a rules or IAM change without owner approval.
3. Add transactional Ready-media reference validation to projects, resource covers, site content, services, featured content and branding. Normalize the resource `coverImage` and branding URL fields to media IDs, and add gallery cover/ordering controls to the existing project editor.
4. Replace the current collection scan with a transactional reverse-reference model so upload attachment and deletion cannot race. Deletion must remain blocked while any draft or published record references an image.
5. Add optimization and derivative generation, metadata stripping and a bounded pixel/decompression policy. Store originals privately; expose only approved published derivatives through a controlled server route or another separately approved delivery design. The present `/api/admin/media/{id}/file` route is administrator-only, private/no-store and unsuitable for public pages.
6. Keep future customer quote photographs in a separate private namespace and authorization path. They must never reuse editorial delivery URLs, public derivatives or editorial retention rules.
7. Decide and document upload quotas/rate limits, derivative sizes and formats, cache policy, abandoned-upload cleanup scheduling, retention/recovery policy, monitoring and incident handling. The bucket currently has no retention policy, versioning or lifecycle rule; this is a policy decision, not a provisioning failure.
8. Extend emulator integration coverage for live-mode feature gating, Ready-reference validation, concurrent reference/delete behavior, derivative failures and cleanup. Perform a separately authorized, clearly labelled live staging upload/read/delete acceptance test only after the reviewed code and policy are approved.

No Firestore index change is identified by this readiness review because Phase D2 queries have not been implemented. Any index or rules change discovered during implementation must be reported and approved before deployment.

### Decisions and authorization still required

- Approve starting Phase D2 after D1c-2 and D1c-3 are complete.
- Approve the live-editorial-media feature flag and one bounded staging acceptance upload/delete test.
- Approve the public derivative/delivery design, optimization formats and sizes, cache lifetime and image-rights/alt-text responsibilities.
- Approve maximum upload size/count/rate, operational retention, failed-upload cleanup interval, recovery/backup expectations and deletion authority.
- Approve any proposed deployed Storage-rule, bucket IAM/ACL, CORS, lifecycle or Firestore-index change after reviewing its exact diff. None is approved by this update.

### Updated development sequence

1. Finish **Phase D1c-2 - Featured Content and Tips**.
2. Complete **Phase D1c-3 - Business Settings and Contact Details**.
3. Begin **Phase D2 - Real Editorial Media and Public Galleries**, subject to the approvals above.
4. Complete **Phase D3 - Real Quote Submissions**.
5. Complete **Phase D4 - Private Quote Photo Uploads**.
6. Complete **Phase D5 - Administrator Enquiry Management**.
7. Perform **Phase E testing** and **Phase F launch preparation**.

The existing bucket is correctly selected and operational for metadata access, and the Media Library has a sound emulator-tested base. It is not yet safe or enabled for live uploads because the explicit live gate, deployed-policy/IAM review, reference integrity, derivatives and operating-policy approvals remain outstanding. Phase D2 therefore should not start immediately: D1c-2 and D1c-3 come first, followed by explicit authorization for the reviewed D2 scope.

## Phase D1c-1 public Services and Site Content integration - 19 October 2026

Phase D1c-1 is implemented and verified from `C:\fes-dev\fiberelectricsolutionsltd`. The homepage copy/CTA fields, Electrical, Fiber Optic and About pages now use published Firestore site-content snapshots and enabled published services through server-only Firebase Admin SDK reads. Featured placements, tips, business settings, quotes, live Storage, billing, rules and production were not changed.

### Implemented

- Strict public DTOs validate version 1 documents, whitelist approved copy/service fields, exclude audit and media identifiers, enforce service category/order, and reject disabled, draft, malformed or clearly labelled staging/browser/emulator fixtures.
- `/electrical` and `/fiber-optic` preserve their approved heroes, service grids, project sections, CTAs and responsive styling while removing hardcoded demonstration-service fallback. Missing approved services produce explicit non-misleading empty states.
- Homepage hero, service and about copy plus enabled Homepage CTA placements use published snapshots. Featured content and tips remain unchanged for D1c-2. About uses published overview/capability copy, approved services and an enabled About CTA; absent content uses clearly labelled structural copy rather than business claims.
- Published project cards use the existing D1a repository. Home/About additionally suppress clearly labelled Phase/staging/browser/emulator fixtures so test records are not promoted into these new placements.
- Public page metadata uses published headings/descriptions when available and `SITE_URL` canonicals. Successful site-content and service saves immediately expire dedicated tags and revalidate `/`, `/electrical`, `/fiber-optic` and `/about`.

### Verification evidence

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | No diagnostics. |
| `bun run typecheck` | 0 | Next route types generated; no TypeScript diagnostics. |
| `bun run build` | 0 | Next.js 16.3.8 Webpack production build completed; the four integrated pages are server-rendered on demand. |
| `bun run test` | 0 | Firebase Auth, Firestore and Storage emulators ran 11 files / 58 tests; all passed. Offline metadata lookup warnings were non-fatal. |

The six new emulator tests cover published/enabled visibility, disabled and draft exclusion, administrator ordering, category isolation, strict public-field sanitization, published snapshot/draft isolation, missing/malformed/fixture records and cache/path invalidation. Existing Phase B, C, D1a and D1b tests remained green.

Read-only Edge acceptance against `fesr-c3ae1` passed at desktop and 390 x 844 mobile widths. Electrical rendered the existing approved published service set in administrator order; Fiber rendered the safe empty state; Homepage and About used safe structural content because existing Phase-labelled page/project fixtures were excluded. Navigation, responsive menu, illustrations, cards and CTAs retained the approved design, and `/projects` plus `/resources` still loaded. No staging record was created, edited, published or deleted.

The verified Phase D1c-1 implementation was committed on `main` as `ca637a5` with subject `feat: connect public services and site content`. The reviewed commit contains only the 13 intended source, test and documentation paths; `.env.local`, credentials, generated output and unrelated files were excluded. This audit-only follow-up records the implementation hash before both commits are pushed normally to `origin/main`.

### Remaining limitations and next gate

- The current staging project needs client-approved published Homepage, Electrical, Fiber, About and CTA snapshots for a final content-specific acceptance pass. Existing labelled verification records intentionally remain hidden.
- Service and page images remain approved static illustrations until the D2 media-ID/public-derivative work and Storage approvals are complete.
- The next authorized slice should be **D1c-2: published tips and featured placements**. Business settings remain D1c-3. Neither has started.

## Phase D1b public Resources and Articles integration - 19 October 2026

Phase D1b is implemented and verified from `C:\fes-dev\fiberelectricsolutionsltd`. Public `/resources` and `/resources/[slug]` reads now use the server-only Firebase Admin SDK repository while preserving the approved library, search, category filters, article layout and responsive styling. No live record, Storage bucket, billing setting, Firebase rule or production deployment was changed.

### Implemented

- Strict `PublicArticle` and `PublicExternalResource` contracts expose only approved fields. Runtime validation requires `Published`, rejects unsafe external protocols, excludes records explicitly marked `stagingOnly` or with a non-public audience, and conservatively suppresses clearly labelled Phase/browser/emulator fixtures.
- Internal articles resolve through the transactional slug registry and render a second sanitized, structured rich-text pass. External resources remain direct attributed HTTPS links; drafts, unpublished records, external-resource slugs, malformed slugs and missing records return no public article.
- Resource covers resolve only to approved local static SVGs. Missing or unavailable administrator media receives the existing category placeholder, so private media routes and unapproved Storage URLs are never exposed.
- Dynamic metadata uses `SITE_URL` for canonical and Open Graph URLs. Internal articles emit escaped `Article` JSON-LD; missing content is `noindex`. The sitemap includes only published internal articles, never external links or drafts.
- Public reads use tagged Next.js data caching with a one-hour fallback. Successful administrator create, edit, publish, unpublish and delete operations expire the resource tag and revalidate the listing, detail-route pattern and sitemap.

### Verification evidence

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | No diagnostics. |
| `bun run typecheck` | 0 | Next route types generated; no TypeScript diagnostics. |
| `bun run build` | 0 | Next.js 16.3.8 Webpack production build completed; `/resources` and `/resources/[slug]` are server-rendered on demand and the sitemap retains its cache boundary. |
| `bun run test` | 0 | Firebase Auth, Firestore and Storage emulators ran 10 files / 52 tests; all passed. Offline metadata lookup warnings were non-fatal. |

The seven D1b integration tests cover published article/external-resource visibility, draft and staging-fixture isolation, unpublishing, invalid/unknown/external slugs, second-pass rich-text sanitation, safe link rendering, public-field whitelisting, media fallbacks, metadata/noindex behavior, sitemap filtering and cache invalidation. Existing Phase B, C and D1a tests remained green.

Read-only Edge acceptance testing against `fesr-c3ae1` confirmed the resource library loads, retains its search/category controls and excludes the existing clearly labelled `Phase C2 Browser Resource` fixture despite that record currently being published. With no approved published internal article in staging, the correct approved empty state displayed and an unknown article returned HTTP 404. The browser pass did not create, edit, publish or delete staging data. Internal article layout, sanitation and navigation remain emulator/build verified pending client-approved content for a live acceptance pass.

The verified Phase D1b implementation was committed on `main` as `84053bc` with subject `feat: connect public resources to Firestore`. The reviewed commit contains only the 13 intended source, style, test and documentation paths; `.env.local`, credentials, generated output and unrelated files were excluded. This audit-only follow-up records the implementation hash before both commits are pushed normally to `origin/main`.

### Remaining limitations and next gate

- Resource images intentionally use approved static placeholders until Storage ownership, Blaze billing, immutable bucket region and public-derivative policy are approved. The existing resource `coverImage` string should be normalized to the shared media-ID model in D2.
- The fixture-name exclusion is a conservative interim safety net. Future test records should set the explicit non-public audience/staging marker, and approved business content should never be named like a Phase/browser/emulator fixture.
- Real article copy, attribution, external destinations, image rights and publication approval remain client-owned launch dependencies.
- The next recommended milestone is **Phase D1c: published site content, services, tips, featured placements and public business settings**, delivered as small public-read slices without enabling Storage. It must not begin without separate authorization.

## Phase D1a public Projects and Galleries integration - 19 October 2026

Phase D1a is implemented and verified from `C:\fes-dev\fiberelectricsolutionsltd`. The public `/projects` listing, `/projects/[slug]` detail route and project sitemap entries now read published Firestore projects through a server-only Firebase Admin SDK repository. No browser Firestore client access, live Storage activation, billing change, rule deployment, production deployment or staging-data mutation was performed.

### Implemented

- A strict `PublicProject` contract whitelists public fields instead of returning raw Firestore documents or administrator audit metadata. Runtime validation rejects malformed records and any record whose status is not `Published`.
- The listing preserves the existing search, category filters, card layout, animation and responsive design. The detail route preserves the approved project layout and returns the existing not-found experience for unknown, invalid, draft or unpublished slugs.
- Ordered gallery references preserve administrator-provided alt text and captions. Because live Firebase Storage remains unapproved, all unavailable editorial media resolves to the existing category-specific static project illustration; no administrator-only media URL is exposed.
- Project metadata now uses each published title and summary, an environment-derived `SITE_URL` canonical, a safe static Open Graph placeholder and `noindex` metadata for missing/unpublished records. The sitemap queries the same published public repository and excludes drafts.
- Public project reads use Next.js data caching with a one-hour fallback revalidation. Successful administrator create, edit, publish, unpublish and delete operations expire the shared project tag and revalidate the listing, detail-route pattern and sitemap immediately.

### Verification evidence

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | No diagnostics. |
| `bun run typecheck` | 0 | Next route types generated; no TypeScript diagnostics. |
| `bun run build` | 0 | Next.js 16.3.8 Webpack production build completed; `/projects` and `/projects/[slug]` are server-rendered on demand and the sitemap retains its cache boundary. |
| `bun run test` | 0 | Firebase Auth, Firestore and Storage emulators ran 9 files / 45 tests; all passed. Offline metadata lookup warnings were non-fatal. |

The seven new emulator integration tests cover published visibility, draft isolation, unpublishing, unknown/invalid slugs, gallery ordering, missing-media fallback, public-field sanitization, canonical/noindex metadata, sitemap filtering and cache/path invalidation. Existing Phase B/C tests remained green.

Edge acceptance testing against staging project `fesr-c3ae1` confirmed the existing published record appears on `/projects`, its title/category/summary/location/period and ordered gallery render on the detail page, and an unknown slug produces HTTP 404. Desktop and responsive 390 x 892 views retain the approved navigation, typography, filters, cards, project details and gallery layout. The browser pass was read-only and used the existing clearly labelled staging fixture; no demonstration record was created, edited or published.

The verified Phase D1a implementation and this audit entry were committed on `main` as `8f2ae73` with subject `feat: connect public projects to Firestore` and pushed normally to `origin/main`. The commit contains only the 12 reviewed source, test and documentation paths; `.env.local`, credentials, generated output and unrelated files were not included.

### Remaining limitations and next gate

- Public project images intentionally remain approved static category placeholders until Firebase Storage ownership, Blaze billing, immutable bucket region, budgets and public-derivative policy are approved. Phase D1a does not expose the emulator-only administrator media route.
- Existing staging content is suitable only for verification. Real project copy, photography, image rights and publication approval remain client-owned launch dependencies.
- The next recommended milestone is **Phase D1b: published Resources and Articles integration**, using the same public DTO, draft isolation, metadata, sitemap and cache-invalidation boundaries. It must not begin without separate authorization.

## Phase C final verification and Phase D readiness - 18 October 2026

### GitHub and command verification

- `main` was clean before this documentation update. Phase C6 implementation commit `a5e3615` and audit commit `e849c51` were both present on `origin/main`; local and remote resolved to `e849c519732ccf3b6760bd1bb289298144a9413e` with no divergence.
- Read-only Firebase CLI checks confirmed access to active project `fesr-c3ae1`. Its default Firestore database is Standard, Firestore Native and located in `nam5`. The CLI available on this workstation does not expose the Firebase billing plan; the owner must confirm Spark or Blaze in the console.
- No Firebase Storage bucket, billing setting, live record, security rule or production resource was changed.

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | No diagnostics. |
| `bun run typecheck` | 0 | Route types generated; no TypeScript diagnostics. |
| `bun run build` | 0 | Next.js 16.3.8 Webpack production build completed and generated 33 routes. |
| `bun run test` | 0 | Auth, Firestore and Storage emulators ran 8 files / 38 tests; all passed. Offline metadata lookup warnings were non-fatal. |

### Combined Phase C1-C6 integration review

The administrator foundation is cohesive and testable: approved-session enforcement, trusted-origin mutations, server-only Admin SDK access, transactional slugs, draft/published separation, rich-text sanitation, featured eligibility, ordered tips/services, versioned site content/settings and emulator-only editorial media all remain intact. Phase C is therefore **admin/data-foundation complete and emulator-verified**, but it is **not live-media complete** until the owner approves Storage and billing.

The following connections must be resolved deliberately during Phase D rather than treated as completed:

1. Every public route still reads `data/content.ts`; public projects, resources, services, tips, featured content, page copy and approved settings are not connected to Firestore.
2. The quote form only validates a preview in the browser. Enquiry lists/details still use mock records; no submission API, Firestore enquiry repository, status/note mutation or customer confirmation exists.
3. Project records use `coverMediaId` plus gallery `mediaId` entries, while resources still use a `coverImage` string and business branding uses URL strings. These must be normalized to explicit media IDs before public media resolution.
4. Assigning a Media Library item to a project updates media metadata but does not add it to the project's ordered gallery or choose the project cover. The project editor currently preserves existing gallery relationships but does not manage them.
5. Project publication validates that gallery IDs are present in the payload, but does not transactionally prove each referenced media record exists and is Ready. Site Content and Services also accept string media IDs without referential validation.
6. Featured-resource preview logic compares a resource cover string with media source URLs, which is incompatible with the new media-ID model. Published media delivery also requires a public read path/derivative policy; the current media-file route is administrator-only and emulator-only by design.
7. Media deletion protects references by scanning collections, but that scan and deletion are not one atomic reference-index transaction. A reverse reference/index model is recommended before concurrent live editorial use.
8. Resource article structured data still contains a hardcoded `https://www.fes.co.tt` origin instead of the approved `SITE_URL`. Dynamic metadata and sitemap entries remain static-data based.
9. The current deny-all browser rules remain appropriate for the server-only architecture. Phase D public reads should continue through server repositories unless a separately reviewed rule change is explicitly approved.

### Storage owner instructions for `fesr-c3ae1`

Do not click upgrade or create the bucket until the following decisions are approved in writing.

1. Open Firebase Console, select **FESR (`fesr-c3ae1`)**, then open **Project settings → Usage and billing**. Record whether the plan is Spark or Blaze. Spark is not sufficient: since 3 February 2026, Cloud Storage for Firebase requires the pay-as-you-go Blaze plan even when usage remains inside no-cost quotas.
2. If Spark is shown, choose who owns the Google Cloud Billing account and payment method. Approve linking that billing account only after the budget and alert recipients below are agreed. Codex must not perform the upgrade.
3. Approve the bucket location. Existing Firestore is `nam5`, but a new `*.firebasestorage.app` bucket chooses its own location. The preliminary recommendation for Trinidad & Tobago is regional **`us-east1` (South Carolina)** because it is geographically reasonable for the audience and is eligible for Cloud Storage Always Free quotas. The owner must confirm latency, legal/data-residency and disaster-recovery requirements. A bucket's location cannot be changed after provisioning; changing it later requires a new bucket and a migration.
4. Approve **Standard** storage class for actively served website images. Do not enable Autoclass, soft delete, object versioning, lifecycle deletion or retention locks until retention/recovery requirements and their costs are understood.
5. Set an initial monthly project budget in Google Cloud Billing and alerts at low testing thresholds plus 50%, 90% and 100%. Name both the business owner and developer recipient. Budget alerts notify people; they do not stop Storage or cap the bill.
6. Approve the operating limits: JPEG/PNG/WebP, 10 MiB maximum original (or a lower value), maximum dimensions, derivative sizes/formats, who may upload/delete, image-rights/alt-text responsibility, editorial retention, backup/export and incident response.
7. Keep private quote photos in a separate `quote-photos/` namespace with a shorter approved retention period and stricter access than public editorial images. Do not reuse public editorial URLs for customer files.
8. After those approvals, Codex can safely prepare the final reviewed Storage rules, explicit live-environment feature flag, public derivative/read architecture, reference-index migration, lifecycle configuration proposal and staging test plan. Rule deployment, bucket creation, billing changes and the first live upload still require the owner's explicit go-ahead.

Expected cost should be small for a modest optimized image library, but cannot be guaranteed. In `us-east1`, current Always Free quotas include 5 GB-month storage, 5,000 Class A operations, 50,000 Class B operations and 100 GB North America outbound transfer per month (aggregated with qualifying regions). Beyond free usage, the current Google example uses approximately US$0.020/GB-month for Standard storage, US$0.005 per 1,000 Class A operations, US$0.0004 per 1,000 Class B operations and region/destination-dependent transfer. Prices and eligibility can change; verify the console calculator when approving. Sources: [Firebase Storage billing changes](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [Storage locations](https://firebase.google.com/docs/storage/locations), [Firebase budget alerts](https://firebase.google.com/docs/projects/billing/budget-alerts), [Google Cloud Storage pricing](https://cloud.google.com/storage/pricing).

### Phase D implementation plan

**D1 - Published public read model (can proceed without live Storage).** Normalize public DTOs and media references; add server-only published repositories for projects/galleries, articles/external resources, tips, enabled services, featured placement, published site-content snapshots and Approved business settings. Switch list/detail pages in small vertical slices with safe empty/fallback states, no draft leakage and no browser Firestore access. Replace the hardcoded article origin with `SITE_URL`. Add cache tags/revalidation boundaries, dynamic metadata and dynamic sitemap tests. Use existing approved static illustrations or explicit image placeholders until live editorial media is approved.

**D2 - Editorial media completion (requires Storage approval for live acceptance).** Normalize project/resource/site/branding fields to media IDs; add transactional Ready-media validation and a reverse reference index; connect gallery ordering/cover selection; define optimized public derivatives and cache headers; migrate only approved references. Emulator work can proceed, but bucket provisioning, live rules and live uploads must wait.

**D3 - Quote persistence without photographs (can proceed without live Storage).** Define a strict versioned quote schema, privacy/consent fields, trusted same-origin POST endpoint, server validation, normalized service IDs, idempotency key, Firestore transaction, abuse/rate controls, sanitized audit metadata and honest success/error/retry states. Do not accept attachments yet.

**D4 - Private customer photographs (requires Storage, retention and privacy approval).** Use an isolated non-public namespace, server-validated signatures/limits, per-enquiry object ownership, upload rollback, malware-risk handling, short retention/lifecycle policy and authorized download routes. Never expose customer objects through public URLs.

**D5 - Administrator enquiry workflow (D3 first; D4 optional).** Replace mock enquiries with authorized Firestore reads, filters and detail views; implement transactional status transitions, append-only/internal notes, actor timestamps and attachment authorization. Define notification behavior only if an approved provider and recipients exist.

**D6 - Integrated public/admin quality gate.** Test published/draft transitions, featured invalidation, gallery/media integrity, settings fallbacks, quote idempotency, abuse rejection, attachment failures, admin access, cache invalidation, not-found/error states, metadata/canonical/robots/sitemap output and complete customer/admin journeys at mobile and desktop sizes. Run lint, typecheck, production build, emulator/security tests and staging UAT before any production deployment.

Recommended first milestone: **D1a — published public projects and galleries read model**, initially using approved placeholders for unavailable media. It exercises the most important publication, slug, not-found, cache and metadata boundaries without requiring billing or a live bucket. Do not begin it until separately authorized.

## Phase C6 Firebase Storage and Media Management - 18 October 2026

Phase C6 has reached the owner-approval boundary with a verified emulator-only editorial media implementation. No live Firebase Storage bucket was enabled, no file was uploaded to `fesr-c3ae1`, no billing or paid service was activated, no Firebase rule was deployed and Phase D did not begin.

### Implemented safely

- The mock Media Library repository was replaced with versioned Firestore `media` records and server-only Admin SDK operations. Editorial objects use `editorial/images/{year}/{mediaId}/original.{ext}`; the existing denied `quote-photos/**` namespace remains separate for future private customer attachments.
- Shared TypeScript and Zod contracts require JPEG, PNG or WebP, alt text, captions, project/category metadata, byte size, dimensions, lifecycle status and audit ownership/timestamps. The default maximum is 10 MiB and can be lowered with `EDITORIAL_MEDIA_MAX_BYTES`.
- Server validation checks MIME type against the file signature and extracts dimensions before writing. Object names exclude user filenames. Objects stay private and are served to approved administrators through an authenticated, no-store route.
- Upload records move through Pending, Ready or Failed. Failed uploads attempt object rollback and receive a cleanup time; emulator-tested cleanup removes abandoned Pending/Failed records and objects.
- Metadata and project assignment persist in Firestore. Project, Resource, Site Content, Service, Featured Content and Business Settings records are scanned before deletion; references cause `MEDIA_IN_USE` rather than broken content.
- The responsive Media Library retains its design and adds progress, validation feedback, empty states, persistent metadata and an explicit live-Storage blocked state. Site Content pickers receive the same Firestore-backed media list instead of mock SVGs.
- Every route verifies the approved administrator session; mutations also enforce trusted origin. Direct browser Firestore and Storage access remains deny-by-default.
- `bun run test` now aliases the full Auth, Firestore and Storage emulator suite and never contacts the live project.

### Verification evidence

All final commands ran from `C:\fes-dev\fiberelectricsolutionsltd` on 18 October 2026:

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | No errors or warnings. |
| `bun run typecheck` | 0 | Route types generated; no TypeScript diagnostics. |
| `bun run build` | 0 | Next.js 16.3.8 Webpack production build generated 33 route outputs, including three media routes. |
| `bun run test` | 0 | Firebase emulators ran 8 files / 38 tests; all passed. Offline metadata lookup warnings did not affect the result. |

Tests cover untrusted requests, signature/size/dimension validation, emulator upload/read/update/delete persistence, reference integrity, abandoned cleanup, and browser-client denial for private quote and editorial Storage paths. Edge acceptance testing confirmed the authenticated Media Library reports `LIVE UPLOADS BLOCKED`, disables uploads, explains the approval boundary and makes no live write. Upload/progress behavior was verified through emulators only.

### Owner approval boundary

Before live Storage work, the owner must explicitly approve:

1. Client ownership and whether `fesr-c3ae1` is the long-term staging or production boundary.
2. The immutable Storage/Firestore region and data-location requirements.
3. Billing owner, monthly budget, alert recipients and escalation threshold; alerts are not a hard cap.
4. Editorial retention, backup/export and deletion policy, including permanent-delete authority.
5. File-size/dimension/format limits and any paid derivative-generation or optimization work.
6. Staging-first deployment of reviewed rules/indexes, named approver and rollback plan.

Phase C6 is emulator-complete, not live-complete. Public pages remain unchanged and Phase D has not started.

The verified implementation was committed on `main` as `a5e3615` with subject `feat: add emulator-only editorial media management`. The staged review contained only the 19 intended source, route, test, configuration-example and audit paths; `git diff --cached --check` passed, `.env.local` and generated output remained ignored, the credential-pattern scan found no real secret/private-key material, and Firebase rules/configuration were not changed. This audit-only follow-up records the implementation hash before both commits are pushed normally to `origin/main`.

## Phase C5 Business Settings Management - 18 October 2026

- The existing Settings interface now persists one typed, versioned `businessSettings/public-v1` Firestore document through the server-only Firebase Admin SDK. The document separates the validated public payload from server-generated schema, approval and audit metadata. Every page read requires the approved administrator session, and every write independently requires a trusted same-origin request and active approved administrator session.
- The retained interface manages the existing approved scope: business name, public email, telephone, WhatsApp, location, opening days and hours, social links, Google Business and Maps URLs, SEO title/description and existing branding references. Branding file selection remains a clearly labelled local preview because Storage and billing are not approved.
- Settings default to Draft. Approved status requires a confirmed location and at least one public email or telephone number. The strict Zod schema validates email, telephone, HTTP(S) URLs, all seven unique business days, opening/closing times and SEO lengths; unknown fields are rejected so SMTP passwords, Firebase keys and other internal configuration cannot enter the public settings document.
- Missing or malformed documents fall back to safe Draft defaults. Only a valid Approved document can be returned by the separate approved-settings query, and the public website does not call that query in Phase C5.
- The responsive tabbed design, local branding preview and search preview were preserved. The form now includes persistent loading/error/success feedback, explicit Draft/Approved control, cancellation to the last saved state, per-field validation and a browser unload warning for unsaved persistent changes.
- Edge acceptance against approved staging project `fesr-c3ae1` used an approved administrator session and saved `PHASE C5 ACCEPTANCE TEST — draft business settings` with `phase-c5@example.test` as a clearly labelled Draft record. The API returned HTTP 200, and a full refresh restored the test values, Draft state and opening hours. No approved company record was overwritten, and no public page, production resource, Storage setting, billing setting or deployed rule changed.
- Emulator coverage includes untrusted-origin rejection, direct browser read/write denial, safe missing-document defaults, authorized repository persistence, audit fields, approval filtering, invalid email/URL/telephone/hours rejection, incomplete-approval rejection and secret-field injection rejection.

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; route types generated and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack completed the optimized production build and generated all 32 pages. |
| `bun run test:emulators` | 0 | PASS; 7 test files and all 33 security/integration tests passed. Non-fatal metadata-network warnings did not affect the exit code. |

The verified Phase C5 implementation was committed on `main` as `e0ad552` with subject `feat: add secure business settings management`. The staged review contained only the eight intended source, route, test and audit paths; `git diff --cached --check` passed, `.env.local` and generated output remained ignored, and the credential scan found no real secret or private-key material. The following audit-only commit records that outcome before both commits are pushed normally to `origin/main`. Phase C6 and Phase D have not started.

### Remaining dependencies

- Approved final business contact details, exact address/hours, public social profiles and SEO copy must replace the clearly labelled Draft acceptance record before any future public integration.
- Firebase Storage, billing and editorial media remain deferred pending explicit owner approval.
- The public website remains on its existing static configuration until Phase D migration and acceptance are explicitly authorized.

## Phase C4 Site Content and Services Management - 18 October 2026

- The existing Site Content interface now reads and writes Firestore through server-only Firebase Admin SDK repositories. Every mutation requires a trusted same-origin request and an active approved administrator session; browser Firestore access remains deny-by-default.
- Homepage, Electrical Services, Fiber Optic Services, About Us and Call-to-Action content use distinct, typed `siteContent/{section}-v1` documents. Each document records schema version 1, administrator audit fields and separate `draft` and `published` snapshots. Saving a draft never overwrites its retained published snapshot, and published-content queries return nothing while a section is Draft.
- Services use independent versioned `services/{id}` records with category, slug, status, draft/published snapshots, audit fields, enablement and explicit display order. The existing interface supports add, edit, delete, reorder, enable/disable and publication status without redesign. Unsaved edits are tracked per section so switching tabs cannot falsely clear another section's pending state.
- Zod validates every page shape, heading/description limit, CTA destination, unique CTA identifier, service category, slug, content, order and uniqueness constraint on the server. The public website still uses `data/content.ts`; Phase D public Firestore integration has not started.
- Browser acceptance in Edge against approved staging project `fesr-c3ae1` saved the clearly labelled Draft homepage heading `PHASE C4 ACCEPTANCE TEST — draft homepage heading`, refreshed the page and confirmed persistence. It also created the clearly labelled Draft electrical service `phase-c4-acceptance-test-draft-service`, saved the ordered catalogue, refreshed and confirmed the record remained Draft in position 6. The existing five electrical services were copied from the current static approved catalogue into staging only. No public page, production project, Storage setting, billing setting or deployed rule changed.
- Emulator coverage now includes trusted-origin denial, unauthorized browser writes to both new collections, validation, page and service persistence, draft isolation, publishing, ordering, duplicate rejection and published-query filtering. The final suite runs integration files serially because they share one emulator project; this removes a pre-existing race between the Phase C2 complete-tip-order test and Phase C3 featured-tip fixtures.

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; route types generated and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack completed the optimized production build and generated all 31 pages. |
| `bun run test:emulators` | 0 | PASS on the final deterministic run; 6 test files and all 27 security/integration tests passed. Non-fatal metadata-network warnings did not affect the exit code. An earlier pre-fix run exited 1 when the shared-emulator tip race reproduced; it was investigated and resolved before commit. |

The verified Phase C4 implementation was committed on `main` as `29e8199` with subject `feat: add secure site content management`. The staged review contained only the 11 intended source, route, test, configuration and audit paths; `git diff --cached --check` passed, `.env.local` and generated output remained ignored, and the credential-pattern scan found no secret or private-key material. The following audit-only commit records that outcome before both commits are pushed normally to `origin/main`.

### Remaining Phase C dependencies

- Firebase Storage uploads, Storage rules, billing and editorial media remain deferred until the owner explicitly approves ownership, region, budget and file-retention requirements.
- The public website remains on its static data source until Phase D acceptance and migration approval.
- The recommended next milestone is Phase C5 Business Settings: preserve the current Settings design while adding typed, versioned, server-authorized business contact, hours, social and SEO settings. Do not start it without explicit approval.

## Phase C3 Featured Content Management - 18 October 2026

- The existing Featured Content interface now persists a single audited `featuredContent/homepage` placement document through server-only Firebase Admin SDK operations. Every write requires a trusted same-origin request and an active approved administrator session.
- Zod validation rejects duplicate tip selections and malformed placements. The Firestore transaction verifies that the featured project is published, the optional resource is published, and every selected tip is enabled at the instant of saving. Reads re-check those source records, so missing, deleted, draft, unpublished or disabled records are automatically omitted from active featured output without changing the source content.
- Featured projects and resources can be selected or replaced, the optional resource can be removed, tips can be selected or removed, and selected tips have an explicit persisted order with accessible move controls. The existing responsive layout and homepage preview were preserved; only persistence, feedback and ordering controls changed.
- Browser acceptance against `fesr-c3ae1` used clearly labelled staging records. It selected a published project, published resource and enabled tip, saved successfully, and a full refresh restored all three selections. Staging fixture project `phase-c3-browser-project` and its local-image metadata remain clearly labelled for continued acceptance testing. No public website query was changed.
- Automated emulator coverage includes untrusted-origin denial, eligible persistence, explicit order, duplicate rejection, missing and ineligible references, and active filtering after a project/resource is unpublished or a tip is disabled. Storage, billing, security-rule deployment, production deployment and public Firestore integration remain untouched.

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; route types generated and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack completed the optimized production build and generated all 30 pages. |
| `bun run test:emulators` | 0 | PASS; 5 test files and all 20 security/integration tests passed. Non-fatal metadata-network warnings did not affect the exit code. |

The verified Phase C3 implementation was committed on `main` as `f71ce2d` with subject `feat: add secure featured content management` and pushed normally to `origin/main` without force. The following audit-only commit records that final outcome.

## Phase C2 Resources, Articles and Tips - 17 October 2026

- Resources now use server-only Firestore CRUD with administrator session and trusted-origin enforcement, transactional unique slug reservations, draft/published/unpublished workflows, external URL and attribution validation, audit fields, and allowlisted sanitization of structured rich-text nodes, marks and links. Published-content queries exclude drafts.
- Tips now use server-only Firestore CRUD with administrator enforcement, server-side Zod validation, persisted enable/disable state, normalized deletion order and validated complete-list reordering. Enabled-content queries return only enabled tips in display order.
- The existing Resources rich-text editor, list, forms and Tips manager design were retained. Mock notices were removed only from these completed screens. Storage uploads remain disabled, and the public website continues to use its existing static data source.
- Live browser acceptance against staging project `fesr-c3ae1` created resource `HSqcvlYL9A4vy3WYhSu1`, verified draft persistence, publishing, unpublishing and refresh persistence. It also created a staging tip, verified refresh persistence and enabled/disabled persistence, and exercised deletion while removing an accidental duplicate test tip. The retained test resource is Draft and the retained test tip is disabled; neither changes the public website.
- Automated tests cover untrusted-origin denial, resource CRUD, unique slugs, validation, structured-content sanitization, draft isolation, publish/unpublish behavior, tip CRUD, validation, enablement, ordering and order normalization after deletion.

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; route types generated and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack completed the optimized production build and generated all 29 pages. |
| `bun run test:emulators` | 0 | PASS; 4 test files and all 16 security/integration tests passed. Non-fatal metadata-network warnings did not affect the exit code. |

The verified Phase C2 implementation was committed on `main` as `ed88d12` with subject `feat: add secure resources and tips management` and pushed normally to `origin/main` without force. The following audit-only commit records that final outcome.

## Official staging Phase B sign-off and Phase C1 implementation - 17 October 2026

- The owner confirmed that `fesr-c3ae1` is the official FES development/staging Firebase project. Firebase CLI access was reauthenticated and a read-only project listing confirmed developer access. The ignored `.env.local` points both the browser SDK and Admin SDK to this project; no second live or production project is configured locally.
- Read-only Admin SDK checks confirmed Authentication and Firestore connectivity, the approved administrator account is enabled, and its matching `admins/{uid}` document has `role: admin` and `active: true`. The owner confirmed the password previously disclosed in chat was rotated outside chat.
- Phase B authentication and authorization prerequisites are satisfied. The emulator security suite was repeated before Phase C1 work and all 8 existing tests passed. No rules were deployed, billing or paid services were enabled, production resource was modified, or secret was committed.
- Phase C1 now provides server-authorized Firestore project CRUD, transactional unique slug reservations, draft/published controls, publication prerequisites, Zod validation, and Firestore-backed existing Projects admin screens. The public website data source remains unchanged. Firebase Storage uploads remain deliberately disabled pending explicit Storage and billing approval.
- Live browser acceptance against `fesr-c3ae1` created draft project `NbIdsMgVwHQpfKWd3hcZ`, persisted it across refresh, saved an edit, displayed it in the Projects list, and rejected publication without approved gallery media. The record was retained as a clearly identifiable staging verification record; no live record was deleted.
- Automated Phase C1 coverage adds denial for untrusted mutation origins, authorized CRUD persistence, duplicate-slug transaction conflicts, publication rules, deletion, and slug release.

### Phase C1 verification

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; Next route types generated and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack completed the optimized production build and generated all 26 pages. |
| `bun run test:emulators` | 0 | PASS; 3 test files and all 11 Auth/Firestore/Storage/project integration tests passed. Non-fatal metadata-network warnings did not affect the exit code. |

The verified implementation was committed on `main` as `625772e` with subject `feat: add secure Firestore project management` and pushed normally to `origin/main` without force. This audit follow-up records that outcome; the final local/remote hash equality check follows its documentation commit.

## Phase A/B GitHub handoff - 17 October 2026

- The complete reviewed Phase A/B foundation was committed on `main` as `05b26818f73230ba0aa793045008e0cccc3d7580` with subject `feat: complete Phase A and Phase B foundation`.
- The commit contains 104 legitimate project source, configuration, test and documentation files, including the regenerated `bun.lock`. Before commit, the staged-path and staged-content reviews found no `.env.local`, Firebase API key, private-key material, service-account credential, `.next` output, `node_modules`, logs, TypeScript cache, quarantine or other generated/private artifact. `git diff --cached --check` passed.
- The commit was pushed normally to `origin/main` without force. A direct `git ls-remote origin refs/heads/main` check returned the same full hash as local `HEAD`: `05b26818f73230ba0aa793045008e0cccc3d7580`.
- The following commands were run from `C:\fes-dev\fiberelectricsolutionsltd` after the foundation commit and before push:

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; route types generated and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack completed the optimized production build and generated all 25 pages. |
| `bun run test:emulators` | 0 | PASS; 2 test files and all 8 Auth/Firestore/Storage security tests passed. Non-fatal metadata-network warnings did not affect the exit code. |

No production Firebase resource, billing setting, paid service or deployed security rule was modified. Phase C implementation has not started.

### Owner approval checklist before Phase C

- [ ] Confirm the client owns and controls separate official Firebase staging and production projects, billing accounts, recovery contacts and access policies.
- [ ] Provide the approved administrator email list for staging and, separately, production; each account must have a matching active `admins/{uid}` authorization record.
- [ ] Rotate the disclosed temporary administrator password outside chat, or delete the temporary Authentication user and its temporary Firestore test records.
- [ ] Approve Storage ownership, region, billing responsibility, budget alerts, file limits and retention before any paid functionality or editorial upload workflow is enabled.
- [ ] Confirm `C:\fes-dev\fiberelectricsolutionsltd` is the active development checkout and that the suspect D: directory/junction will not be used for verification or Phase C work.
- [ ] Explicitly approve Phase B and authorize Phase C1 implementation. Until then, the Phase C1 architecture below remains planning only.

### Recommended next Phase C1 task after approval

Begin with the shared data-contract and authorization slice only: finalize the Zod schemas and TypeScript types for projects, media and slug reservations; define draft/published invariants and Firestore transaction boundaries; and add emulator tests for administrator authorization, draft isolation and competing slug reservations before connecting any existing admin form to live mutations.

## Development-environment resolution and Phase C1 readiness - 17 October 2026

This is the latest verification record. It supersedes the earlier 17 October healthy-copy command table below, while retaining that table as diagnostic history. No Phase C feature work, deployment, commit, push, Firebase rule deployment or paid-service change was performed.

### Healthy checkout and root-cause findings

- A real, short-path checkout exists at `C:\fes-dev\fiberelectricsolutionsltd`. It is a normal directory containing its own `.git` directory, not an NTFS junction. The existing independent source backup at `C:\Users\kylen\.codex\visualizations\2026\10\17\01a14a38-59e7-7c63-aa2f-3a8cbe46bc6d\fes-phase-b-source-backup-2026-10-17` remains unchanged. A second secret-free final snapshot was created at `C:\Users\kylen\.codex\visualizations\2026\10\17\01a14a38-59e7-7c63-aa2f-3a8cbe46bc6d\fes-phase-b-verified-source-backup-2026-10-17`; Robocopy copied 115 files with zero failures and a subsequent read-only comparison reported no differences. Both dependency quarantines on D: remain present and untouched.
- The Phase B dependencies had been added to `package.json` without regenerating `bun.lock`. Both Bun 1.3.14 and Bun 1.4.3 correctly rejected the old lock with `lockfile had changes, but lockfile is frozen`. Regenerating the lockfile in the isolated checkout and repeating the frozen install resolved this reproducibility defect.
- Bun was upgraded using its supported stable channel from 1.3.14 to 1.4.3. The source declaration is now `packageManager: bun@1.4.3`. The previous Bun 1.3.14 `reached unreachable code` failure did not reproduce on the short path, and no Bun panic or `CouldntReadCurrentDirectory` error occurred with 1.4.3.
- Next.js 16.3.8's documented Webpack path completed a real optimized production build from the short checkout. The earlier `EPERM` from the much longer Codex working path did not recur. This isolates that failure to the former host/path context (path length, directory metadata, permissions or security-software interaction), not to the application build itself; the available evidence does not prove which Windows subsystem caused it.
- The original D: directory/volume has not been repaired or certified healthy. After the successful C: verification, another attempt to launch a process with the original repository as its working directory failed with Windows `os error 267` (`The directory name is invalid`), directly reproducing the directory-context fault. Do not use the junction as evidence of health. Before returning active development to D:, an administrator should run `chkdsk D: /scan` in an elevated Windows Terminal, review Windows Security/Controlled Folder Access and antivirus protection history for blocked Bun/Node operations, and run the drive vendor's SMART/extended diagnostic. Preserve the results and back up data before considering any offline repair such as `chkdsk /f`.

### Final direct verification from `C:\fes-dev\fiberelectricsolutionsltd`

| Command | Exit | Result |
|---|---:|---|
| `bun install --frozen-lockfile` | 0 | PASS with Bun 1.4.3 and the regenerated `bun.lock`; repeated after aligning `packageManager`. |
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 0 | PASS; Next route types generated successfully and TypeScript completed. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack compiled, typechecked, generated all 25 pages and completed build traces. |
| `bun run test:emulators` | 0 | PASS; Auth, Firestore and Storage emulators started, 2 test files and all 8 security tests passed, and the suite shut down cleanly. Metadata lookup emitted non-fatal network warnings only. |

### Repository and Firebase isolation status

- The source tree contains 39 tracked files and 76 untracked files (115 implementation/configuration/documentation files total). Git reports 29 modified tracked paths and 27 untracked path groups. These are the uncommitted Phase A/B body of work; nothing was staged, committed or pushed in this update.
- `.gitignore` ignores `.env*` except the safe `.env.example`, `*.pem`, root Firebase/service-account JSON naming patterns, `secrets/`, `.firebase/`, `.next/`, `node_modules/`, build output, logs and TypeScript caches. Targeted `git check-ignore` tests passed, and a tracked-file scan found no environment file, private key, service-account JSON or credential file.
- The ignored `.env.local` identifies `fesr-c3ae1` for both browser and Admin SDK project IDs. All emulator-host variables are empty for the live temporary-project configuration. The repository contains no second live Firebase project identifier; `fes-local` is used only by `.firebaserc`, scripts and tests for emulators.
- The already-completed live test remains authoritative: the approved temporary administrator authenticated, the server session and logout/revocation flow worked, protected routes resisted bypass, the dashboard read staging data, and live browser Firestore access remained denied by the temporary project's rules. No production project or paid service was modified.
- The temporary administrator password was disclosed in chat and is compromised. Rotate it in Firebase Authentication before retaining the account, or delete the temporary Authentication user and its temporary `admins/{uid}` and dashboard test records after testing. This cleanup is deliberately not automated here because account deletion is destructive and password rotation requires the owner to choose a new secret outside chat.

### Phase C1 implementation sequence - Projects and Galleries (planning only)

1. **Shared contracts:** add Zod schemas and derived TypeScript types for `projects/{projectId}` and `media/{mediaId}`. A project contains immutable ID, normalized unique slug, title, category (`electrical`, `fiber`, `combined`), summary, general location, period, status (`draft`, `published`, optionally `archived` only if approved), cover media ID, ordered gallery media IDs, featured flag, `publishedAt`, timestamps and administrator actor IDs. A media record contains Storage object path, MIME type, byte size, dimensions, alt text, upload state, checksum, project relationship and audit fields.
2. **Slug reservation:** use a `projectSlugs/{normalizedSlug}` reservation document created or changed in the same Firestore transaction as the project. Enforce lowercase normalization, format/length validation and uniqueness; retain the immutable project ID when a slug changes and release the old reservation only after the new one succeeds.
3. **Authorized query layer:** replace only the current `adminRepository` project/media methods with server-only Firebase implementations. Admin reads call the existing session verifier. Public project queries return `published` records only and never expose drafts or internal audit metadata. Preserve the existing route components and visual design.
4. **Server-side mutations:** implement server actions or route handlers for create, update, reorder, publish/unpublish and delete/archive. Every mutation independently verifies the approved active administrator, parses Zod input, ignores client-supplied audit fields, uses transactions where relationships change and returns structured validation/conflict errors to the existing forms.
5. **Publication workflow:** create as draft by default. Publishing requires a valid unique slug, title, summary, category, cover media, at least one ready gallery item and alt text. Set `publishedAt` only on the first publish; later updates retain it. Unpublishing removes the item from public queries without deleting content. Featured selection is allowed only for published projects.
6. **Media workflow:** authorize uploads server-side, write to a temporary editorial prefix using generated IDs, validate JPG/PNG/WEBP type, size and image dimensions, then finalize metadata and the permanent object path. Store ordering/cover relationships on the project, prevent deletion while referenced, and provide idempotent cleanup for failed or orphaned uploads. Keep Phase D quote attachments in a separate future prefix.
7. **Rules and indexes:** keep direct browser writes denied. Permit application mutations through the Admin SDK after server authorization. Add only the indexes required for published-project ordering/category filters and admin status/updated-at lists. Prepare rule changes and emulator cases, but do not deploy them without explicit approval.
8. **Migration:** write a dry-run migration from `data/content.ts` and the approved mock project/media data. Produce a deterministic report of proposed IDs, slugs, media references and rejected records; back up/export the target database, then require owner approval before applying to a non-production project.
9. **Integration tests:** cover anonymous/unapproved/disabled-admin denial, approved CRUD, invalid payloads, duplicate/racing slugs, draft isolation, publish prerequisites, gallery ordering, cover changes, referenced-media deletion, orphan cleanup and public visibility transitions. Repeat lint, typecheck, production build and emulator suites before browser acceptance testing.

### Approval position

The Phase B code and local security gates now pass from a healthy short-path checkout. Formal Phase B approval is still pending owner review, rotation/removal of the compromised temporary administrator credential, and confirmation of the client-owned Firebase project/ownership plan. The D: filesystem remains unverified and must not be described as repaired. Phase C has not started.

## Phase B sign-off and Phase C readiness update - 17 October 2026

This update records the current readiness gate without repeating the completed 15 October browser or emulator verification and without beginning Phase C.

### Temporary Firebase project verification - completed 17 October 2026

- The owner-created Firebase project `fesr-c3ae1` was used solely for temporary FES authentication and dashboard-read testing. It is not the official client-owned staging or production project and must not be reused for launch.
- The existing Firebase implementation was reviewed without replacement. Client sign-in, recent-token exchange, approved `admins/{uid}` enforcement, HttpOnly session creation, revocation-aware protected-route verification, logout revocation and independently authorized dashboard reads remain intact.
- The ignored `.env.local` contains matching client and server project IDs for `fesr-c3ae1`; emulator mode is false and all emulator host variables are empty. The Admin SDK authenticated successfully with locally supplied credentials. `.env.local` is ignored and untracked, root-level service-account JSON patterns and `secrets/` are ignored, and a tracked-file scan found no environment or credential file.
- Email/Password Authentication is enabled. One temporary Authentication user was created with a matching Firestore `admins/{uid}` document containing a temporary display name, role `admin` and `active: true`. A temporary `adminDashboardContent` record was created for the live read check.
- Anonymous access to `/admin` redirected to `/admin/login?reason=session`. Approved sign-in returned HTTP 200 from `POST /api/auth/session`, displayed the authenticated administrator and loaded the temporary Firestore dashboard record. `/admin/projects` loaded while authenticated, and a full reload retained the server session.
- Logout returned HTTP 200, revoked refresh tokens, cleared the local session and returned to `/admin/login`. A direct post-logout request to `/admin/projects` redirected to `/admin/login?reason=session`.
- The temporary project's live Firestore rules were inspected read-only and deny all browser reads and writes. The trusted Admin SDK can still read the administrator and dashboard documents after server authorization. No Firestore or Storage rule was deployed or changed.
- No production Firebase identifier appears in the active environment: the browser, server and console checks all targeted only `fesr-c3ae1`. `.firebaserc` continues to identify only the separate emulator project `fes-local`.
- The temporary project is currently on a Blaze Google Cloud free trial. This review did not enable, upgrade or modify billing, Storage or any other paid service.
- The test password was disclosed in chat and must be treated as compromised. Rotate it immediately if the temporary user will be retained; otherwise delete the temporary Authentication user and test Firestore records after testing is no longer needed.
- No Phase C implementation, production deployment, commit or push occurred.

### 17 October healthy-copy command results

A disposable source copy was created at `C:\Users\kylen\.codex\visualizations\2026\10\17\01a14a38-59e7-7c63-aa2f-3a8cbe46bc6d\fes-temp-firebase-test-checkout`. It is separate from the D: junction and was used for the live browser test. Dependency installation required npm because `bun install --frozen-lockfile` reproduced the Bun 1.3.14 `reached unreachable code` panic.

| Command | Exit | Result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint completed without diagnostics. |
| `bun run typecheck` | 1 | FAIL before script execution with `CouldntReadCurrentDirectory`, repeated twice. |
| `bun run build` | 1 | FAIL before script execution with `CouldntReadCurrentDirectory`. |
| `bun run test:emulators` | 1 | FAIL before script execution with `CouldntReadCurrentDirectory`. |
| `node scripts/run-typecheck.mjs` | 0 | PASS; route types generated and TypeScript completed. |
| `node scripts/run-build.mjs` | 1 | FAIL with `EPERM` while creating a nested `.next/static/chunks/app/api/auth` directory, including after the generated `.next` directory was removed. |
| Node-invoked Firebase emulator suite | 0 | PASS outside the sandbox; 2 test files and all 8 tests passed. |

The live Firebase functionality is verified, but the exact Bun command gate and a clean production build remain unresolved host/toolchain blockers.

### Repository safety and recoverability

- The checkout remains on `main` at `e07f07acc7bf4d48da65f4406bff62cbe4b538ad`, matching `origin/main` with no committed divergence. The working tree is intentionally dirty: 29 modified paths and 27 untracked path groups contain the uncommitted Phase A/B implementation and documentation.
- The Git remote protects only the committed baseline; it does not protect the current Phase A/B working tree. On 17 October a separate source backup was created at `C:\Users\kylen\.codex\visualizations\2026\10\17\01a14a38-59e7-7c63-aa2f-3a8cbe46bc6d\fes-phase-b-source-backup-2026-10-17`. It contains 115 source, configuration and documentation files. Every copied file was compared to the checkout with SHA-256: 115 present, zero missing and zero hash mismatches. Generated `.next`, `node_modules`, logs, temporary diagnostics and `.git` were excluded; `origin/main` separately preserves the committed Git baseline.
- `D:\website\fes-bun-workdir` is confirmed to be an NTFS junction targeting `D:\website\fiberelectricsolutionsltd`; it is not an independent checkout or backup.
- Both dependency quarantines remain present and untouched: `D:\website\fes-node_modules-corrupt-quarantine` and `D:\website\fiberelectricsolutionsltd-node_modules-corrupt`. Do not remove either until the volume has passed administrator-level filesystem and hardware diagnostics and a healthy checkout has completed all direct verification commands.
- No filesystem repair was attempted and the D: volume is not declared healthy. The original-path `CouldntReadCurrentDirectory` evidence from 15 October remains unresolved. The safe recovery path is to clone `origin/main` into a new directory on a verified healthy volume, restore the backed-up uncommitted source changes carefully, install dependencies from the lockfile, and run the verification commands from that real directory rather than through a junction.
- Administrator action is still required to evaluate the drive: run Windows Error Checking or `chkdsk D: /scan` from an elevated terminal, inspect the drive's SMART/health report using the hardware vendor's diagnostic tool, preserve the report, and arrange repair or replacement if errors are reported. Do not run an offline repair such as `chkdsk /f` until all important D: data is independently backed up and downtime/reboot effects are understood.

### Direct command gate

No application command was repeated on 17 October because there is not yet a healthy direct checkout and the 15 October local authentication/browser/emulator work is already complete. The authoritative results remain:

| Command | Latest result | Sign-off interpretation |
|---|---:|---|
| `bun run lint` | PASS, exit 0 | Passed through the junction on 15 October; must pass again in the healthy checkout. |
| `bun run typecheck` | PASS, exit 0 | Passed through the junction on 15 October; original path still failed before script execution. |
| `bun run build` | PASS, exit 0 | Passed through the junction on 15 October; Next.js 16.3.8 Webpack generated all 25 routes. |
| `bun run test:emulators` | PASS, exit 0 | Passed through the junction on 15 October; 2 files and all 8 tests passed. |

The required post-move command order is `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`, `bun run build`, then `bun run test:emulators`. Record the real checkout path, exit code and concise output for each. A Bun panic or filesystem error is a failed environment gate, not an application pass.

### Firebase staging readiness

- Staging is not configured in this checkout: `.env.local` is absent, `.firebaserc` contains only the local emulator project `fes-local`, and no client-owned staging alias or project identifier is recorded.
- The checked-in Firestore and Storage rules are deny-by-default. They have not been deployed by this update. No paid service was activated.
- Live staging authentication therefore cannot yet be tested. The owner must complete the staging project, web app, Email/Password provider, Firestore database, approved Authentication user and matching active `admins/{uid}` record, then supply environment configuration through a secure channel or the approved hosting environment. Passwords, private keys and service-account JSON must never be supplied in chat.
- Storage is not required to sign off the Phase B authentication foundation. Do not enable Blaze or create a live bucket without explicit billing approval, named billing ownership and budget alerts. Phase C editorial uploads remain blocked until that approval and safe Storage provisioning exist.

### Phase C architecture and sequence (planning only)

Preserve the existing admin routes and visual components, replacing the mock repository boundary incrementally rather than redesigning the interface. Quote submissions and enquiry persistence remain Phase D.

1. **Contracts and authorization boundary:** define Zod schemas and shared TypeScript models for projects, project galleries, resources, tips, featured slots, page content, business settings and editorial media. Every mutation must run on the server, call the existing administrator-session verifier independently, validate input, and stamp `createdAt`, `createdBy`, `updatedAt` and `updatedBy`.
2. **Publishing model:** use explicit lowercase `draft` and `published` states, immutable document IDs, unique normalized slugs, optional `publishedAt`, and revision-safe updates. Public queries must select published records only. Draft changes must not affect public data until an explicit publish action succeeds.
3. **Editorial media:** store metadata in Firestore and objects under an editorial-only Storage prefix using generated object IDs, validated MIME type/size/dimensions, required alt text and server-authorized upload/finalization. Track references from covers and galleries; prevent deletion while referenced and clean up failed/orphaned uploads safely. Keep private future quote photos in a different prefix and out of Phase C.
4. **Projects and galleries:** implement the Firestore repository and server mutations first, then connect the existing project list/form/gallery UI. Cover media and ordered gallery references belong to the project document or a bounded gallery subcollection. Add slug, publish-transition, ordering, authorization and reference-integrity tests.
5. **Articles and resources:** connect the existing resource screens using a typed rich-text document format, sanitized rendering, attributed external URLs and cover-media references. Test draft isolation, slug collision, link validation and publish/unpublish behavior.
6. **Tips and featured content:** persist ordered tips and explicit featured-slot documents that reference eligible published projects/resources/tips. Validate maximum slot counts and reject missing, draft or disabled references.
7. **Site content and services:** use distinct typed documents per page/section rather than one unstructured blob. Connect the current homepage, electrical, fiber, about and CTA editors while preserving existing layouts. Publish page revisions atomically where practical.
8. **Business settings:** keep a singleton validated settings document for approved public contact details, hours, social links, branding references and SEO defaults. Treat empty/unapproved fields safely and avoid storing secrets in Firestore.
9. **Migration:** write a repeatable, dry-run-first migration for approved records only. Map mock IDs and media references deterministically, reject placeholders/unapproved content, back up staging data before writes, and produce a migration report. Do not dual-write mock and Firestore sources.
10. **Integration and UAT:** use emulators for repository, rule and mutation tests; then run staging tests for approved/unapproved administrators, CRUD persistence, draft isolation, publish transitions, media reference safety and public-query behavior. Keep production disconnected until staging UAT and explicit approval.

### Current decision

**Phase B is not yet ready for formal approval.** The implementation and local acceptance tests passed, and the uncommitted source now has a verified independent backup, but two gates remain: (1) a fresh checkout on a verified healthy volume must pass lint, typecheck, build and emulator tests directly without the junction; and (2) client-owned staging must be configured and the live staging authentication/security checklist must pass. Phase C implementation must not begin before formal Phase B approval.

## Phase A completion update - 14 October 2026

Phase A has now been implemented and verified. This update supersedes the original Phase A command results and open items later in this document while preserving the initial audit as the historical baseline.

- Fixed all seven reported React lint errors without disabling rules. Dialog synchronization now runs in an effect, and the enquiry preview's browser storage is modeled as an external store.
- Diagnosed the build stall as a reproducible Next.js 16.3.8 Turbopack issue on the current Windows toolchain. Clearing `.next` did not resolve it; the identical application compiled successfully with Next.js's supported Webpack fallback. Both `dev` and `build` scripts now use `--webpack` and the reason is documented in `README.md`.
- Demo projects and the sample article remain available during development but are excluded from production unless `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=true` is deliberately set for a non-public preview.
- Added graceful empty project/resource presentation, including the homepage resources section and featured-only resource handling.
- Replaced the assumed `www.fes.co.tt` origin with validated `SITE_URL` configuration. Until an approved production origin is configured, metadata uses the local fallback and production robots directives disable indexing.
- Added application-level `not-found.tsx` and `error.tsx` states.
- Browser smoke checks covered the main public routes, mobile navigation, quote validation/review, admin dashboard/content preview, production empty states, the custom 404, and crawler safeguards.
- Final verification: `bun run lint`, `bun run typecheck`, and `bun run build` all exited successfully with code 0.

**Phase A status: COMPLETE.** Remaining client domain approval and broad launch/device/accessibility testing are tracked as later approval and Phase E work, not blockers for beginning Phase B.

## Phase B final verification update - 15 October 2026

This final-verification update supersedes the 14 October Phase B verification results below while preserving them as implementation history.

### Windows/Bun diagnosis

- The repository directory is accessible to PowerShell and Node, and `bun -e "console.log(process.cwd())"` can resolve it. Bun 1.3.14 is installed at `C:\Users\kylen\.bun\bin\bun.exe` (`1.3.14+0d9b296af`).
- The dependency tree reports clean top-level resolution through `npm ls --depth=0`. The Bun lockfile was regenerated after dependency repair.
- A frozen-lockfile diagnostic made Bun 1.3.14 panic with `reached unreachable code`, which is a Bun defect rather than an application diagnostic.
- The previously damaged generated dependency tree was readable enough to inspect but poisoned Bun/TypeScript/Next child-process startup whenever the original repository directory was the process working directory. It was moved intact—not deleted—to `D:\website\fes-node_modules-corrupt-quarantine`.
- Moving the quarantine outside the repository changed Bun's behavior from `CouldntReadCurrentDirectory` to normal compiler execution. A reversible NTFS junction, `D:\website\fes-bun-workdir`, targets the same repository and permits the exact Bun scripts to run successfully.
- The original directory entry still reproduces `CouldntReadCurrentDirectory` for `bun run typecheck` and `bun run build`. The junction proves the application files, dependencies and scripts are valid, but it does not prove the underlying directory/volume metadata is healthy.
- `Get-Volume` and `fsutil dirty query D:` could not read drive-health state without elevated system access. No destructive repair command was run. Before removing the preserved quarantine, back up the repository and other important files, run the Windows Error Checking/SMART diagnostics with an administrator, and consider cloning/copying the repository into a fresh directory on a verified healthy volume.

### Final command results

The passing Bun commands below were executed against the same repository through `D:\website\fes-bun-workdir` because the original directory entry remains suspect.

| Command | Exit code | Exact result |
|---|---:|---|
| `bun run lint` | 0 | PASS; ESLint reported no errors or warnings. |
| `bun run typecheck` | 0 | PASS; Next route types generated successfully and TypeScript completed without diagnostics. |
| `bun run build` | 0 | PASS; Next.js 16.3.8 Webpack compiled, typechecked and generated all 25 routes. The Webpack configuration was preserved. |
| `bun run test:emulators` | 0 | PASS; Firebase Auth, Firestore and Storage emulators ran 2 test files and all 8 tests passed. |

Running `bun run typecheck` or `bun run build` from the original path still exits 1 with `CouldntReadCurrentDirectory`; this host issue is not concealed by the passing junction results.

### Browser authentication verification

The Firebase Emulator Suite and local Next.js server used emulator-only accounts and no real credentials:

- Direct anonymous access to `/admin` and `/admin/projects` redirected to `/admin/login?reason=session`; the old preview bypass is absent.
- Invalid credentials stayed on the login page and displayed the generic rejection message.
- A valid but unapproved Auth account was rejected by `POST /api/auth/session` with HTTP 403 and received no session.
- A disabled Auth account was rejected and displayed the generic credential error.
- The approved administrator signed in, reached `/admin`, and saw the authenticated account name.
- The protected dashboard loaded `Firebase emulator connected` from the read-only Firestore `adminDashboardContent` collection.
- Refreshing `/admin` retained the valid server-verified session and reloaded the Firestore record.
- Logout returned HTTP 200, cleared the cookie, revoked refresh tokens, and subsequent direct protected-route access redirected to login.
- Missing and malformed sessions are rejected by Proxy/server integration tests. Expired and revoked sessions use the same `verifySessionCookie(..., true)` server path; no artificial production credential or browser cookie was created to simulate expiry.
- Password reset initially exposed a real defect: native required-password validation blocked the reset action. Adding `formNoValidate` to the dedicated reset button fixed it. The browser then displayed the non-enumerating success message, and the Auth emulator emitted a local reset URL.

### Security review and fixes

- Session creation enforces same-origin POST requests, runtime-validates the ID token body, requires authentication within the previous five minutes, rejects disabled users, and checks an active `admins/{uid}` record with role `admin` before creating a 12-hour cookie.
- The session cookie is HttpOnly, SameSite=Lax, path `/`, and Secure in production. Verification checks revocation and re-checks both the Auth disabled flag and administrator record.
- Logout is same-origin protected, clears the cookie and revokes the user's refresh tokens.
- The read-only dashboard repository previously relied on the protected layout as its only caller authorization. It now independently verifies an administrator session before every trusted Firestore read; invalid-session repository access is covered by an emulator integration assertion.
- Firebase Admin initialization and repositories retain `server-only` boundaries. Private-key variables are server-only and have no `NEXT_PUBLIC_` prefix. Browser configuration contains only the expected Firebase web identifiers.
- Firestore and Storage rules remain deny-by-default. Browser clients cannot read administrator/dashboard records or access drafts, enquiries, notes or private quote photos.
- No Phase C writes, uploads, quote persistence, email integration or deployment were added.

The non-technical owner procedure is documented in `docs/FIREBASE_SETUP.md`, including separate staging/production projects, Email/Password setup, web registration, location selection, the first `admins/{uid}` record, environment variables, emulator use, rules deployment and billing/credential ownership.

**Phase B status: LOCALLY VERIFIED; FORMAL APPROVAL PENDING OWNER/FILESYSTEM GATES.** The Phase B code and emulator/browser acceptance checks pass. Formal approval should wait until (1) the repository is backed up or recloned to a healthy directory/volume and the exact Bun commands pass there without a junction, and (2) the owner completes the staging Firebase project, approved administrator roster and environment setup in `docs/FIREBASE_SETUP.md`. Do not start Phase C before those two gates are recorded.

## Phase B implementation update - 14 October 2026

Phase B has been implemented as a constrained Firebase/authentication foundation. This update supersedes the original Phase B “missing” findings later in this audit while retaining them as the historical baseline.

### Implemented

- Added Firebase Web SDK, Firebase Admin SDK, Zod runtime validation, Firebase CLI, Rules Unit Testing and Vitest dependencies. Browser and server initialization are separated in `lib/firebase/client.ts` and `lib/firebase/admin.ts`; server modules carry a `server-only` boundary.
- Added environment-driven development/staging/production configuration in `.env.example`. No Firebase production values, private keys or service-account credentials were added. Local Auth, Firestore and Storage emulator endpoints are supported explicitly.
- Replaced the mock login behavior and preview bypass with Firebase Email/Password sign-in for pre-created accounts only. There is no public registration path. The UI includes loading, generic invalid-credential handling, approved-account denial and password-reset handling.
- Added a server-side session exchange at `POST /api/auth/session`. It verifies a recently issued Firebase ID token, checks that the Auth user is enabled, and requires an active `admins/{uid}` record with role `admin` before issuing a 12-hour HttpOnly, SameSite=Lax session cookie. The cookie is Secure in production.
- Added `POST /api/auth/logout`, which clears the browser cookie and revokes the account's refresh tokens. Expired, revoked, malformed, disabled or unapproved sessions are rejected by the server verification boundary.
- Protected every admin route except `/admin/login` through an optimistic Next.js Proxy cookie-presence check and an authoritative server layout check. The former admin preview bypass was removed.
- Added canonical administrator and dashboard-content types plus Zod schemas. `lib/admin/firebase-repository.ts` is the trusted server repository for administrator records and the small read-only `adminDashboardContent` collection.
- Connected the admin dashboard to the real `adminDashboardContent` Firestore collection while keeping the remaining admin/public content in mock mode. An empty collection renders a clear empty state.
- Added deny-by-default Firestore and Storage rules. Browser access to administrator records, drafts, enquiries, notes, dashboard records and private quote photos is denied; trusted operations run only through the Admin SDK after application authorization.
- Added Firebase Emulator Suite configuration and eight integration/rules assertions covering anonymous denial, authenticated browser denial, unauthorized writes, private Storage denial, approved administrators, unapproved users, disabled users, missing/invalid sessions, logout cookie clearing, and authorized server-repository reads.
- Added an admin error boundary suitable for failed Firebase reads. No project/resource CRUD, uploads, quote persistence, email workflow or deployment was implemented.

### Verification performed

| Check | Result | Exact Phase B outcome |
|---|---:|---|
| `bun run lint` | PASS | Exit code 0 after the final source changes; no errors or warnings. |
| `bun run typecheck` | HOST RUNNER FAILURE | Bun 1.3.14 returned `CouldntReadCurrentDirectory` before executing the script on this Windows checkout. The equivalent `node node_modules/typescript/bin/tsc --noEmit` completed with exit code 0. |
| `bun run build` | HOST RUNNER FAILURE | Bun returned the same `CouldntReadCurrentDirectory` before invoking Next.js. The equivalent `node node_modules/next/dist/bin/next build --webpack` completed successfully after dependency repair, generating 25 routes including dynamic protected admin and auth endpoints. |
| Firebase emulator security/auth suite | PASS | `npx firebase emulators:exec --project fes-local --only auth,firestore,storage "npx vitest run tests/security"` completed with exit code 0: 2 files and 8 tests passed. |

During dependency installation, an interrupted Bun extraction left binary-corrupted files in generated `node_modules` directories. The active dependency tree was repaired using npm's separate cache, the Bun lockfile was updated, and application lint/type/build plus emulator behavior were independently verified. A corrupted generated dependency tree remains quarantined under `tmp/node_modules-corrupt-install`; it is excluded from lint and TypeScript. The host drive should be checked before that quarantined directory is removed because Windows reported one unreadable path within it.

### Remaining Phase B / production blockers

- Create client-owned staging and production Firebase projects and supply their approved environment values through the host's secret management. The repository deliberately contains no production credentials.
- Enable Email/Password Authentication in those projects and create the approved administrator roster plus matching active `admins/{uid}` records.
- Review and deploy rules only after project ownership, billing/region and hosting decisions are approved.
- Re-run the exact Bun verification commands on a healthy checkout/drive. The direct Node and emulator results establish code correctness, but the requested Bun command gate is not recorded as a clean pass on this host.
- Perform an emulator-backed browser sign-in/logout smoke test after starting Next.js with the documented local environment values. Automated coverage passed; no production Firebase environment was available for a live browser login.

**Phase B status: IMPLEMENTED, WITH ENVIRONMENT GATE.** The codebase has the intended secure foundation and is ready for security review and staging configuration, but production Phase C work should not begin until the Firebase projects/admin roster exist and the exact Bun verification gate passes on a healthy filesystem.

## 1. Executive summary

The repository contains a substantial, coherent **frontend demonstration** of the contracted website. The public site has the promised main routes, responsive Tailwind layouts, project and article detail templates, a project gallery, tips, navigation, footer, baseline metadata, sitemap and robots configuration. The administrative area has screens for the contracted management functions and makes a deliberate effort to label preview-only behavior.

The contracted website is **not yet functionally complete or production-ready**. There is no Firebase dependency or configuration, no database, no Storage integration, no authentication, no protected admin route, no server-side authorization, no quote submission endpoint, no durable admin CRUD and no connection between admin edits and public pages. Public and admin content are maintained in two independent hardcoded datasets. Several demo projects are intentionally published in the public dataset, so the current build must not be presented as a live portfolio without client approval.

The highest-risk gap is not visual. It is the missing trusted application boundary: authentication, authorization, server validation, persistence and media access control. Implementing more admin UI before establishing that boundary would deepen the duplication already present.

**Updated overall assessment:** Phase A stabilization is **COMPLETE**. The public frontend remains **PARTIAL** against the full contract; the management area and quote workflow remain **MOCK**; Firebase/database/media/security deliverables remain **MISSING**; final content, domain, hosting choice and production approvals remain **BLOCKED** on the client or external accounts.

**Recommended immediate implementation task:** complete a narrow Firebase foundation vertical slice: approved-admin sign-in, server-verified session cookie, protected `/admin` routes, emulator-backed Firestore repository, and deny-by-default rules. Prove it first with read-only access to one collection before enabling any administrative write.

### Scope guard

The proposal includes the website, management area, Firebase database/storage integration, basic form/site security and basic SEO. It does not promise advanced analytics, a CRM, automated quoting, payment processing, customer accounts, a bespoke email platform, multilingual content, ongoing copywriting, social posting, or advanced SEO campaigns. Those should be separately approved and quoted.

## 2. Contract compliance matrix

Status vocabulary: **COMPLETE** = implemented and verified; **PARTIAL** = implemented but incomplete or not fully verified; **MOCK** = frontend demonstration only; **MISSING** = not implemented; **BLOCKED** = requires external access, approved content or a client decision.

| Contract requirement | Relevant source files | Status | Evidence of functionality | Missing functionality | Priority | Recommended next action |
|---|---|---:|---|---|---:|---|
| Home page | `app/page.tsx`, `components/home/tips-panel.tsx` | PARTIAL | Implemented route and responsive sections; consumes filtered public arrays | Hardcoded content; demo projects; no admin connection; final approved copy/images absent | P1 | Connect to published content repository after schema/auth foundation |
| About Us | `app/about/page.tsx`, `data/content.ts` | PARTIAL | Implemented route with page metadata and structured content | Approved company history, credentials and imagery; durable page-specific editing | P1 | Obtain approval and model an `about` page document |
| Electrical services | `app/electrical/page.tsx`, `components/services/*`, `data/content.ts` | PARTIAL | Service list and related-project presentation exist | Admin persistence; approved service detail copy; individual service routes are not contracted and remain optional | P1 | Read published services from Firestore |
| Fiber Optic services | `app/fiber-optic/page.tsx`, `components/services/*`, `data/content.ts` | PARTIAL | Service list and related-project presentation exist | Same persistence/content gaps as electrical | P1 | Read published services from Firestore |
| Projects and photo gallery | `app/projects/*`, `components/projects/*`, `lib/projects.ts` | PARTIAL | Listing, filtering, detail pages and lightbox-style gallery code exist; unpublished placeholders are filtered | All visible portfolio items are demo data; no real upload/persistence workflow; gallery content not client approved | P1 | Build project/media repository and replace demos with approved projects |
| Resources / Tips | `app/resources/*`, `components/resources/*`, `components/home/tips-panel.tsx` | PARTIAL | Published article filtering, detail pages, external-resource shape and tips presentation exist | Only one sample article is published; no persistent authoring/publishing; no approved external links | P1 | Implement resource/tip collections with publish controls |
| Request a Quote / Contact | `app/request-a-quote/page.tsx`, `components/forms/quote-form.tsx` | MOCK | Three-stage form, client validation, review and local image previews work | No submission, server validation, abuse protection, upload, database record, success state or public business contact information | P0 | Build a trusted quote-submission route after Firebase foundation |
| Customer photo uploads | `components/forms/quote-form.tsx` | MOCK | Browser file selection validates MIME, size and count and displays previews | Files never leave the browser; validation is client-only; no quarantine/storage rules/retention policy | P0 | Add server-authorized upload flow and Storage rules |
| Responsive desktop/tablet/mobile experience | `app/globals.css`, responsive classes across `app/` and `components/` | PARTIAL | Breakpoint-specific navigation and grid behavior are implemented | No recorded browser/device matrix, visual regression suite or verified production run | P1 | Test supported viewport/browser matrix and remediate defects |
| Approved administrator access | `app/admin/login/page.tsx`, `components/admin/login-form.tsx`, `app/admin/layout.tsx` | MOCK | Login UI explicitly reports that no credentials are submitted | Firebase Auth, allowlist/custom claims, session cookie, middleware/proxy gate, server authorization, logout/reset | P0 | Implement server-verified Firebase session authentication |
| Manage projects, galleries, photos, articles and tips | `app/admin/**`, `components/admin/**`, `lib/admin/repository.ts` | MOCK | Screens and local create/edit/delete interactions exist | Writes are temporary state; repository is read-only over mock arrays; public site is disconnected | P0/P1 | Define repositories and implement Firestore/Storage-backed CRUD |
| Update featured content | `app/admin/featured/page.tsx`, `components/admin/featured-manager.tsx` | MOCK | Preview management UI exists | Durable state, cross-collection validation, public consumption | P1 | Store ordered featured references and validate publish state |
| View/manage enquiries and quote photos | `app/admin/enquiries/**`, `components/admin/enquiry-*` | MOCK | Mock list/detail/status/note UI exists; localStorage holds some preview changes | No real submissions, PII authorization, audit fields, secure image URLs or durable changes | P0 | Implement admin-only enquiry repository and signed/authorized media access |
| Database and media storage integration | `lib/admin/repository.ts` | MISSING | A typed replacement boundary is documented | Firebase packages/config, Firestore, Storage, indexes, rules, emulator tests | P0 | Establish Firebase projects, schemas, adapters and rules |
| Basic form/site security | no security configuration present | MISSING | Admin pages carry `noindex`; quote UI has client validation | Authentication, authorization, server validation, App Check/rate limits, headers, rules, secret management, PII controls | P0 | Implement deny-by-default security architecture before writes |
| Basic SEO | `app/layout.tsx`, route metadata, `app/sitemap.ts`, `app/robots.ts`, article JSON-LD | PARTIAL | Titles/descriptions, sitemap, robots, Open Graph baseline and article structured data exist | Production domain is unconfirmed; canonicals, social image, favicon, Organization/LocalBusiness data and Search Console verification are absent | P1 | Confirm domain/business data, then complete launch SEO |
| Testing and launch | `package.json`, README commands | PARTIAL | Typecheck passed during audit | Lint fails; build did not complete; no automated tests, staging/UAT, monitoring or deployment configuration | P0 | Fix lint, make build deterministic, add critical-path tests and staging |
| Domain connection | metadata currently uses `https://www.fes.co.tt`; proposal names `fiberelectricsolutionsltd.com` | BLOCKED | Code has a placeholder deployment origin | Domain choice conflicts with proposal and ownership/DNS access is unknown | P0 before launch | Client must approve canonical domain and provide DNS access |
| Vercel hosting, free at launch | no deployment config | BLOCKED | Next.js is naturally compatible with Vercel | Vercel Hobby is restricted to personal/non-commercial use; commercial plan/vendor decision and billing approval required | P0 before launch | Approve Vercel Pro or another supported commercial host |
| Firebase monitoring budget alert | no Firebase project/config | MISSING | None | Billing account, Blaze decision, alert recipients and US$10 threshold | P1 before production uploads | Configure only after client approves Firebase billing |
| Optional digital presence setup | outside repository | BLOCKED | No evidence in repository; separately priced optional service | Client activation, account access and business information | Optional | Track separately; do not include in core website completion |
| Optional quarterly maintenance | outside repository | BLOCKED | No evidence expected in application code | Separate acceptance and service start | Optional | Keep outside implementation backlog unless purchased |

No row is marked COMPLETE because the current working tree has not passed the full required verification suite and core content remains disconnected from durable administration.

## 3. Public website audit

### Route inventory and findings

| Area | Finding | Status / action |
|---|---|---|
| `/` | Strong visual composition and sensible component reuse. Featured projects and articles are filtered before rendering. All six visible projects are labelled demos but still have `Published`/approved state. | PARTIAL. Do not launch demo portfolio as real work. |
| `/about` | Structured page content and metadata exist. Copy carefully avoids unsupported claims. | PARTIAL pending approved company content and CMS connection. |
| `/electrical` | Service catalogue and related projects are implemented from static arrays. | PARTIAL; public state cannot be edited by admin. |
| `/fiber-optic` | Same implementation pattern as electrical. | PARTIAL; public state cannot be edited by admin. |
| `/projects` | Client-side text/category filtering, empty state and demo disclosure exist. | PARTIAL; dataset is demonstration content. |
| `/projects/[slug]` | Static params, metadata, not-found behavior, optional fields, related items and gallery are implemented. | PARTIAL; no dynamic persisted content or cache/revalidation policy. |
| `/resources` | Search/filter hub supports articles and external-resource records. | PARTIAL; only one sample article is currently public. |
| `/resources/[slug]` | Published-only lookup, not-found behavior, article metadata and Article JSON-LD exist. | PARTIAL; authoring/publishing is disconnected. |
| Tips / Do's and Don'ts | Home tips component renders static content. | PARTIAL; admin tips do not update it. |
| `/request-a-quote` | Accessible-looking staged form with review and frontend validation. | MOCK; its final action says preview only and sends nothing. |
| Navigation/dropdowns | Desktop services disclosure, outside click and Escape handling exist; mobile navigation exists. | PARTIAL; needs keyboard focus-return/trap and browser testing. |
| Footer | Contracted navigation is present. | PARTIAL; public phone/email/address/social links are absent. |

### Loading, empty and error states

- Project and resource listing empty states are present.
- Dynamic routes use `notFound()`, but there is no custom `app/not-found.tsx`.
- There are no route-level `loading.tsx` or `error.tsx` boundaries. They are not critical for the current static arrays, but become necessary once Firestore/network reads are introduced.
- Admin data access has no loading/retry/error contract beyond normal async component resolution.
- The quote form has validation feedback but no submitting, upload-progress, recoverable server-error or true success state.

### Broken/disconnected behavior

- `components/admin/content-editor.tsx` and the public service/page data use different shapes and state stores.
- `data/content.ts` and `data/admin-mock.ts` duplicate projects, resources and tips with differing identifiers and fields. An admin edit cannot affect the public route.
- `businessSettings` is not consumed by the public header/footer/contact experience.
- Public metadata uses `www.fes.co.tt`, while the proposal names `fiberelectricsolutionsltd.com`. Sitemap and robots therefore risk advertising the wrong origin.
- No service detail routes exist. The admin editor correctly notes they are future routes; the proposal does not explicitly require individual service pages, so they should not be added without approval.

### Accessibility and responsive review

Positive evidence includes semantic headings in most page sections, skip link, `aria-current`, disclosure state, labelled form controls, error announcements, keyboard-accessible buttons, descriptive image alternatives and reduced-motion support in the stylesheet.

Items requiring launch verification or remediation:

- The content preview dialog reads and mutates a ref during render; lint flags it and the behavior may be unreliable.
- Modal/dialog focus trapping, initial focus, focus return and background inertness need testing across admin editors, galleries and previews.
- The services menu closes on outside mouse interaction but needs a complete keyboard interaction test (Tab/Shift+Tab/Escape and returned focus).
- Contrast must be measured, especially small text using low-opacity white/ink colors.
- Selected-image previews use plain `<img>` object URLs appropriately, but validation must be repeated server-side.
- Test at 320, 375, 768, 1024 and 1440 CSS pixels, with 200% zoom, keyboard-only navigation, iOS Safari, Android Chrome and current desktop Chrome/Edge/Firefox/Safari.

### SEO and performance

**Required for launch (basic SEO in scope):** confirm canonical production domain; add per-route canonical URLs; ensure every public route has an approved title/description; provide favicon and Open Graph image; generate sitemap from published persisted content; keep drafts/admin out of sitemap; validate robots behavior; add Organization or LocalBusiness structured data only after business facts are approved; verify indexing with the selected search console; and test real images through `next/image`.

**Optional/advanced, outside the base promise unless separately approved:** ongoing keyword strategy, content campaign, backlink work, conversion experimentation, advanced schema coverage, paid SEO tooling and ongoing ranking reports.

Performance risks are currently modest because assets are local SVGs and most public pages are statically generated. Real project photography, Firebase reads and client-side galleries will change that profile. Require responsive image dimensions, upload resizing/compression, caching/revalidation, bounded queries, bundle review and a Lighthouse/Web Vitals run on staging. No Web Vitals measurements were available in this audit.

## 4. Admin dashboard audit

| Section | Actual capability | Classification | Required completion |
|---|---|---:|---|
| Authentication / protection | Login simulates failure; `/admin` preview link bypasses sign-in; layout has no authorization | MOCK | Firebase Auth, approved-user policy, secure session, route and operation authorization, logout/reset |
| Dashboard overview | Summarizes mock arrays | MOCK | Aggregate real repository data with bounded queries and error states |
| Projects | Forms/list/detail interfaces change local state only | MOCK | Full CRUD, slug uniqueness, publication validation, server timestamps, optimistic concurrency |
| Gallery / Media | Mock assets and local previews | MOCK | Storage uploads, metadata documents, assignment/order/alt text, deletion/reference checks |
| Articles / Resources | Local article/resource forms and rich-text UI | MOCK | Sanitized persisted content, draft/publish workflow, external URL validation |
| Tips | Add/edit/reorder/toggle/delete in local component state | MOCK | Durable ordered tips and public published query |
| Featured Content | Local selection UI | MOCK | Persist ordered references; prevent draft/deleted items from being featured |
| Quote Requests | Mock list/detail; some preview updates use localStorage | MOCK | Real restricted queries, status/note writes, attachment authorization and audit fields |
| Site Content | Page-specific tabs exist for homepage, electrical, fiber, about and CTA | MOCK | Persist distinct page documents; connect public reads; add schema/version validation |
| Settings | Form and local file previews | MOCK | Persist approved public settings; keep secrets out; connect only public fields to public UI |

The Site Content UI is not merely one generic form: it has distinct homepage, electrical, fiber, about and CTA editors. That is a useful direction. However, its inputs are uncontrolled/local and save only a preview. It should evolve into page-specific typed documents, not a single catch-all record and not duplicated component-local state.

All administrative mutations must be authorized on the trusted server and again by Firebase Security Rules where a client SDK is used. Hiding a button or checking a client-side auth object is not authorization.

## 5. Data architecture findings

### Current state

- `types/content.ts` models public `Project`, `Article`, `ExternalResource`, `Service`, `Tip` and about content.
- `types/admin.ts` separately models `AdminProject`, `AdminResource`, `AdminTip`, enquiries, media, settings and managed content.
- `data/content.ts` is the public source of truth.
- `data/admin-mock.ts` is a separate admin demonstration source of truth.
- `lib/admin/repository.ts` offers only async reads over mock arrays; it has no create/update/delete contract.
- Quote input types exist, but no shared runtime validator exists. TypeScript types disappear at runtime.

### Duplications and relationship problems

- `Project` versus `AdminProject`, `Article`/`ExternalResource` versus `AdminResource`, and `Tip` versus `AdminTip` describe the same domain with different field names, identifiers and publication semantics.
- Public projects use `slug` (some also `id`); admin records require `id`. Gallery entries accept both strings and objects in the public model, complicating migration.
- `status`, `publicationStatus` and `approvalStatus` overlap. A single explicit lifecycle is needed.
- Admin project gallery data is reduced to `galleryCount`, while the public project embeds gallery data. Media also points back to a project. This creates competing ownership models.
- Settings and page content are hardcoded and not consumed across the public site.
- Dates are presentation strings in several admin types; persistent records need timestamps plus explicit publication dates.

### Recommended canonical model

Use shared domain records at the repository boundary, then map to view models only where presentation differs.

| Collection / document | Key fields and relationships |
|---|---|
| `admins/{uid}` | `email`, `displayName`, `role`, `active`, `createdAt`, `updatedAt`; document ID equals Auth UID |
| `sitePages/{pageKey}` | Typed `hero`, page-specific sections, `status`, `publishedAt`, `updatedAt`, `updatedBy`, `schemaVersion` |
| `services/{serviceId}` | `slug`, `category`, titles/descriptions, `mediaId`, `order`, `status`, audit fields |
| `projects/{projectId}` | `slug`, title, category, summary/body, location/period, `coverMediaId`, `status`, `featured`, audit fields |
| `projects/{projectId}/gallery/{itemId}` | `mediaId`, alt text, caption, order, audit fields; alternatively an ordered array of media IDs for small bounded galleries |
| `articles/{articleId}` | `slug`, type, category, summary, sanitized structured body, cover media, author, `status`, publish fields |
| `externalResources/{resourceId}` | title, source, HTTPS URL, summary, category, `status`, publish fields |
| `tips/{tipId}` | type, title, body, order, `status`, audit fields |
| `featured/{placement}` | ordered typed references such as `{kind, id}` and audit fields |
| `media/{mediaId}` | storage path (not arbitrary public URL), owner/context, MIME, bytes, width/height, alt/caption, hash, status, audit fields |
| `quoteRequests/{requestId}` | customer fields, service IDs, normalized status, attachment IDs/paths, consent/retention fields, timestamps; internal notes separated or admin-only |
| `quoteRequests/{requestId}/notes/{noteId}` | note, author UID, timestamp; admin-only |
| `publicSettings/business` | only approved public name/contact/location/hours/social links/SEO defaults |

Prefer stable document IDs and unique slugs enforced through a transaction/reservation document. Never use client-supplied filenames as storage object keys. Store timestamps as Firestore timestamps, not formatted strings.

### Publishing behavior

- Lifecycle: `draft | published | archived`; use `publishedAt` and optional `scheduledAt` only if scheduling is explicitly approved.
- Public queries must include `status == "published"`; public routes must return 404 for drafts, archived/deleted records and unknown slugs.
- Unpublishing removes an item from lists/sitemaps/featured placements. Existing detail URLs return 404 (or a deliberate redirect if a replacement exists).
- Prevent deletion when referenced as a cover/featured/gallery item, or remove references transactionally.
- Media deletion should be two-step (`pendingDeletion` then cleanup) to avoid broken pages.

## 6. Firebase integration plan

### Environments and configuration

Create separate Firebase projects for development/staging and production. Use the Emulator Suite in local development and CI. Commit indexes and rules; never commit service-account JSON or private credentials. Browser Firebase configuration is not a secret, but authorization must never depend on obscuring it. Keep Admin SDK credentials in host-managed server environment variables or workload identity.

### Firebase Authentication

1. Use Email/Password or a client-approved identity provider for a very small approved administrator set.
2. Provision accounts intentionally; disable public self-registration.
3. Mirror authorization in `admins/{uid}` and/or carefully managed custom claims. Require `active == true` and a recognized role.
4. Exchange the Firebase ID token through a same-origin server route for a secure, `HttpOnly`, `Secure`, `SameSite=Lax` session cookie created by the Admin SDK.
5. Protect the admin route early (Next.js proxy/middleware can redirect based on cookie presence), but perform definitive token/role verification in server layouts, route handlers and every mutation.
6. Revoke sessions when an admin is disabled; set a bounded session lifetime; implement logout and controlled password reset.
7. Log administrative mutations with UID and server timestamp. Do not log customer PII or tokens.

### SDK boundaries

- **Firebase client SDK:** browser sign-in/sign-out and only intentionally public/read operations if rules safely allow them. It may upload through a narrowly authorized, resumable mechanism after the server creates/authorizes a request context.
- **Firebase Admin SDK:** server-only session-cookie creation/verification, admin allowlist/role checks, trusted CRUD, quote processing, protected queries, cleanup and signed/authorized media delivery where appropriate.
- **Trusted Next.js route handlers/server actions:** runtime validation, authorization, slug/reference checks, transactional writes and uniform error mapping. Administrative writes should use this layer rather than direct client writes.

### Firestore queries and indexes

Expected indexes include `(status, order)` for services/tips; `(status, featured, publishedAt desc)` and `(status, category, publishedAt desc)` for projects/articles; `(status, submittedAt desc)` and possibly `(status, service, submittedAt desc)` for quote requests. Confirm actual query shapes in the emulator and commit generated `firestore.indexes.json`; avoid speculative indexes.

Use cursor pagination for enquiries/media and bounded public queries. Do not attach real-time listeners to large admin collections by default.

### Storage plan

- Separate paths: `public/projects/{projectId}/...`, `public/articles/{articleId}/...`, and `private/quote-requests/{requestId}/...`.
- Public editorial media may be readable publicly only after it is attached to published content. Quote photographs must never be in a public bucket path or exposed through permanent public download URLs.
- Validate allowlisted MIME types and magic bytes server-side; proposed launch limits: JPEG/PNG/WebP, maximum 8 MB each and five files, matching the UI. Confirm limits with FES before implementation.
- Generate collision-resistant object names, strip metadata where practical, resize/optimize editorial images and record dimensions/hash.
- Enforce ownership/request binding during upload, then finalize attachment metadata server-side. Add retention/deletion handling for abandoned uploads and closed enquiries.
- Consider malware scanning if business risk requires it; this is additional infrastructure and should be costed/approved.

### Security Rules baseline

- Deny all by default.
- Public Firestore reads only for explicitly published public collections/fields; no public list/read for admin profiles, drafts, quote requests or notes.
- Prefer Admin SDK for admin writes. If any direct client admin write is retained, require authenticated active admin role and validate allowed fields/types/transitions in rules.
- Quote creation should go through a server endpoint, not a broad public Firestore `create` rule.
- Storage rules must distinguish public editorial media from private customer photographs and cap size/content type. Rules complement but do not replace server inspection.
- Add emulator tests proving anonymous/admin/disabled-admin access for every collection and storage path.

### Spam, abuse and PII

Apply server rate limits by IP-derived key and request fingerprint without retaining unnecessary identifiers; use a honeypot and elapsed-time checks; consider Firebase App Check where it adds value; apply strict body/file limits; normalize inputs; and return generic errors. CAPTCHA should be a later response to measured abuse because it adds accessibility/privacy cost.

Collect only required customer information. Define retention, deletion and access policies; restrict quote data to admins; avoid placing PII in URLs, analytics, logs or email subjects; and document breach/revocation procedures.

## 7. Quote request workflow

### Current verification

The form supports category and specific-service selection, project location, property type, description, timeframe, name, email/phone, preferred contact method, optional photo selection, staged validation and review. Its final state correctly says nothing was submitted. Therefore the contracted workflow remains **MOCK**, not a partially working backend.

### Required end-to-end workflow

1. Client performs usability validation and prepares the request.
2. Server receives multipart/form data, checks origin/CSRF posture, rate limit, schema, lengths, contact consistency, file count/size/type and abuse signals.
3. Server creates a pending request ID, then stores verified images under its private path. On partial failure it deletes or schedules cleanup of uploaded objects.
4. Server creates/finalizes the Firestore request using server timestamps and attachment metadata.
5. Admin-only list/detail views read the record and authorized photographs.
6. Admin can move through allowed statuses (`new`, `reviewing`, `contacted`, `closed`) and append internal notes, with actor/timestamp audit fields.
7. Public UI shows success only after the server confirms persistence; duplicate retries use an idempotency key.

Email notification is useful but not required by the proposal. Before adding it, FES must approve recipients, sender domain, provider, data shared with that provider, expected volume, deliverability setup and recurring cost. Do not choose a provider implicitly. Submission success must not depend on notification success; record/alert notification failures separately.

## 8. Security risks

| Risk | Severity | Evidence | Mitigation |
|---|---:|---|---|
| Admin routes are public previews with no authentication | Critical | `/admin` is reachable directly; login links to it | Session-cookie auth plus server authorization on every route/mutation |
| No server-side authorization or validation | Critical | No route handlers/actions/Firebase/Admin SDK | Trusted API boundary and runtime schemas |
| Customer quote data/photos have no secure persistence design in code | High | Browser-only form and object URLs | Private Storage paths, restricted Firestore, retention/access policy |
| Admin/public sources diverge | High | Separate `data/content.ts` and `data/admin-mock.ts` | One canonical repository and schemas |
| Published demo content could be mistaken for FES work | High | Demo records have approved/published state | Exclude demos in production; obtain client-approved records |
| Production domain mismatch | High | `fes.co.tt` in metadata versus proposed `.com` domain | Client decision; single environment-driven canonical origin |
| Upload validation is client-only | High | MIME/size filters in browser only | Server magic-byte/size/count validation and object-key policy |
| Lint errors in dialog/state code | Medium | Seven errors in two components | Move dialog synchronization to effects; initialize persisted state safely |
| No automated tests | Medium | No test script/config found | Add security-rule, repository and critical E2E tests |
| No CSP/security header policy | Medium | No Next config/header policy found | Add tested headers/CSP compatible with Firebase and chosen host |
| Rich text needs a sanitization contract | Medium | Tiptap editor dependency and resource authoring UI | Store a constrained document schema or sanitize trusted HTML server-side |

## 9. Hosting decision requirements

The application currently builds as a Next.js 16 App Router project and will require server functionality for secure session cookies, authorized CRUD and quote processing. Firebase remains the database/storage/auth provider independently of the web host.

Pricing below is a planning snapshot checked on **14 October 2026**, in USD before taxes and usage overages; vendors can change it. Obtain a final quote at approval time.

| Option | Compatibility and security | Cost snapshot | Maintenance | Decision |
|---|---|---:|---|---|
| Vercel Pro | Best-fit native Next.js deployment, preview environments, managed functions/env vars; straightforward Firebase server integration | US$20/month base including one deploying seat and US$20 usage credit; about US$240/year before overages | Low | Recommended default if FES approves paid commercial hosting |
| Vercel Hobby | Technically convenient | US$0 | Low | **Not eligible for this commercial site** under current Vercel terms; do not launch here |
| Cloudflare Workers | App Router and many Next features supported through an adapter; requires runtime compatibility testing and adapter-specific build/deploy | Workers Paid minimum US$5/month (about US$60/year) plus overages; free tier exists but commercial suitability/limits still require approval | Medium/high | Viable cost-focused alternative only after a staging proof; Cloudflare now recommends vinext for new Next.js apps, adding migration risk |
| Railway | Can run a standard Node.js Next server with environment variables | Hobby US$5/month including US$5 usage for personal/indie use; Pro US$20/month including US$20 usage, plus overages | Medium | Use Pro for production business workload; more server operations than Vercel |
| Render | Can run Node web services and custom domains; persistent process model | Usage/instance plan dependent; confirm current paid compute price at approval | Medium | Viable Node alternative; validate region, cold-start/uptime and build resources |
| GoDaddy | Shared/cPanel products must not be assumed to support a persistent compatible Node/Next runtime; VPS could, with self-management | Product/region dependent | High for VPS | Consider only if FES identifies a specific product that supports Node version, build, SSR/routes, env vars and process supervision |

Primary references: [Vercel pricing](https://vercel.com/pricing), [Vercel Hobby terms](https://vercel.com/legal/terms), [Cloudflare Next.js/OpenNext guidance](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/), [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Railway pricing](https://docs.railway.com/pricing/plans), [Render web services](https://render.com/docs/web-services), and [Firebase pricing](https://firebase.google.com/pricing).

Required approval package: canonical domain, host/vendor/plan, billing owner, deployment account owner, region where configurable, environment-variable ownership, budget/spend alerts, preview/staging policy, log retention and rollback responsibility. No purchase, upgrade or deployment occurred during this audit.

## 10. Prioritised development roadmap

### PHASE A - Critical frontend fixes

**Tasks**

- Fix seven lint errors in `components/admin/content-editor.tsx` and `components/admin/enquiry-state.tsx`.
- Resolve the canonical-domain mismatch through configuration, without hardcoding another unapproved domain.
- Prevent demo projects/sample articles from appearing in a production environment.
- Add custom not-found/error/loading experiences appropriate to future data reads.
- Complete keyboard, focus, contrast and viewport testing; fix verified issues.
- Make `bun run lint`, `bun run typecheck` and `bun run build` deterministic.

**Dependencies:** client domain decision for final metadata; no Firebase dependency.

**Files likely to change:** the two linting components, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, route boundary files, environment/config files and affected styles/components.

**Acceptance criteria:** lint/typecheck/build all exit 0; no demo content in production; keyboard and target viewport checklist passes; canonical origin is environment-driven and approved.

**Risks:** changing modal behavior can introduce focus regressions; production filtering can make sections empty, so verified empty states are required.
**Gate:** clean build plus documented manual smoke test.

### PHASE B - Firebase foundation and secure admin authentication

**Tasks**

- Establish dev/staging and production Firebase projects and emulator configuration.
- Add client/Admin SDK modules with strict server-only boundaries.
- Define runtime schemas, canonical domain types and repository interfaces.
- Implement approved-account authentication, session cookies, logout/reset and protected admin layout/routes.
- Write deny-by-default Firestore/Storage rules and emulator tests.

**Dependencies:** Firebase project ownership, approved admin emails, billing/region decisions, chosen hosting environment.

**Files likely to change:** `package.json`, `lib/firebase/*`, `lib/auth/*`, `app/admin/layout.tsx`, auth route handlers, `types/*`, rules/index config, test config and environment example.

**Acceptance criteria:** anonymous/disabled users cannot view admin data or mutate anything; approved admin can sign in/out; sessions are server-verified; emulator tests prove rule boundaries; no secret reaches client bundles.

**Risks:** treating middleware cookie presence as final authorization; accidental permissive rules; service-account leakage.
**Gate:** security review and emulator test pass before any production write is enabled.

### PHASE C - Admin content persistence and media management

**Tasks**

- Replace mock repository with Firestore-backed project, resource, tip, featured, page-content, settings and media repositories.
- Implement authenticated server mutations with runtime validation and audit fields.
- Implement editorial uploads, metadata, ordering, alt text, reference-safe deletion and image optimization.
- Migrate approved seed content; keep drafts unpublished.
- Ensure Site Content uses distinct typed documents per page/section.

**Dependencies:** Phase B; approved schema/content; Storage limits.

**Files likely to change:** `lib/admin/repository.ts`, admin components/routes, shared domain types/schemas, Firebase modules/rules/indexes and migration scripts.

**Acceptance criteria:** verified CRUD persists across sessions; public data is not yet switched until migration is validated; draft/published transitions work; deleting referenced media is prevented; audit actor/timestamps recorded.

**Risks:** dual-write divergence, orphaned media, unsafe rich text, slug collisions.
**Gate:** CRUD integration tests and administrator UAT on staging.

### PHASE D - Public integration and quote submission

**Tasks**

- Switch public pages to published repository queries with caching/revalidation.
- Generate routes, metadata and sitemap from published content.
- Implement trusted quote endpoint, private photos, idempotency, abuse controls and real success/error states.
- Connect public settings/contact information.
- Connect admin enquiry list/detail/status/notes to real records.

**Dependencies:** Phases B-C; approved retention/privacy rules and business contact data; email decision if notifications are added.

**Files likely to change:** public routes, form, route handlers/server actions, repositories, sitemap, settings consumers, rules/indexes.

**Acceptance criteria:** admin publish/unpublish predictably changes public pages; drafts never render or enter sitemap; valid quotes persist with authorized photos; failures never show success; retries do not duplicate; only admins access customer data.

**Risks:** cache staleness, partial uploads, abuse/cost spikes, PII leakage.
**Gate:** end-to-end staging tests including failure and authorization cases.

### PHASE E - Security, responsive, functional and SEO testing

**Tasks**

- Threat-model auth, rules, uploads, PII and administrative actions.
- Run rule tests, integration tests, critical E2E journeys and dependency/security review.
- Test responsiveness, browsers, keyboard/screen reader basics, contrast and reduced motion.
- Run Lighthouse/Web Vitals with production-like media and data.
- Validate titles, descriptions, canonicals, OG, robots, sitemap and structured data.
- Add tested security headers, monitoring and backup/export/restore procedure where supported.

**Dependencies:** feature-complete staging deployment.

**Files likely to change:** tests, rules, config/headers, metadata, UI defects found during testing and operational docs.

**Acceptance criteria:** no critical/high security finding; lint/typecheck/build/tests pass; agreed accessibility/browser matrix passes; no draft/PII exposure; launch SEO checklist passes.

**Risks:** late client content/image changes invalidate performance and layout results.
**Gate:** signed technical QA report and client UAT approval.

### PHASE F - Client content, approval and production launch

**Tasks**

- Load final approved company, service, project, article, tips and contact content.
- Confirm image rights, alt text and publishing permissions.
- Approve host/Firebase costs, domain, DNS and administrator roster.
- Configure production environment, spend alerts and monitoring; perform migration and smoke tests.
- Connect domain, verify indexing, deliver administrator walkthrough and acceptance record.

**Dependencies:** client materials/approvals and Phases A-E.

**Files likely to change:** primarily persisted content and deployment settings; code only for approved defects.

**Acceptance criteria:** client signs off content/UAT; production checks pass; ownership/access are handed over consistent with payment terms; rollback path documented.

**Risks:** delayed approvals, DNS propagation, third-party billing and unlicensed/unapproved media.
**Gate:** written launch acceptance. No paid change proceeds without approval.

## 11. Client information and approvals required

- Confirm whether the canonical domain is `fiberelectricsolutionsltd.com`, `fes.co.tt`, or another owned domain; provide registrar/DNS access through a secure process.
- Approve hosting vendor/plan and named billing/account owner. Vercel Hobby cannot be used for this commercial launch under current terms.
- Create/approve Firebase projects, billing plan, region, US$10 budget alert recipients and account ownership.
- Provide the exact approved administrator email roster and role expectations.
- Approve business name styling, public email, phone, WhatsApp, general location, hours, social links and Google Business URL.
- Provide final company/about copy, credentials/certifications that may legally be claimed and service descriptions.
- Provide real project names, locations, dates, scopes, outcomes, photography, captions/alt context and written publication permission.
- Provide approved articles, external-resource URLs/sources and tips; confirm author attribution.
- Approve quote privacy notice, customer-photo consent wording, retention/deletion period, maximum upload limits and which staff may access enquiries.
- Decide whether email notifications are required; if yes, approve provider, sender domain, recipients and cost.
- Confirm browser/device support expectations and who gives final UAT/launch acceptance.
- Confirm whether optional digital-presence setup and/or quarterly maintenance were purchased; keep them separate otherwise.

## 12. Verification results

### Commands

| Check | Result | Exact audit note |
|---|---:|---|
| Test command inspection | NOT AVAILABLE | `package.json` contains no `test` script and no test configuration/files were found. No tests were invented or claimed. |
| `bun run lint` | PASS | Final Phase A run completed with exit code 0 and no reported errors or warnings. The original seven errors were fixed in `components/admin/content-editor.tsx` and `components/admin/enquiry-state.tsx`. |
| `bun run typecheck` | PASS | Final Phase A run completed with exit code 0 and no TypeScript diagnostics. |
| `bun run build` | PASS | Final Phase A run completed with exit code 0 using `next build --webpack`; Next.js generated all 23 route outputs. The default Turbopack build had reproducibly stalled on this Windows host, including after clearing `.next`, while the Webpack comparison completed successfully. |

### Static inspection evidence

- No Firebase, Firestore, Storage or Firebase Admin package is declared.
- No route handlers, server actions, auth middleware/proxy, Firebase rules/indexes or deployment configuration were found. Phase A added `.env.example` for the canonical URL and demo-content controls only.
- Public/admin data is hardcoded and duplicated.
- No automated test suite exists.
- The repository was already dirty before this audit. Existing modifications/untracked application files were preserved and not overwritten.

### Verification still required

- Add automated tests during Phase B, especially Firebase rules, authorization and repository boundaries.
- Complete the wider physical-device, browser, screen-reader, contrast and performance matrix in Phase E with production-like content.
- Re-evaluate the Webpack workaround after a tested Next.js/Turbopack upgrade; do not remove it without reproducing successful development and production builds on the target environment.
- Configure the client-approved `SITE_URL` before launch and confirm generated canonical, sitemap and robots output in staging.

## 13. Recommended immediate next implementation task

**Build the secure Firebase authentication and repository foundation as one constrained vertical slice.**

The slice should:

1. Add Firebase client/Admin initialization with validated environment variables and emulator support.
2. Add runtime schemas and a canonical `admins`/one-content-collection repository contract.
3. Authenticate only pre-approved administrators.
4. Exchange ID tokens for secure server session cookies.
5. Protect `/admin` in the server layout and protect the tested repository operation independently.
6. Add deny-by-default Firestore/Storage rules and emulator tests for anonymous, valid-admin and disabled-admin cases.
7. Demonstrate a read-only real collection in one admin screen; do not enable broad CRUD until the security tests pass.

This is the most important next task because every contracted functional feature—admin CRUD, publishing, media and enquiries—depends on a trustworthy identity and data boundary. It also prevents the current mock/public duplication from becoming the permanent architecture.

Phase A is complete and the baseline is clean. Proceed with this authentication/repository slice without combining it with a wholesale admin rewrite or quote upload implementation.
