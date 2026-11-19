# FES Operations and Launch Readiness Runbook

**Status:** owner review required before live customer collection or production deployment.

This runbook distinguishes controls already implemented in the application from operational decisions that remain pending. It does not authorize deployment, automatic deletion or live-data processing.

## Control classification and launch gate register

Use these labels for every launch item:

- `CAN PREPARE NOW`: documentation, local/emulator verification and read-only review that Codex may complete without changing a live system.
- `OWNER ACTION REQUIRED`: a named owner must decide, approve, supply or attest to the item. Preparation is not approval.
- `REQUIRES EXPLICIT LIVE AUTHORIZATION`: the step writes to, deploys, enables or otherwise changes a live/staging service and must not occur without a separate instruction naming the operation and target.

| Severity | Launch item | Classification | Required evidence / current state |
|---|---|---|---|
| High | Rotate the administrator password disclosed in project chat and review/revoke sessions | `OWNER ACTION REQUIRED` | Rotation confirmation, date, account and unexpected-session result. Never record the password. Open. |
| High | Define the bounded live staging scope | `CAN PREPARE NOW` | Procedure is documented below. |
| High | Authorize and execute the bounded live staging test | `REQUIRES EXPLICIT LIVE AUTHORIZATION` | Written target, gates, time window, fixtures, operator and cleanup authorization. Not authorized. |
| High | Read-only review of deployed Firestore Rules, Storage Rules, IAM/ACL and secret names | `OWNER ACTION REQUIRED` | Owner grants suitable read-only access and names the reviewer. Not yet evidenced. |
| High | Deploy Rules, alter IAM/ACL, create/rotate secrets or enable a gate | `REQUIRES EXPLICIT LIVE AUTHORIZATION` | Separate reviewed change record and rollback plan. Not authorized. |
| Operational | Approve 12-month expiry/deletion owners and legal-hold authority | `OWNER ACTION REQUIRED` | Named preparer, approver and hold authority. Open. |
| Operational | Prepare retention dry-run and backup/restore procedures | `CAN PREPARE NOW` | Procedures are documented below; emulator verification remains safe. |
| Operational | Export, restore or delete staging/production data | `REQUIRES EXPLICIT LIVE AUTHORIZATION` | Named records/bucket, destination, retention and deletion authority. Not authorized. |
| Operational | Approve administrator roster, onboarding/offboarding and quarterly review owner | `OWNER ACTION REQUIRED` | Approved roster, reviewer and next review date. Open. |
| Operational | Prepare access-review checklist | `CAN PREPARE NOW` | Procedure is documented below. |
| Operational | Approve monitoring/incident recipients, thresholds and escalation times | `OWNER ACTION REQUIRED` | Named recipients and agreed thresholds. Open. |
| Operational | Configure live alerts, dashboards, quotas or lifecycle controls | `REQUIRES EXPLICIT LIVE AUTHORIZATION` | Reviewed target configuration and rollback. Not authorized. |
| Operational | Approve upload/abuse limits and recovery expectations | `OWNER ACTION REQUIRED` | Signed limits, RPO/RTO and exception owner. Open. |
| Operational | Name launch and rollback decision owners | `OWNER ACTION REQUIRED` | Primary and backup contacts with authority. Open. |
| Operational | Approve final business settings, public content and image rights | `OWNER ACTION REQUIRED` | Content sign-off and rights/attribution record. Open. |
| Evidence | Prepare Lighthouse, network/device, browser, accessibility and smoke-test scripts/checklists | `CAN PREPARE NOW` | Acceptance checklists are documented below. |
| Evidence | Run tests against an authorized production-like deployment | `REQUIRES EXPLICIT LIVE AUTHORIZATION` | Target URL/environment and approved test-data scope. Not authorized. |
| Evidence | Decide DNS, hosting, analytics and cookie behavior | `OWNER ACTION REQUIRED` | Recorded providers, ownership, consent requirements and launch window. Open. |
| Evidence | Change DNS, deploy hosting/analytics or production configuration | `REQUIRES EXPLICIT LIVE AUTHORIZATION` | Approved change window and rollback values. Not authorized. |
| Evidence | Final stakeholder UAT and go/no-go | `OWNER ACTION REQUIRED` | Named approvers, dated result and accepted exceptions. Open. |

## Customer enquiry retention

The approved policy baseline is 12 months from submission for a quotation enquiry and its associated private photographs. Each stored request has a retention deadline. No production cleanup schedule is active.

Before enabling cleanup, the owner must approve:

1. The person permitted to start deletion and the person who reviews the result.
2. A dry-run report listing reference, submission date, retention deadline, legal-hold state and attachment count without exposing customer details unnecessarily.
3. The backup/export location, encryption, access list and expiry.
4. A recovery exercise proving that an accidentally deleted test record and photograph can be restored within the agreed recovery window.
5. A legal-hold process that pauses deletion before any destructive action.
6. A deletion log that records reference, actor, time, object count and outcome without copying customer content.

Recommended procedure: generate and approve a dry-run report, apply legal holds, create and verify the authorized backup, delete one bounded emulator/staging fixture, confirm Firestore and Storage cleanup, review the audit record, and only then schedule production cleanup under separate authorization.

### Retention/deletion dry-run procedure

1. Run against emulators unless a separate authorization names a staging project and read-only scope.
2. Produce a report containing only enquiry reference, submitted date, expiry date, hold state, status and attachment count; omit names, messages, contact details and object paths.
3. Classify each record as not due, due, held, malformed or requiring manual review. A missing/invalid deadline must never become eligible automatically.
4. Reconcile the due count and attachment count with Firestore and Storage inventories. Record discrepancies without deleting anything.
5. Have the named deletion approver sign the report and legal-hold owner confirm the exclusions.
6. Under a separate destructive-action authorization, test exactly one labelled non-sensitive fixture. Record Firestore, Storage and audit-log outcomes.
7. Keep automatic production deletion disabled until the test, recovery exercise and owner sign-off are attached to the change record.

### Backup/export and restore verification

1. The owner selects an encrypted destination, service account/role, regional requirements, retention period and people allowed to retrieve exports.
2. Record the source project, collections and Storage prefixes included; customer data and editorial media require separate inventories and access boundaries.
3. Create no live export without explicit authorization. Emulator fixtures may be used to validate the manifest and checksums.
4. Verify an export by count, manifest, checksum and a sample of non-sensitive labelled fixtures. Never paste customer data or credentials into the audit.
5. Restore into an isolated emulator or separately authorized non-production target—not over the source—and confirm enquiry fields, notes, attachment privacy, editorial references and timestamps.
6. Confirm the restored private photograph is available only to an approved administrator and public derivative behavior remains publication-gated.
7. Record recovery duration, data-loss interval, failures and cleanup owner. The owner must accept the measured RPO/RTO before launch.
8. Delete the restore target only under its separately approved cleanup step; preserve evidence without preserving customer content.

## Administrator access

Implemented controls require an active Firebase Authentication account and a matching active administrators document with the admin role. Every server read or mutation verifies the session independently. Customer photographs use authenticated no-store delivery and have no public URL.

Operational procedure:

1. Owner approves the administrator email and business need.
2. A separate authorized operator creates the Authentication account and administrators document.
3. The administrator sets a unique password and enables any owner-approved account protections.
4. Record the approver, activation date and next review date outside the public application.
5. Review accounts at least quarterly and immediately after staff or contractor changes.
6. Offboarding disables Authentication first, marks the administrators document inactive, revokes sessions and records completion.

Shared, temporary or previously disclosed passwords must be rotated. Access reviews must include enquiry and private-photograph permissions.

### Secure password rotation and session invalidation

This is an owner action. Never send the replacement password through chat, source control, screenshots, tickets or the website Settings interface.

1. Confirm the exact Firebase Authentication user and matching active `admins/{uid}` record. Record only the UID/email, approver and time—not credentials.
2. The account owner changes the password directly through an owner-controlled Firebase/Auth workflow and stores it in the approved password manager. Codex must not handle or verify the replacement value.
3. Immediately revoke the user's refresh tokens with the Firebase Console or an owner-authorized Admin SDK operation. A password change alone is not accepted as evidence that every existing application session ended.
4. Review Firebase Authentication last-sign-in/account activity and the approved administrator roster. Disable the user and investigate if any session or account activity is unexpected.
5. Close every browser session. Verify an old `__session` cookie is rejected on the next protected request, `/admin` redirects to login, and a fresh login with the rotated credential creates a new session.
6. Record the rotation date, token-revocation time, reviewer, unexpected-session result and next access-review date. Do not record the password, cookie or token.

Implemented behavior: an administrator session lasts at most 12 hours; the cookie is HttpOnly, SameSite=Lax, path-scoped to `/`, and Secure in production. Login requires an ID token authenticated within the preceding five minutes. Every protected session verification checks Firebase revocation, the Authentication disabled state and the current active `admin` document. Application logout clears the cookie and revokes that user's refresh tokens, thereby invalidating the user's other existing FES sessions on their next verification. This global effect must be included in administrator support guidance.

### Administrator access-review checklist

1. Export or view the current Authentication users and matching `admins/{uid}` records using an owner-approved read-only method.
2. Match every active account to a named person, business need, approver and last sign-in; shared accounts are exceptions requiring explicit owner acceptance.
3. Confirm disabled/departed accounts are disabled in Authentication, inactive in Firestore and have sessions revoked.
4. Verify the minimum role needed for enquiries and private photographs; record any orphaned Auth user or administrator document.
5. Confirm the disclosed QA password was rotated and review the account for unexpected sessions before staging acceptance.
6. Have the owner sign the roster and assign the next review date, recommended quarterly and immediately after personnel changes.
7. Store only the decision record—not passwords, tokens, private keys or session cookies—in operational evidence.

## Monitoring, incidents and abuse

Before live activation, name recipients and thresholds for repeated authentication failures, quote rate-limit rejection, invalid or oversized photographs, processing/cleanup failure, unusual submission volume, forbidden private-photo access and unexpected deletion attempts.

Incident response should preserve minimal diagnostic evidence, revoke affected sessions, disable live gates when containment is needed, avoid placing customer details in tickets or chat, and document the decision to restore, retain under legal hold or delete.

### Monitoring and incident checklist

- Name a primary and backup recipient for authentication failures, forbidden administrator/photo access, quote throttling, rejected/oversized uploads, processing cleanup failures, deletion attempts, unusual submission volume and application error-rate/latency changes.
- Approve warning and critical thresholds, notification channel, acknowledgement time and after-hours escalation. Do not infer thresholds from emulator traffic.
- Verify alerts with synthetic, non-sensitive staging events only after live-test authorization; do not create real customer records to test alerts.
- For an incident: identify the affected project/environment, disable only the necessary live gate, preserve minimal logs, rotate/revoke affected credentials, assess legal-hold/privacy duties, validate recovery in staging, and obtain a go/no-go decision before reopening.
- Record start/end time, owner, scope, decisions, customer-impact assessment and follow-up actions without copying customer submissions or photographs.

## Environment and secrets

The following live gates remain false until separately approved:

- QUOTE_SUBMISSIONS_LIVE_ENABLED
- QUOTE_PHOTO_UPLOADS_LIVE_ENABLED
- EDITORIAL_MEDIA_LIVE_ENABLED

The approved quote policy values are privacy approval true, consent version privacy-notice-2026-10-20-v1 and retention 365 days. The server-only abuse-hash secret must be generated securely, contain at least 32 unpredictable characters, and be stored only in the deployment secret manager. Firebase private keys, service-account files, passwords and tokens must never enter Git, browser variables, public settings, screenshots or support logs.

Production quote submission was approved for project `fesproject-45db0` and bucket `fesproject-45db0.firebasestorage.app`. Configure these values together in the production deployment before enabling the gate:

```text
QUOTE_LIVE_ENVIRONMENT=production
QUOTE_ALLOWED_PROJECT_ID=fesproject-45db0
QUOTE_ALLOWED_BUCKET=fesproject-45db0.firebasestorage.app
QUOTE_SUBMISSIONS_LIVE_ENABLED=true
```

The runtime also requires `FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` to identify that same production target, plus the approved privacy, consent, retention and abuse-hash settings. Photo submissions additionally require both photo gates. A missing or mismatched environment, project or bucket keeps submissions disabled. Configure the complete environment atomically and redeploy; changing a developer's local `.env.local` does not change the hosted site.

## Production configuration readiness matrix

| Area | Verified/configured | Missing or approval-gated before production |
|---|---|---|
| Firebase target | Production is confirmed and quote submissions are owner-approved for project `fesproject-45db0` with bucket `fesproject-45db0.firebasestorage.app`. Staging `fesr-c3ae1` remains separately registered. Client and Admin SDK target guards fail closed. | Deploy the approved release with all production quote target and policy values set atomically. Keep `EDITORIAL_MEDIA_LIVE_ENABLED=false` until a separately approved upload window; never use the staging environment selector with production identifiers. |
| Authentication | Approved-admin checks, recent-login requirement, 12-hour revocation-aware sessions and logout revocation are implemented. | Rotate the disclosed credential, review sessions, approve the administrator roster and onboarding/offboarding owner. |
| Firestore/Storage Rules | Repository rules deny all browser Firestore reads/writes and all browser Storage access; server routes use Admin SDK authorization. Emulator tests pass. | Compare deployed Rules versions with reviewed repository rules; deployment requires explicit authorization. Review IAM/ACL inheritance separately. |
| Environment/secrets | `.env.example` separates public Firebase identifiers from server-only credentials. Quote guards register exact staging and production targets and fail closed on any mismatch. | Configure production secrets in the host secret manager, create a production abuse-hash secret and complete a redacted four-eyes environment review before deployment. |
| Uploads/private delivery | File count/size/pixel/type validation, metadata stripping, private quote namespace and authenticated no-store delivery exist. | Approve live quotas, monitoring, recovery, retention/deletion ownership and the exact public editorial-delivery model. |
| Retention | Every enquiry receives a 365-day deadline. The helper removes scoped private photographs and notes; legal holds are excluded. | Approve dry-run/deletion authority, durable audit evidence, backup/restore target and RPO/RTO. Automatic cleanup remains disabled. |
| Monitoring/incidents | Failure modes and incident checklist are documented. | Name primary/backup recipients, thresholds, channels, response times and authority to disable gates or roll back. Configure/test alerts only with explicit authorization. |
| Hosting/deployment | Production build succeeds and a smoke/rollback procedure exists. | Owner selects host/project, runtime, region, secret injection, build/start settings, deployment permissions and release/rollback owners. |
| Domain/DNS/HTTPS/email | Application supports a canonical `SITE_URL`; public contact email is content-managed. | Owner approves domain/records, DNS owner, HTTPS/certificate result, canonical redirects, sender/reply addresses, SPF/DKIM/DMARC and whether transactional email is in scope. |
| Public content | Draft/published isolation and approved Settings behavior are implemented. | Owner signs off business name, contacts, hours, SEO, services, projects, resources, tips, featured selections, privacy content and every image right/attribution. |

## Intended customer journey and communication gaps

The implemented launch journey is: customer visits the public website; reviews published services/content; opens Request a Quote; enters job and contact details; optionally attaches validated photographs; acknowledges the linked Privacy Notice; submits once through the idempotent server route; receives an on-page reference; and an authorized administrator later finds, reviews, annotates and updates the enquiry in the protected dashboard.

The application currently stores the enquiry; it does **not** prove that anybody is notified. No automatic customer confirmation email/SMS/WhatsApp message, administrator alert, mailbox integration, delivery retry, bounce handling or service-level response timer is implemented. Before launch the owner must decide whether the on-page reference alone is acceptable. If notifications are required, approve the provider, sender identity, recipients, templates, privacy/logging rules, retry policy and failure owner as a separately scoped change. Do not advertise an email confirmation or response time until that capability exists and is verified.

## Bounded staging acceptance

A separate written owner authorization must identify the exact staging project and bucket, named administrator, non-sensitive test customer data, rights-cleared test images, allowed gates, start/end time, monitoring recipient and cleanup owner. It must state whether cleanup of the named fixtures is authorized. Before the window, capture the current release hash, gate values, Rules versions, IAM/ACL review result and rollback owner without exposing secret values.

The authorized operator should:

1. Confirm the exact project and bucket before enabling any gate.
2. Confirm the deployed commit, approved administrator, secret presence (never value), Rules/IAM review and monitoring channel.
3. Enable only the individually authorized staging gates; record old and new values and activation time.
4. Smoke-test public read-only pages before writing data.
5. Upload one rights-cleared editorial fixture only if editorial upload is authorized; verify processing, approved derivative delivery, original privacy, publication revocation and deletion conflict behavior.
6. Submit one labelled quote without photographs and one with a non-sensitive rights-cleared photograph only if the respective quote gates are authorized.
7. Verify consent version, 365-day retention deadline, private sanitized object, idempotent retry, duplicate prevention and administrator-only access.
8. Verify anonymous/direct Firestore and Storage access fails; verify logout, session revocation, status changes and attributed internal notes.
9. Run the production smoke checklist below and capture redacted evidence, console/network failures and monitoring events.
10. Clean up only the named fixtures when cleanup is explicitly authorized. Confirm Firestore/Storage reference integrity and retain the minimal audit result.
11. Restore every gate to its recorded prior value unless continued staging use is separately approved, then have the owner record pass/fail and accepted exceptions.

Abort immediately on a project/bucket mismatch, unexpected production target, missing rollback owner, unauthorized data, exposed private object, failed authorization control, secret in browser output, destructive action outside the named fixtures or unexplained monitoring failure. Disable newly enabled gates and follow the rollback checklist.

## Production-like evidence and smoke testing

No item in this section may be run against a live target until the owner names and authorizes that target.

### Lighthouse and network/device evidence

1. Test the authorized release build on the production-like URL in a fresh profile at mobile and desktop presets; capture Performance, Accessibility, Best Practices and SEO reports for the homepage, a published project, a published resource and Request a Quote.
2. Repeat critical public journeys with fast and constrained mobile network profiles and at representative 360/390/768/1440 widths. Record device/browser/OS, latency profile and failures; do not set a passing score after seeing the result.
3. Investigate material regressions against the approved threshold. Any exception needs a named owner, severity and accepted launch decision.

### Cross-browser and accessibility evidence

1. Smoke-test current stable Edge, Chrome, Firefox and Safari/iOS Safari where available using fresh sessions.
2. Cover navigation, published content, responsive menus, quote validation/consent, approved administrator login/logout, protected-route redirects and private-photo denial.
3. Complete keyboard-only traversal, visible focus, dialog/menu escape behavior, form labels/errors, heading/landmark structure, zoom/reflow and automated WCAG scanning. Automated scans do not replace manual checks.
4. Record browser/version, viewport/device, pass/fail, console/network errors, defect link and retest result.

### Production smoke-test checklist

- Confirm release commit, environment name, Firebase project/bucket and all gate values before testing.
- Confirm HTTPS/canonical URL, robots/sitemap/indexing intent, security headers and absence of source-map/secret exposure.
- Verify homepage, About, service pages, Projects/detail, Resources/detail, Privacy and Request a Quote safe states.
- Verify published/draft isolation, featured/tip ordering, approved business contact actions, image fallbacks and controlled media caching.
- Verify administrator login/logout, every protected module, session expiry/redirect and unauthorized private-photo denial.
- When specifically authorized, submit only labelled test enquiries/uploads, verify monitoring and remove only approved fixtures.
- Confirm no console errors, unexpected 4xx/5xx, broken assets, horizontal overflow or critical accessibility failures.
- Record result, tester, timestamp, release hash and go/no-go owner. A failed critical control is a no-go.

## Production launch and rollback

### Ordered Phase F launch checklist

1. **Owner approvals:** sign the administrator roster, privacy/retention operating process, content and image rights, upload/abuse limits, monitoring contacts, hosting/domain choices, launch owner and rollback owner. Record accepted exceptions with severity and due date.
2. **Credential security:** rotate the disclosed administrator credential, revoke refresh tokens, review account activity/sessions and prove the old session is rejected without recording any credential.
3. **Production configuration:** four-eyes review the exact Firebase project/bucket, canonical `SITE_URL`, production runtime/build settings, secret names/presence, feature gates and safe defaults. Keep all live gates off during deployment.
4. **Rules and permissions:** review deployed Firestore Rules, Storage Rules, IAM/ACL inheritance, administrator records and least-privilege service identity. Any change/deployment requires explicit authorization and a rollback version.
5. **Content:** approve Business Settings, contact actions, hours, services, projects, resources, tips, featured content, privacy text, SEO and image rights. Confirm drafts/test fixtures are not public.
6. **Domain and hosting:** owner configures the selected host, domain/DNS and HTTPS; verify canonical redirects, certificate, robots/sitemap intent, email DNS decisions and ownership access. These are preparation instructions, not authorization for Codex to change them.
7. **Controlled deployment:** deploy the verified commit in the approved window with a named operator and rollback owner. Record configuration/release identifiers; do not enable customer-write gates yet.
8. **Smoke testing:** execute public, administrator, security, accessibility, cross-browser, network/device and production-like Lighthouse checklists. If authorized, enable only the bounded gate needed for labelled fixtures, then remove fixtures and restore the prior gate state.
9. **Monitoring:** verify application errors, auth failures, rate limiting, upload rejection, private-photo denial and cleanup failures reach the named recipients. Confirm acknowledgement and escalation paths.
10. **Go/no-go and rollback:** owner reviews evidence and explicitly decides. On no-go, keep/restore write gates off and execute the rollback checklist. On go, enable only separately authorized live capabilities, monitor closely and retain the signed launch record.

Launch prerequisites:

- Owner approval of final content, administrator roster, required fields, operational privacy review, retention/deletion runbook and incident contacts.
- Successful bounded staging acceptance and complete Phase E evidence.
- Reviewed production environment values and secrets with all target IDs checked.
- Reviewed Firebase Rules, IAM, Storage lifecycle/recovery and indexes before any separately authorized deployment.
- Backup, monitoring and rollback owners named.
- Domain, hosting, analytics/cookie choices and launch window approved.

Rollback procedure:

1. The named rollback owner declares the rollback and records the release/environment and reason.
2. Disable only the affected quote and upload live gates to stop new writes; this live change requires the already approved incident/rollback authority.
3. Restore the last verified application release and environment configuration without altering retained customer records or changing Firebase infrastructure ad hoc.
4. Revoke affected sessions or administrator accounts where relevant and preserve minimal logs/records under the approved incident/legal-hold process.
5. Verify public safe states, protected administration, data integrity and monitoring on the rollback release. Do not delete partial records outside an approved cleanup plan.
6. Validate the correction in staging, document the root cause and obtain a new go/no-go approval before resuming gates or redeploying.

### Final go/no-go record

The launch owner must confirm the release hash, successful bounded staging result, production-like evidence, content/image-rights approval, administrator roster, retention/backup/recovery approval, monitoring readiness, DNS/hosting/analytics/cookie decisions, rollback owner and stakeholder UAT. Each accepted exception needs a severity, owner and due date. Missing high-severity evidence is an automatic no-go.

Production deployment, DNS changes, Firebase infrastructure changes and destructive cleanup remain Phase F actions requiring explicit authorization.
