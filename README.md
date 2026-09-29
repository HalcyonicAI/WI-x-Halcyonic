# Wajie Ibrahim — AI Custom Design · Approval Build v0.1 (Demo)

> **⚠️ This repository is a DEMO, not the production system.**
>
> It is an interactive mock-up built by **Halcyonic AI Solutions** so that **Wajie Ibrahim's** staff can review and approve the proposed AI Custom Design experience: the customer journey, the screens, the information captured, and how staff would see it in Shopify Admin. It is intended for the staff approval meeting (12–18 Oct 2026).
>
> Everything is simulated:
> - **Payments are fake.** The RM5 checkout is a mock of Shopify checkout. No money is taken and no real Shopify order is created.
> - **The AI is mocked.** GPT-6 Luna, the Wajie RAG, FLUX and FASHN are replaced by local fixtures. The design images are generated illustrations, not real AI output.
> - **The Shopify Admin page is only a preview** of a future Admin extension. It is not a separate staff dashboard.
> - **No data leaves the browser.** Demo state lives in the browser's `localStorage`, and uploaded photos stay on the device.
> - **No API keys or environment variables are needed.**
>
> The production build (real Shopify, Supabase, GPT, RAG, FLUX and FASHN integrations) comes only **after** the workflow is approved. See [Next steps](#next-steps-after-approval).

Product decisions live in [`context.md`](context.md) (the source of truth) and [`handoff.md`](handoff.md). The original brief is [`build-prompt.md`](build-prompt.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

For the staff meeting, run the production build (faster, and without the Next.js dev badge):

```bash
npm run build
npm start
```

Checks: `npm run typecheck` · `npm run lint`

Deploy: push to a Git repo and import it in Vercel (no environment variables required).

## Demo path (≈ 3 minutes)

| # | Screen | Route |
|---|--------|-------|
| 1 | Bespoke page — new **AI Custom Design RM5** card beside the existing RM100 bookings | `/` |
| 2 | Booking product page — RM5 fee, what's included, `Book AI Design — RM5` | `/ai-design` |
| 3 | Mock Shopify checkout → **Pay now** (or *Demo: simulate a declined payment*) | `/ai-design/checkout` |
| 4 | Order confirmation — `#WI-AI-1042 · PAID · AI Design Access UNLOCKED` | `/ai-design/checkout/confirmed` |
| 5 | Design brief (9 sections; *Start from an example brief* fills the context.md example) | `/ai-design/form` |
| 6 | Staged AI progress → design result with specification, usage and actions | `/ai-design/result` |
| 7 | Regenerate / Modify (3 generations total, then a calm limit message) | `/ai-design/result`, `/ai-design/form?mode=modify` |
| 8 | Virtual try-on (upload a photo or *use a sample photo*; 1 included) | `/ai-design/try-on` |
| 9 | Finalize (named confirmation) → submitted confirmation | `/ai-design/complete` |
| 10 | **Shopify Admin preview** — the AI block inside order `#WI-AI-1042` | `/mock-shopify-admin/WI-AI-1042` |

Try opening `/ai-design/form` before paying: the paid-access guard sends you back to the booking page.

**Presenter tools:** the small **DEMO** button (bottom-left, or `Shift + D`) shows the live booking state, jumps to any step, simulates a declined payment or a failed generation, and **resets the demo**. Hide it with `NEXT_PUBLIC_DEMO_CONTROLS=off`.

State is kept in `localStorage`, so refreshes and navigation keep the demo intact, and a second tab (e.g. the Shopify Admin preview) stays in sync.

## Architecture

```
UI (app/, components/)
  → lib/client/*            browser services + hooks (never call AI vendors)
  → app/api/*               route handlers = the server boundary (checks payment + quota)
  → lib/ai/pipeline.ts      interpret → retrieve → specify → prompt → generate
  → lib/ai/services.ts      THE place that selects adapters (mock today)
      lib/ai/mock/interpreter.ts   GPT-6 Luna  (interpretDesignRequest, buildDesignSpecification)
      lib/ai/mock/knowledge.ts     Wajie RAG   (retrieveWajieContext)  ← placeholder corpus
      lib/ai/prompt-builder.ts     buildGenerationPrompt (real, shared)
      lib/ai/mock/generators.ts    FLUX (generateFashionConcept) · FASHN (generateVirtualTryOn)
  → lib/shopify/mock-shopify.ts    createMockShopifyOrder · verifyBookingAccess
```

| Folder | Purpose |
|--------|---------|
| `app/(storefront)` | Wajie storefront chrome (header/footer replica) + all customer AI pages |
| `app/(checkout)` | Branded Shopify-checkout replica |
| `app/mock-shopify-admin` | Shopify Admin **integration preview** (not a separate dashboard) |
| `app/api` | `checkout`, `ai/design`, `ai/try-on`, `mock-render` (mock image host) |
| `lib/session` | Centralised `DemoSession` store (localStorage) + actions |
| `lib/usage/quota.ts` | Limits (3 generations, 1 try-on) and the access checks used by UI **and** API |
| `lib/ai/render` | Deterministic SVG fashion-illustration renderer standing in for FLUX/FASHN images |
| `lib/catalog/options.ts` | Form options (garments, occasions, colours in Wajie's colourway naming, …) |
| `types/` | `DemoSession`, `DesignRequest`, `DesignResult`, … |

### Swapping in real services later
1. Implement `DesignInterpreter`, `BrandKnowledgeRetriever`, `ImageGenerator`, `TryOnGenerator` (`lib/ai/types.ts`) under `lib/ai/live/` and select them in `lib/ai/services.ts`.
2. Replace `verifyBookingAccess` with a server-side lookup of the booking (Supabase) + Shopify order `financial_status === "paid"`; never trust client-sent usage.
3. Replace the mock checkout with the real Shopify product/cart/checkout and an `orders/paid` webhook.
4. Move reference images / try-on photos to Supabase Storage (signed uploads).

## Visual source of truth

The UI extends the live **wajieibrahim.com** system (inspected 29 Sep 2026): Bricolage Grotesque, black-on-white, uppercase headings and square black buttons, cream secondary buttons (`#FCF7F1`), grey product panels (`#EBEAEB`), `#DEDEDE` hairlines, 2:3 product imagery, and the same header/footer structure. The logo and bespoke photography load from Wajie's own Shopify CDN with offline fallbacks (`lib/brand/assets.ts`) — replace with supplied assets before production.

## Demo limitations

- The try-on result is a placeholder: the design is shown on the atelier figure, not composited onto the customer's photo.
- The brand "design notes" (`lib/ai/mock/wajie-knowledge.ts`), the booking terms and the "what happens next" copy are **placeholders written for the demo**. They need Wajie's approval.
- The mock API routes trust the booking state sent by the browser. Production must verify the booking and its payment server-side.

## Next steps after approval

1. Wajie staff review the flow, the RM5 price, the limit of 3 designs and 1 try-on, and the fields in the admin block.
2. Build production:
   - a Supabase schema;
   - the real Shopify product and checkout, with an `orders/paid` webhook;
   - live AI adapters (GPT-6 Luna, Wajie RAG, FLUX, FASHN);
   - server-side booking verification.
3. Turn the Shopify Admin preview into a real Admin block extension, based on `components/shopify-admin/AIDesignBlock.tsx`.

See [`handoff.md`](handoff.md) → *Last Agent Update* for the detailed status, known issues and decisions.
