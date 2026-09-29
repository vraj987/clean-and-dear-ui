# Responsive BytePe Storefront UI Expansion

## What I’ll build
- Keep the current BytePe visual style and existing pages, then add the requested UI as an extension rather than a redesign.
- Make the shared header, search, page content, product grids, checkout screens, and fixed mobile navigation responsive across phone, tablet, and desktop.
- Add polished hover, focus, selection, drawer, gallery, and page-transition motion with reduced-motion support.

## Product browsing
- Expand the shared catalog so every visible product card has a matching product-detail destination and relevant product imagery.
- Make brand circles and category controls open the products page with that filter selected.
- Rework the products page into a responsive catalog with sort, top-rated, and filter controls; use a mobile/desktop filter drawer inspired by the reference.
- Add live search suggestions in the shared header, with matching products, brands, and categories linking to their results.

## Product details
- Preserve the current details and add a vertical thumbnail gallery that replaces the main image when selected.
- Add desktop hover zoom beside the main image, while keeping touch interaction simple and usable on mobile.
- Add Protection Plan and Assured Buyback panels after the existing configuration and purchase details.
- Add a full-width product image story before the shared footer.

## Account and orders
- Turn My Profile into a UI-only login/register experience with tabs for password and OTP entry; no real authentication or OTP delivery.
- Add an order list and order-detail page with item, delivery address, pricing, payment summary, and a visual order-status timeline.
- Link the profile screen to the order history demo.

## Subscription experience
- Expand the subscription page with multiple illustrated plans, long descriptions, benefits, and calls to action.
- Add a step-by-step estimate calculator for brand, model, and storage.
- Add an invoice upload UI with an editable extracted-data preview and Generate Estimate action. Because the project is UI-only, extraction will be a realistic front-end simulation rather than actual OCR.

## Home and About
- Add a new mid-page promotional banner slider without removing the existing homepage sections.
- Expand About Us into a complete brand story, values, process, and trust-statistics page using the current BytePe styling.
- Keep the same shared review/footer treatment on all storefront pages.

## Routes
- Keep `/`, `/products`, `/products/$slug`, `/subscription`, `/about`, `/cart`, and checkout routes.
- Add `/orders` and `/orders/$orderId` for order history and details.
- Use query parameters on `/products` for brand, category, search, and filter state so header and homepage links open meaningful filtered views.

## Verification
- Check every route’s page metadata and navigation targets.
- Verify the complete UI flow and interactive controls in desktop and mobile layouts.
- Confirm the current build succeeds with no route, type, runtime, or overflow errors.
