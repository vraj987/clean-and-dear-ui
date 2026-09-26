# BytePe Storefront, Product, Cart, and Checkout UI

## What I’ll build
- Keep the existing BytePe home page and add the review summary, trust statistics, partner strip, FAQs, and full footer shown in the first two new references.
- Use one shared header and footer across the home, product, cart, address, and payment pages.
- Add a product-detail page matching the supplied Galaxy A57 screens: gallery, price and EMI choices, color/storage/RAM selectors, offers, delivery details, verification panel, and description/specifications.
- Add a cart page matching the cart summary reference, including the subscription/shopping switch, address prompt, order summary, and Continue action.
- Add an address page matching the billing/shipping form reference.
- Add a payment-options page so Save & Proceed completes the requested front-end flow instead of ending on a missing page.

## Navigation and interaction
- Replace placeholder home navigation links with real pages or useful storefront destinations.
- Product cards open the product-detail page.
- Buy Now adds the displayed product to the front-end cart flow.
- Cart Continue opens the address page; Save & Proceed opens payment options.
- Product selectors, tabs, thumbnail gallery, FAQ accordions, mobile navigation, and checkout form controls will work in the browser.
- Keep this UI-only: no account system, saved cart, payment processing, or order submission.

## Visual assets
- Treat all uploaded screenshots as references only.
- Generate a clean product image set for the sample Galaxy phone and use it throughout product and cart views.
- Preserve the current BytePe visual language: black circular mark, orange-red actions, neutral surfaces, serif section headings, and compact commerce layouts.

## Routes
- `/` — storefront home
- `/products` — product collection
- `/products/$slug` — product details
- `/subscription` — subscription information
- `/about` — about BytePe
- `/cart` — cart summary
- `/checkout/address` — shipping/billing address
- `/checkout/payment` — payment options
- `/profile` — simple account placeholder UI

## Technical details
- Extract reusable site header, footer, and product data/components rather than duplicating them.
- Use TanStack Router links and route files for every destination.
- Keep visual values in the semantic theme tokens and reuse the existing typography.
- Add unique title, description, Open Graph, and social metadata to every page.
- Verify successful compilation plus desktop and mobile layouts and the full product-to-payment navigation flow.
