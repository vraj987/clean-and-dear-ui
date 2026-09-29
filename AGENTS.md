<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to Lovable. Avoid rewriting published git history.
<!-- LOVABLE:END -->

- Use `PageShell` for all storefront content routes so navigation and footer remain consistent; this prevents page-specific chrome drift.
- Keep sample commerce data in `src/lib/catalog.ts`; this ensures cards and linked product screens share one source.
- The checkout journey is front-end-only and uses route navigation without persistence; no backend was requested.
- Keep profile access, OTP, invoice OCR, subscription estimates, and orders as front-end simulations; the requested experience is UI-only.
