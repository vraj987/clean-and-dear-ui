# Responsive BytePe Storefront Expansion

## What I’ll build
- Upgrade product details with a thumbnail gallery, selectable images, pointer hover zoom, mobile-friendly image switching, and a full-width image sequence after product specifications and before the shared footer.
- Expand the shared catalog so every home and listing card opens its own product detail content instead of reusing the Galaxy page.
- Redesign All Products into a responsive commerce grid with sort, brand/category filters, a mobile filter drawer, and URL-based brand/category views.
- Make every home brand and category open its filtered product list, and change the home carousel so the active banner sits in the center with neighboring banners visible.
- Rebuild About Us as a polished long-form page based on the supplied reference: bold mission band, problems solved, how it works, benefits, values, founder, subscription call-to-action, partners, and shared footer.
- Replace the profile placeholder with a user-friendly front-end sign-in screen, add registration, a signed-in profile presentation, an orders list, and an individual order detail page.
- Improve product and category presentation with cohesive generated product imagery and responsive layouts.

## Navigation and behavior
- Keep the experience front-end-only: forms demonstrate validation and navigation, but do not create real accounts or save data.
- Add routes for registration, orders, order details, and filtered product discovery while preserving existing storefront and checkout URLs.
- Use the existing shared header and footer on all storefront content pages.
- Add keyboard-accessible gallery controls, filters, tabs, forms, and mobile navigation.

## Visual direction
- Follow the supplied BytePe references: airy white commerce layouts, orange-red actions, dark circular branding, serif editorial headings, compact product information, and restrained neutral surfaces.
- Use generated product renders as actual storefront media; screenshots remain visual references only.
- Keep layouts fluid across phone, tablet, and desktop widths without overlapping navigation, text, or controls.

## Technical details
- Centralize product details, brand, category, pricing, and imagery in the shared catalog.
- Use TanStack Router links and typed route/search parameters for product, brand, category, registration, orders, and order details.
- Keep visual values in semantic theme tokens and existing design components.
- Add unique title, description, Open Graph, and social metadata to every new content route.
- Verify compilation and the key desktop/mobile flows: home → filtered list → product → cart, profile → registration, and orders → order detail.
