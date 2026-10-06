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

Types in `types/content.ts` and isolated content in `data/content.ts` form the boundary for a future Firebase repository/data layer. Components should consume those contracts rather than Firebase directly.

## Content still required

FES must confirm final service wording, public contact details, company background, credentials, project names/locations/descriptions, publishing permissions, real photography, logo files and the production domain before launch.
