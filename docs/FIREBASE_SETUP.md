# FES Firebase Setup Guide

This guide is for the project owner. Complete the staging setup first. Do not put passwords, service-account JSON files, private keys or billing details in this repository.

## What is free and what needs approval

- Local development with the Firebase Emulator Suite is free and does not use live Firebase data.
- Firebase's Spark plan requires no payment method and includes no-cost products plus limited quotas for some paid products. Email/Password Authentication can be developed and tested without buying a plan.
- Cloud Storage for Firebase now requires the pay-as-you-go Blaze plan, including access to a default bucket. Blaze can still include no-cost usage, but a billing account is attached and overage charges are possible. Do not enable Blaze or create the production Storage bucket until the project owner approves billing, an owner is named, and budget alerts are configured.
- Staging and production must be separate Firebase projects so testing cannot alter live accounts or data.

Official references: [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [current Cloud Storage billing requirement](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), and [web application setup](https://firebase.google.com/docs/web/setup).

## 1. Decide ownership before creating projects

1. Choose the business-controlled Google account that will own Firebase and Google Cloud billing. Do not make a contractor's personal account the sole owner.
2. Name at least one backup owner and require multi-factor authentication on owner accounts.
3. Decide who may administer billing, production data and administrator accounts. Use the smallest permissions each person needs.
4. Approve a monthly budget and alert recipients before enabling Blaze. A budget alert warns about spend; it does not automatically stop usage.

## 2. Create separate staging and production projects

In the [Firebase console](https://console.firebase.google.com/):

1. Select **Create a project**.
2. Create a non-production project, for example `FES Website Staging`. Firebase generates a permanent project ID; check it carefully because it cannot later be changed.
3. Google Analytics is optional for this foundation and can be added later. Do not enable it merely to complete authentication.
4. Repeat only when ready for production, using a clearly different name such as `FES Website Production`.
5. Record each project ID and its owner in the private project handover record, not in public documentation.

Firebase projects are also Google Cloud projects. Never use the staging project for real customer enquiries or production photographs.

## 3. Register the web application

Repeat these steps in each Firebase project:

1. Open **Project overview** and choose the Web (`</>`) icon.
2. Enter an internal nickname such as `FES Website Staging Web`.
3. Do not enable Firebase Hosting unless that hosting choice has separately been approved.
4. Select **Register app**.
5. Copy the displayed web configuration values. These identifiers are used for the `NEXT_PUBLIC_FIREBASE_*` variables described below. They are not service-account private keys, but they should still be managed through the hosting environment rather than pasted into source files.

See Firebase's [web registration instructions](https://firebase.google.com/docs/web/setup).

## 4. Enable Email/Password Authentication

1. Open **Build → Authentication → Get started**.
2. Open **Sign-in method**.
3. Enable **Email/Password**. Do not enable Email link sign-in unless it is separately requested and tested.
4. Do not add a public registration page. The FES application intentionally permits only accounts created by an authorized project owner.
5. In production, review the authorized domains and remove any domain that is not required. Keep localhost only where the Firebase console and the agreed development process require it.

## 5. Create Firestore safely and choose a location

1. Open **Build → Firestore Database → Create database**.
2. Choose **Production mode**, not permissive test mode.
3. Select a location close to the main users and the eventual Next.js server. Trinidad and Tobago users will usually benefit from a nearby North American region, but the final regional or multi-region choice must be agreed with the hosting location, cost and resilience requirements.
4. Treat the location as permanent. Firebase locations are selected per resource, and changing them later generally requires migration.
5. Leave the database empty except for the first administrator record described below.

Firebase recommends choosing a location close to users and compute; regional locations can reduce cost and write latency, while multi-region locations provide stronger durability at a cost tradeoff. See [Firebase locations](https://firebase.google.com/docs/projects/locations) and [Firestore location guidance](https://firebase.google.com/docs/firestore/best-practices#database_location).

## 6. Configure Cloud Storage only after billing approval

1. Confirm written approval for Blaze billing, the billing owner and budget alerts.
2. Upgrade the correct project to Blaze. Check the project name and ID before confirming; staging and production are separate.
3. Open **Build → Storage → Get started**.
4. Choose a bucket location aligned with the approved data-location plan. Do not choose solely because a region has an Always Free allowance.
5. Do not accept or retain public test rules. This repository's `storage.rules` denies browser access by default.
6. Record the bucket name, which for a new project normally ends in `.firebasestorage.app`.

No uploads are implemented in Phase B. Storage is being provisioned only for later, separately approved phases.

## 7. Create the first approved administrator

Do this separately in staging and production. Use a named business-controlled email address.

1. In **Authentication → Users**, select **Add user**.
2. Enter the approved administrator email and a temporary strong password delivered through a secure channel. Never place the password in source control, chat logs or this guide.
3. After creation, copy the user's Firebase **UID** exactly.
4. In **Firestore Database → Data**, create a collection named `admins`.
5. Create a document whose document ID is exactly the copied UID.
6. Add these fields with the shown Firebase types:

   | Field | Type | Value |
   |---|---|---|
   | `email` | string | The same approved administrator email |
   | `displayName` | string | The administrator's approved display name |
   | `role` | string | `admin` |
   | `active` | boolean | `true` |

7. Sign in through staging and verify the dashboard before repeating the procedure in production.
8. To suspend access, disable the Authentication user and set `active` to `false`. The application checks both controls on every verified session.

An Authentication user without a matching active `admins/{uid}` document is rejected. Never create administrator documents from browser code.

## 8. Configure environment variables

Copy `.env.example` to a local `.env.local` file that remains ignored by Git. Fill the web values from **Project settings → General → Your apps**:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

For a real staging or production server, also set the server project ID:

```dotenv
FIREBASE_PROJECT_ID=
```

Prefer the hosting provider's Application Default Credentials or workload identity for Firebase Admin. If the approved host requires service-account environment variables, store `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` only in that provider's encrypted server environment. Never prefix them with `NEXT_PUBLIC_`, paste them into `.env.example`, or expose the service-account JSON to the browser.

For local emulators only, set the sample emulator variables already listed in `.env.example`, including `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`. Never set emulator host variables in staging or production.

## 9. Run the local emulators

Requirements are Node.js 16 or newer and Java 11 or newer. This repository already defines Auth on port 9099, Firestore on 8080 and Storage on 9199 in `firebase.json`.

```text
bun run test:emulators
```

That command starts the emulators, loads the checked-in deny-by-default rules, runs the security/authentication tests, and shuts the emulators down. Emulator data is temporary and must never contain real customer information. Firebase documents the workflow in the [Local Emulator Suite guide](https://firebase.google.com/docs/emulator-suite/install_and_configure).

## 10. Deploy security rules safely

Do not deploy until the target project ID has been checked by two people and the emulator tests pass.

1. Sign in to the Firebase CLI using the authorized business account.
2. Add clear aliases for staging and production with `firebase use --add`.
3. Run `firebase use` and confirm the active alias and project ID.
4. Run `bun run test:emulators` again.
5. Review `firestore.rules` and `storage.rules`. Phase B intentionally denies all browser reads and writes.
6. Deploy only rules to staging first:

   ```text
   firebase deploy --only firestore:rules,storage --project YOUR_STAGING_PROJECT_ID
   ```

7. Verify staging authentication and denied browser access.
8. Obtain production approval, re-check the production project ID, then repeat the same rules-only command for production.

CLI rule deployment overwrites the console's current rules, so the repository files are the source of truth. See Firebase's [rules deployment guidance](https://firebase.google.com/docs/rules/manage-deploy) and [CLI reference](https://firebase.google.com/docs/cli#deploy_specific_firebase_services).

## Owner completion checklist

- [ ] Business-controlled staging Firebase project created
- [ ] Business-controlled production Firebase project created
- [ ] Backup owner and MFA confirmed
- [ ] Email/Password Authentication enabled in both projects
- [ ] Web applications registered
- [ ] Firestore created in the approved location using production mode
- [ ] Blaze billing, budget and alert recipients approved before Storage creation
- [ ] Storage bucket created only after that approval
- [ ] First Authentication user and matching `admins/{uid}` document created
- [ ] Staging and production environment variables stored separately
- [ ] Emulator tests pass
- [ ] Rules deployed to staging and verified before any production rule deployment
