# FES Operations and Launch Readiness Runbook

**Status:** owner review required before live customer collection or production deployment.

This runbook distinguishes controls already implemented in the application from operational decisions that remain pending. It does not authorize deployment, automatic deletion or live-data processing.

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

## Monitoring, incidents and abuse

Before live activation, name recipients and thresholds for repeated authentication failures, quote rate-limit rejection, invalid or oversized photographs, processing/cleanup failure, unusual submission volume, forbidden private-photo access and unexpected deletion attempts.

Incident response should preserve minimal diagnostic evidence, revoke affected sessions, disable live gates when containment is needed, avoid placing customer details in tickets or chat, and document the decision to restore, retain under legal hold or delete.

## Environment and secrets

The following live gates remain false until separately approved:

- QUOTE_SUBMISSIONS_LIVE_ENABLED
- QUOTE_PHOTO_UPLOADS_LIVE_ENABLED
- EDITORIAL_MEDIA_LIVE_ENABLED

The approved quote policy values are privacy approval true, consent version privacy-notice-2026-10-20-v1 and retention 365 days. The server-only abuse-hash secret must be generated securely, contain at least 32 unpredictable characters, and be stored only in the deployment secret manager. Firebase private keys, service-account files, passwords and tokens must never enter Git, browser variables, public settings, screenshots or support logs.

## Bounded staging acceptance

A separate owner authorization should identify the staging project, named administrator, non-sensitive test customer data, rights-cleared test images, time window and cleanup owner. The test should:

1. Confirm the exact project and bucket before enabling any gate.
2. Enable only the required staging gates.
3. Submit one request without photographs and one with a non-sensitive test photograph.
4. Verify consent version, retention deadline, sanitized private object, duplicate prevention and administrator access.
5. Verify unauthorized enquiry and photograph access fails.
6. Exercise status, notes, logout and session revocation.
7. Clean up only the named test records after explicit approval.
8. Disable the gates again unless continued staging use is separately approved.

## Production launch and rollback

Launch prerequisites:

- Owner approval of final content, administrator roster, required fields, operational privacy review, retention/deletion runbook and incident contacts.
- Successful bounded staging acceptance and complete Phase E evidence.
- Reviewed production environment values and secrets with all target IDs checked.
- Reviewed Firebase Rules, IAM, Storage lifecycle/recovery and indexes before any separately authorized deployment.
- Backup, monitoring and rollback owners named.
- Domain, hosting, analytics/cookie choices and launch window approved.

Rollback procedure:

1. Disable quote and upload live gates to stop new customer-data writes.
2. Restore the last verified application release without altering retained customer records.
3. Revoke affected sessions or administrator accounts where relevant.
4. Preserve logs and records under the approved incident/legal-hold process.
5. Validate public read-only pages and protected administration in staging before resuming.

Production deployment, DNS changes, Firebase infrastructure changes and destructive cleanup remain Phase F actions requiring explicit authorization.
