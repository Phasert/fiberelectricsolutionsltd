# FES Security, Firebase Scalability and Performance Audit

**Audit date:** 2026-10-30  
**Repository:** `C:\fes-dev\fiberelectricsolutionsltd`  
**Deployed site observed:** `https://fiberelectricsolutionsltd.vercel.app`  
**Firebase staging target:** `fesr-c3ae1` / `fesr-c3ae1.firebasestorage.app`

## 1. Executive summary

The application has a sound server-authorized Firebase design: browser Firestore and Storage rules deny all access, administrator APIs independently verify revoked Firebase session cookies and the Firestore administrator allow-list, mutations enforce same-origin requests, customer photographs use private object paths and session-gated delivery, and uploads validate declared MIME type, file signatures, decoded dimensions, pixel counts, animation state and byte limits.

The audit nevertheless found launch blockers. The checked-in versions of Next.js and Sharp had two critical and multiple high advisories. The deployed site generated localhost sitemap URLs, returned `Disallow: /`, omitted baseline browser security headers, and returned all public pages with private/no-store caching. Administrator enquiries were read without a limit and then paged only in the browser. Contact throttling was instance-local and therefore ineffective across serverless instances.

Safe code fixes were implemented for the dependency, header, canonical/indexing, enquiry pagination, distributed contact throttling, repeated media reads, and featured-content query defects. No production deployment, live Firebase write, rule/index/billing change or destructive operation was performed.

**Verdict: not production-ready in the currently deployed state.** The repository is a substantially improved release candidate, but production readiness requires deployment of this commit, post-deploy verification of headers/canonicals/robots, resolution or documented acceptance of four blocked transitive advisories, scheduled retention cleanup, observability/alerts, and client security/UAT sign-off.

## 2. Scope, method and limitations

- Static review of authentication, authorization, APIs, schemas, uploads, rich text, Firebase repositories, caching, rules, environment usage and logging.
- `bun audit`, Git-history secret-pattern scan, emulator authorization tests and five low-volume synthetic unauthorized production probes.
- Sequential Lighthouse 13.6.0 mobile/desktop lab runs; production was not load-tested.
- Bounded local/emulator loads only: concurrency 5 for HTTP and validation, concurrency 2 for image processing.
- No access to Vercel Observability, Firebase billing dashboards, Cloud Logging, field Web Vitals, backup state, DNS registrar or production environment-variable settings.
- PageSpeed field-data query failed with the public API's daily quota exhausted. INP therefore remains **not measured**, not zero.
- No published project/article detail URL appeared in the deployed sitemap, so `/projects` and `/resources` list pages were the closest available test targets.

## 3. Security findings

### Critical

| Finding | Evidence | Resolution |
|---|---|---|
| Vulnerable Next.js 16.3.8 | `bun audit` reported GHSA-2464-fhr4-w9xw and GHSA-673q-mjm6-r5xr, both unauthenticated RCE advisories affecting Next.js through 16.4.0. | **Fixed in repository:** upgraded to Next.js 16.4.3 and aligned `eslint-config-next`. The vendor identifies 16.4.1 as the first patched 16.x release. |
| Vulnerable Sharp 0.34.5 processing untrusted images | Direct upload processing reached the affected native image stack; audit reported multiple libvips/libheif/librsvg advisories. | **Fixed in repository:** upgraded direct Sharp to 0.35.5 and adapted its type imports. |

Primary advisories: [Next.js image optimization RCE](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [Next.js cached typed-array RCE](https://github.com/advisories/GHSA-673q-mjm6-r5xr), [Sharp advisories](https://github.com/lovell/sharp/security/advisories).

### High

| Finding | Evidence | Resolution / status |
|---|---|---|
| Deployed site is excluded from search | `robots.txt` returned `User-Agent: * / Disallow: /`; sitemap URLs used `http://localhost:3000`. | **Fixed in repository:** production Vercel URL fallback, preview noindex protection, and tests. Deployment verification remains required. |
| Residual vulnerable transitive gRPC package | Final `bun audit`: 4 findings remain; the high finding is `@grpc/grpc-js@1.9.16`, pinned by Firebase's dependency range. | **Open/upstream-blocked:** the application no longer initializes browser Firestore/Storage in production login code. Do not force an out-of-range override; monitor Firebase releases. |

### Medium

| Finding | Evidence | Resolution / status |
|---|---|---|
| Missing browser security headers | Deployed pages exposed only HSTS among the checked security headers. | **Fixed in repository:** CSP, `frame-ancestors`, `X-Frame-Options`, nosniff, referrer policy, permissions policy, COOP, DNS-prefetch disable, and `poweredByHeader: false`. |
| Instance-local contact rate limit | A process `Map` could be bypassed across cold starts/instances. | **Fixed:** production uses a Firestore transaction keyed by a one-way client digest; local tests retain deterministic memory throttling. Configure TTL on `contactRateLimits.expiresAt` only after approval. |
| Public responses are not CDN-cacheable | Deployed public pages returned `Cache-Control: private, no-cache, no-store`; the first direct homepage probe had 3.153 s TTFB. | **Open:** data functions are cached, but pages explicitly use dynamic rendering. A staged ISR/cache-components change needs deployment-level validation before removal of `force-dynamic`. |
| Retention cleanup is not scheduled | Quote/media cleanup functions exist, but no verified scheduler/lifecycle execution was available. | **Open:** schedule authenticated cleanup and alerting after owner approval. TTL deletes are billable and must not be enabled silently. |

### Low / informational

- Final audit retains two moderate and one low transitive advisory (`@opentelemetry/core`, `uuid`, and the second gRPC advisory) blocked by dependency ranges. `bun audit fix` removed 21 findings without major-version overrides.
- The contact endpoint trusts Vercel's `x-forwarded-for`; do not expose the Node server directly without a trusted-proxy policy.
- Email failure logs contain only flow and normalized error code, not customer content or SMTP credentials.
- JSON-LD is serialized with `<` escaped; rich text is schema-sanitized and links are protocol-restricted.
- Session cookies are HTTP-only, secure in production, `SameSite=Lax`, 12 hours, and verified with revocation plus active-admin lookup. Proxy cookie presence is only an early redirect; the protected layout/API performs authoritative verification.

### Authorization evidence

- Firestore and Storage rules deny all browser reads/writes, including `quote-photos/**`.
- Live anonymous probes: Firestore administrator document `403`; Storage `quote-photos/` listing `403`.
- Deployed API probes: admin projects `401`, admin media original `401`, customer photo route `401`, cross-origin logout `403`, cross-origin contact `403`.
- Emulator suite: **20 files / 100 tests passed**, covering anonymous access, admin allow-list, disabled accounts, rules, private photos, content publication, quote abuse/idempotency and error paths.
- Git-history secret scan found no private-key/API-key pattern or tracked `.env.local`; `.env.local` is ignored. `.env.example` contains blank placeholders only.

## 4. Firebase scalability findings

### Fixed

- Administrator enquiries now use Firestore cursor pagination with a 25-document page and a 26th-document lookahead instead of reading the whole collection.
- Project gallery media documents are fetched in `getAll` batches (maximum 100 references per batch), eliminating one network round trip per gallery image.
- Homepage featured content now fetches the selected project/resource by ID instead of reading every published project and resource.
- Browser login initialization no longer creates unused Firestore and Storage client instances.
- Contact throttling uses a transaction, preventing per-instance counter divergence.

### Current query/index assessment

- Current queries use document lookups or single-field filters/orders (`status`, `category`, `submittedAt`, `createdAt`, `retentionUntil`, `enabled`, `order`). No confirmed missing composite index was produced by tests or the build.
- No `firestore.indexes.json` exists. Add a versioned index file when the first approved compound query is introduced; do not create speculative live indexes.
- Public project/resource/service lists remain unbounded but are cached for one hour and are content collections, not customer event streams. Add explicit limits/archive pagination before any collection is expected to exceed roughly hundreds of records.
- Media library, project/resource lists, tips and service administration still use bounded-by-content full reads. They are acceptable at current editorial scale but should gain cursor pagination before thousands of records.
- Quote rate/idempotency documents and contact limiter documents require expiry cleanup. Existing `expiresAt` fields do not delete data unless a scheduled job or approved Firestore TTL policy exists.
- Storage organization is appropriate: private originals and pending objects are separated from public immutable derivatives; customer images live under per-request private prefixes. Derivatives use versioned names and immutable cache headers.
- Image processing is CPU-heavy and executes in the request path. At sustained upload volume, move processing to a queue/background worker and cap concurrent jobs per instance.

### Scaling estimates

- A 25-row enquiry page costs approximately 25 document reads plus one cursor-document read on subsequent pages, instead of `N` reads for the whole collection.
- Firestore Standard includes 50,000 reads, 20,000 writes and 20,000 deletes per day plus 1 GiB storage/10 GiB monthly egress for one free database; paid usage depends on location. Official pricing notes that charges are per documents/index entries processed: [Firestore pricing](https://firebase.google.com/docs/firestore/pricing).
- At an illustrative 100,000 public dynamic page views/month, uncached server rendering could create many Firebase reads and Vercel invocations. The one-hour repository cache reduces data reads per warm function, but serverless cache reuse is not guaranteed across instances/deploys. CDN/ISR response caching is the next highest-value scaling change.
- Vercel's current model includes one million function invocations on published plans and bills additional invocations/CPU/memory by plan and region; verify the actual FES plan and region in the dashboard: [Vercel function pricing](https://vercel.com/docs/functions/usage-and-pricing).
- Storage cost is driven more by customer-photo retention and derivative egress than object count. Establish monthly upload/egress alerts before enabling public acquisition traffic.

## 5. Performance evidence

### Lighthouse 13.6.0 lab results — deployed pre-fix build

All values are synthetic lab measurements. LCP/FCP/TBT are milliseconds; CLS is unitless.

| Page | Mobile score | Mobile FCP | Mobile LCP | Mobile TBT | Mobile CLS | Desktop score | Desktop LCP |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home | 100 | 1,005 | 1,133 | 88 | 0 | 100 | 434 |
| Electrical service | 100 | 918 | 1,766 | 36 | 0 | 100 | 284 |
| Projects | 100 | 787 | 787 | 38 | 0 | 100 | 266 |
| Resources/articles list | 100 | 889 | 889 | 36 | 0 | 100 | 265 |
| Quote form | 99 | 1,173 | 1,173 | 46 | 0 | 100 | 268 |
| Admin login | 99 | 945 | 945 | 96 | 0 | 100 | 280 |

Mobile JavaScript transfer was approximately 146–155 KiB for public pages and 313 KiB for admin login. Lighthouse estimated 24–50 KiB unused JavaScript on public pages and 121 KiB on admin login. Main-thread work ranged from 867–1,569 ms. Total transferred page weight was approximately 478–486 KiB public and 642 KiB admin.

Direct sequential cold/warm probes observed TTFB from 0.328–0.532 s after the first homepage request; the initial homepage request was 3.153 s. Lighthouse server-response measurements were 81–102 ms, demonstrating warm-path performance rather than cold-start worst case.

No CrUX/field INP result was available. The public PageSpeed request returned daily quota exhaustion. Vercel function duration/cold-start distributions and Firebase latency percentiles require dashboard access.

### Performance interpretation

- LCP and CLS are strong in the tested lab environment.
- The largest practical risk is dynamic/no-store HTML, not rendering or layout instability.
- Admin login's larger bundle is largely Firebase authentication; unused browser Firestore/Storage initialization was removed.
- Public media derivatives are WebP, responsive variants, versioned and immutable. Intentional card crops use cover; full-screen gallery uses contain.

## 6. Bounded load-test results

All load tests used local Next.js production output and/or Firebase emulators. Production and live Firebase were not load-tested.

### Local HTTP, 20 requests per route, concurrency 5

| Route | Requests/s | p50 ms | p95 ms |
|---|---:|---:|---:|
| `/` | 85.40 | 46 | 110 |
| `/electrical` | 154.93 | 33 | 40 |
| `/fiber-optic` | 162.69 | 32 | 35 |
| `/projects` | 214.87 | 23 | 27 |
| `/resources` | 165.86 | 26 | 47 |
| `/request-a-quote` | 174.02 | 24 | 44 |
| `/admin/login` | 210.30 | 21 | 33 |

These results show no local bottleneck at concurrency 5. They do not predict Internet/Vercel/Firebase saturation or contractual capacity.

### Repository, validation and image throughput

- Enquiry pagination: 50 documents over two 25-record batches in **184 ms** on emulator.
- Quote validation: 100 invalid synthetic submissions, concurrency 5, **28 ms / 3,622 requests/s**. This measures schema/error-path CPU only, not Firestore/SMTP throughput.
- Image processing: ten 1920×1080 JPEGs, concurrency 2, **1,134 ms / 8.82 images/s** on this workstation. Serverless CPU/memory will differ; concurrency must remain bounded.

## 7. Confirmed issues fixed

1. Upgraded Next.js 16.3.8 → 16.4.3 and Sharp 0.34.5 → 0.35.5.
2. Applied compatible dependency patches; audit findings reduced from 31 (2 critical/16 high) to 4 (1 high/2 moderate/1 low), all transitive and range-blocked.
3. Added CSP and baseline response security headers.
4. Corrected canonical/indexing fallback for Vercel production while preserving preview noindex.
5. Added Firestore cursor pagination for administrator enquiries.
6. Replaced contact's instance-local production limiter with a Firestore transaction.
7. Batched gallery media fetches and direct-fetched selected homepage content.
8. Removed unused browser Firestore/Storage initialization.
9. Added repeatable bounded load/security configuration tests and scripts.
10. Adapted image processing to Sharp 0.35 types without weakening validation.

## 8. Remaining risks and launch recommendations

1. Deploy the audited commit to a non-production preview, verify Firebase auth under CSP, then promote through the existing release process.
2. After production deployment, confirm HTTPS canonicals, sitemap host, `robots.txt`, every security header and no CSP browser violations. The currently observed deployment remains unsafe/non-indexable until replaced.
3. Monitor Firebase releases for the blocked gRPC dependency and rerun `bun audit` in CI. Do not use an out-of-range override without Firebase compatibility tests.
4. Configure approved scheduled cleanup for expired quote requests, limiter documents, idempotency keys, failed media and orphaned Storage objects. Add legal-hold and failure alerts.
5. Enable budget alerts, backup/export verification, function error/latency alerts and SMTP failure monitoring. None were observable from the repository.
6. Stage an ISR/CDN response-caching change for public pages and measure content invalidation correctness before enabling it.
7. Add cursor pagination to editorial collections before they approach thousands of documents.
8. Move image processing to a queue if uploads become frequent or multi-admin concurrency is expected.
9. Run authenticated administrator browser UAT and real-device testing after deployment. Do not use production customer photographs as fixtures.
10. Confirm the client-approved canonical custom domain; the Vercel hostname fallback is safe, but it is not a substitute for domain ownership/SEO approval.

## 9. Exact verification record

| Command/check | Result |
|---|---|
| `bun audit` before fixes | 31 findings: 2 critical, 16 high, 10 moderate, 3 low |
| `bun audit` after fixes | 4 transitive findings: 1 high, 2 moderate, 1 low |
| `bun run lint` | PASS |
| `bun run typecheck` | PASS |
| `bun run test:unit` | PASS, 11 tests |
| `bun run test:email` | PASS, 11 tests |
| `bun run test` / emulator suite | PASS, 20 files / 100 tests |
| `bun run build` | PASS, Next.js 16.4.3 webpack production build |
| Lighthouse mobile/desktop | PASS on six deployed page targets; results above |
| Git-history secret-pattern scan | No matching tracked secret path/commit |
| Anonymous live Firebase read probes | Firestore 403; Storage 403 |
| Deployed unauthorized API probes | Expected 401/403 on all five checks |

## 10. Production-readiness verdict

**Current deployment: NO-GO.** It runs the pre-fix dependency set, blocks search engines, publishes localhost sitemap URLs and lacks confirmed browser security headers.

**Updated repository: CONDITIONAL GO for staging/UAT, not an unconditional production GO.** All local verification passes and the confirmed code defects are addressed. Production promotion depends on deployment verification, residual dependency acceptance, retention/monitoring operations, environment/domain confirmation and client UAT.
