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
