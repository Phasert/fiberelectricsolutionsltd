# Legacy cleanup audit

**Audit baseline:** `0c51170c1a36dedb292797ffc54261f45af948f2`  
**Audit date:** 15 November 2026  
**Initial working tree:** clean

This inventory records the current system after the gallery, media-workspace and dashboard consolidation. It is intentionally conservative: production Firebase documents, Storage objects, migration markers and historical routes were not modified.

## Current route model

The public application retains `/`, `/about`, `/electrical`, `/fiber-optic`, `/projects`, `/projects/[slug]`, `/resources`, `/resources/[slug]`, `/contact`, `/request-a-quote` and `/privacy`. The protected CMS exposes Dashboard, Media & Projects, Articles & Tips, Quote Requests, Site Content and Settings.

`/admin/projects`, `/admin/projects/new`, `/admin/resources`, `/admin/tips`, `/admin/homepage` and `/admin/featured` are legacy-but-required compatibility routes. They redirect into the current workspaces. `/admin/projects/[id]` remains active for existing category-gallery container records and therefore is not safe to remove.

## Classified inventory

| Classification | Item | Evidence and decision | Risk / verification |
|---|---|---|---|
| Removed | `components/admin/media-projects-workspace.tsx`, `media-manager.tsx` and `gallery-organizer.tsx` | `/admin/media` redirects to `/admin/projects`, leaving this UI unreachable. | Media routes and repositories remain active. |
| Active | `components/admin/visual-media-picker.tsx` | Used by slideshow, resource and site-content selection flows; provides visual selection rather than filename-only controls. | High if removed. Preserve. |
| Active | Project repositories, schemas and `/projects/[slug]` | Existing published records, public slugs, reverse media references and the migrated Tommy's record depend on them. | High. Preserve backward-compatible data model. |
| Legacy but required | Old admin workspace routes listed above | Each route is an explicit redirect to the consolidated destination, preserving bookmarks and old links. | Low to retain; removing would create avoidable 404s. |
| Legacy but required | `scripts/migrate-tommys-brentwood.mjs`, curated fallback and migration-marker checks | The script is idempotent/dry-run by default; the marker prevents fallback resurrection and preserves historical archive semantics. | Critical. Do not delete or rerun against production without approval. |
| Legacy but required | `adminDashboardContent` repository/schema/tests | No longer rendered as client dashboard content, but it remains an authorization regression fixture proving protected server reads and deny-all browser rules. | Preserve until the security test contract is deliberately replaced. |
| Duplicate wrapper, retained | `components/admin/media-picker.tsx` | Thin single-selection adapter over the canonical visual picker, used by resource and existing project editors. | Harmless and clarifies call sites; no competing picker implementation. |
| Unused, removed | `components/admin/project-list.tsx` | Repository-wide symbol/import search found no consumer. It contained the obsolete named-project search/list and “Add project” action superseded by the Gallery tab. | Low. Removal verified by lint and typecheck; build/test environment status recorded below. |
| Active fixture | `data/admin-mock.ts` | Despite its historical name, business-setting defaults are imported by the settings repository and security tests. | Rename could cause noise without architectural benefit; preserve. |
| Uncertain, preserved | Old phase browser scripts and completion-history sections | They are not runtime code, but provide reproducible acceptance history and migration evidence. | Preserve as audit evidence unless an archival policy is approved. |

## Architecture and security findings

- Administrator navigation exposes only the six current workspaces. No Add Project dashboard action remains.
- Dashboard metrics are derived from actual media, slideshow, resource/tip and enquiry repositories. It does not render technical foundation records.
- Gallery and slideshow publication use Ready media records. Public repositories sanitize records and exclude unpublished content.
- Editorial media operations remain server-only and target-gated. Browser Firebase rules remain deny-by-default.
- Quote routes retain schema validation, throttling, privacy consent and private attachment delivery.
- Homepage Firebase-managed slideshow selections take precedence; approved local fallbacks remain when no published configuration exists.
- The confirmed establishment year is 2008 in the public defaults and schema default.
- No production Firestore document, Storage object, rule, IAM role, billing setting or environment secret was read or changed during this cleanup.

## Dependency review

Direct dependencies were checked against application, script and test imports. No package was removed solely because it lacked an obvious page import: build tooling, Firebase Admin transitives, media scripts and test usage were considered. Conservative version ranges and the Bun lockfile were left intact; no major upgrade was attempted.

## Verification record

| Check | Baseline/result |
|---|---|
| `bun run lint` | Passed. |
| `bun run typecheck` | Passed; Next.js route types generated. |
| `bun run test:unit` | Blocked before discovery: Windows `EPERM` writing `node_modules/.vite-temp`; installed modules resolve partly through `C:\fes-dev`. |
| `bun run test:email` | Blocked by the same dependency-directory `EPERM`. |
| `bun run build` | Blocked by generated-directory `EPERM`. A second attempt removed and recreated only the verified repository `.next` directory, then failed creating `.next/types/app/api`, confirming a filesystem/environment fault rather than stale build output. |
| Emulator and browser suites | Not claimed in this audit run; require a healthy dependency directory and emulator/browser services. Prior evidence remains in the dated audit documents. |

The blocked checks are environment failures already called out in the project brief; they are not reported as passing. After moving to a healthy locked dependency installation, rerun the full command matrix and responsive/browser acceptance before deployment.

## Read-only data consistency scope

Repository analysis found safeguards for missing slideshow media, publication eligibility, media reverse references, checksum conflicts and migration markers. A production collection/object scan was deliberately not performed because this task does not authorize production credential use. Any future consistency scanner should be read-only by default, redact customer data, emit document IDs rather than secrets, and produce a separately approved idempotent migration plan for changes.

## Remaining owner/deployment work

- Run the full automated and responsive acceptance matrix from a healthy dependency installation.
- Verify the deployed canonical domain, indexing, security headers and current bundle sizes.
- Confirm production monitoring, budget alerts, backup/restore ownership and retention operations.
- Obtain explicit approval before any production data migration, archive operation, Rules/IAM change or destructive media cleanup.
