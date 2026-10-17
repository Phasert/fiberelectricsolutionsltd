# Fiber & Electric Solutions Ltd. website

Phase 1 public-facing frontend for the FES website. The project establishes the visual system, public routes, project portfolio, resources area and quote-request interface described in the approved website proposal.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- Bun

## Setup

Install [Bun](https://bun.sh/) and run:

```bash
bun install
bun dev
```

Open `http://localhost:3000`. For production validation:

```bash
bun run lint
bun run typecheck
bun run build
```

Development and production builds intentionally use Next.js's supported Webpack fallback. On the current Windows toolchain, Next.js 16.3.8's default Turbopack processes repeatedly stall before the development server is ready or during production compilation, even after clearing generated `.next` state; the same source starts and builds normally with Webpack. This workaround can be re-evaluated after a Next.js/Turbopack upgrade is tested.

## Environment

Copy `.env.example` to a local environment file when deployment values are available. `SITE_URL` must be set to the client-approved canonical origin before production indexing is enabled. Demo projects and sample resources are visible automatically in development, hidden by default in production, and can be enabled only for an explicitly non-public preview with `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=true`.

## Structure

- `app/` — routes, metadata, sitemap and robots configuration
- `components/` — shared layout, UI, services, projects, forms and homepage components
- `data/` — temporary approved/placeholder frontend content
- `types/` — Firebase-ready content contracts
- `public/images/` — locally owned placeholder artwork, ready to be replaced by FES photography

## Phase 1 scope

Includes seven public sections, responsive navigation, reusable design tokens, accessible project filtering, project and article detail routes, client-side quote validation, file-selection display, reduced-motion support, basic SEO and placeholder content states.

## Deliberately deferred to Phase 2

Firebase configuration, authentication, admin/CMS tools, Firestore collections, media storage, live quote submissions, spam controls and production analytics are not implemented. The current form never claims to send an enquiry.

## Phase 2A admin preview

The `/admin` route contains the uncommitted Phase 2A administration frontend. It uses typed mock data through `lib/admin/repository.ts`, which is the integration boundary for Phase 2B. `/admin/login` demonstrates future authentication states but does not authenticate. A clearly labelled development link opens protected-screen previews without claiming a real session.

No admin action persists: create, edit, delete, upload, status and settings controls only update temporary browser state. Firebase Authentication, Firestore and Storage remain deliberately absent.

Types in `types/content.ts` and isolated content in `data/content.ts` form the boundary for a future Firebase repository/data layer. Components should consume those contracts rather than Firebase directly.

## Content still required

FES must confirm final service wording, public contact details, company background, credentials, project names/locations/descriptions, publishing permissions, real photography, logo files and the production domain before launch.
