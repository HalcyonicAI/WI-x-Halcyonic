# Wajie Ibrahim AI Custom Design — Agent Handoff

## Read This First

Before making changes, read:

1. `context.md`
2. Existing project README
3. Current git diff / git status
4. Relevant route/component files

`context.md` is the current project source of truth for product decisions.

Do not silently override decisions documented there.

---

## Current Objective

Build **Approval Build / Mock-Up v0.1** for the Wajie Ibrahim AI Custom Design experience.

The purpose is to demonstrate the proposed workflow to Wajie's staff before full production implementation.

The priority is:

> A polished, believable end-to-end customer experience.

Not:

> Production-complete infrastructure.

---

## Non-Negotiable Product Decisions

### 1. Customer Pays Before AI Generation

Required flow:

```text
Wajie Shopify Site
→ AI Custom Design Booking
→ RM5 Payment
→ Shopify Order Created
→ Payment Confirmed
→ AI Session Unlocked
→ Design Form
→ AI Generation
→ Revisions
→ Optional Try-On
→ Finalize
→ Staff Handles It Through Shopify Admin
```

Do not move generation before payment.

---

### 2. No Separate Wajie Staff Dashboard

Do NOT create a standalone staff dashboard as a production concept.

Wajie staff should ultimately manage the workflow from Shopify Admin.

A mock `Shopify Admin Preview` is allowed for demonstration purposes.

---

### 3. AI Usage Must Be Limited

Default mock limits:

```text
generation_limit = 3
tryon_limit = 1
```

The system should visibly demonstrate that AI usage is tied to the paid booking.

---

### 4. No Real AI Required Yet

The following integrations should be mocked for v0.1:

- GPT-6 Luna
- Wajie RAG
- FLUX
- FASHN

Create clean adapter boundaries so mocks can later be replaced.

Do not hard-code AI logic throughout UI components.

Preferred abstraction:

```text
UI
↓
service / adapter
↓
mock implementation now
↓
real API implementation later
```

---


### 5. Match Wajie Ibrahim's Existing Website

The live website is the visual source of truth:

- https://www.wajieibrahim.com/

Before building customer-facing UI, inspect the current Wajie Ibrahim storefront.

The mock must look like a native extension of Wajie's Shopify website.

Do not invent a separate "AI app" design system.

Match or closely extend the site's:

- typography
- spacing
- capitalization
- buttons
- navigation
- colour palette
- section rhythm
- imagery treatment
- borders
- footer/header behavior
- mobile styling

Avoid neon AI aesthetics, blue/purple startup gradients, glassmorphism, chat-first layouts, or Halcyonic-heavy branding unless explicitly requested.

Brand hierarchy:

```text
Wajie Ibrahim = primary customer-facing brand
Halcyonic AI = underlying technology provider
```

Before handing off UI work, compare it against the live Wajie site and note any intentional deviations.

---

## Recommended Build Order

### Phase 1 — Skeleton

Create:

- Application shell
- Navigation
- Booking entry
- Mock checkout
- Paid-state session
- Design form
- Generation loading state
- Result screen
- Completion screen

Ensure routing works end-to-end.

---

### Phase 2 — Mock Business Logic

Implement:

- Mock Shopify order generation
- Payment status
- Paid access guard
- Usage counters
- Design request state
- Mock AI processing
- Mock generated result
- Modify / regenerate behavior
- Try-on mock
- Finalization

---

### Phase 3 — Presentation Polish

Focus on:

- Mobile responsiveness
- Premium fashion aesthetic
- Smooth transitions
- Loading states
- Clear error states
- No broken buttons
- Demo persistence
- Reset-demo control for developer use
- Strong empty / completed states

---

### Phase 4 — Shopify Staff Preview

If time allows, create a page that visually demonstrates:

```text
Shopify Admin
→ Order #WI-AI-XXXX
→ Halcyonic AI Custom Design
```

Show:

- Design image
- Customer selections
- Final specification
- Usage count
- Design status

Clearly label this as a Shopify Admin integration preview.

Do not turn it into a separate dashboard product.

---

## Suggested Routes

These are guidelines, not mandatory if the existing architecture already has equivalents.

```text
/ai-design
/ai-design/checkout
/ai-design/form
/ai-design/result
/ai-design/try-on
/ai-design/complete
/mock-shopify-admin/[orderId]
```

---

## Suggested State Shape

Prefer a centralized demo/session state.

Example:

```ts
type DemoSession = {
  bookingId: string
  shopifyOrderId: string
  paymentStatus: "unpaid" | "paid"

  generationLimit: number
  generationsUsed: number

  tryOnLimit: number
  tryOnsUsed: number

  status:
    | "unpaid"
    | "paid"
    | "designing"
    | "generated"
    | "revision"
    | "finalized"

  customer: CustomerData | null
  designRequest: DesignRequest | null
  designResult: DesignResult | null
}
```

Use localStorage or another lightweight demo persistence mechanism if useful.

The demo should survive normal navigation/refresh where practical.

---

## Paid Access Guard

Any design-generation route/action must conceptually enforce:

```ts
if (paymentStatus !== "paid") {
  redirect("/ai-design")
}
```

For mock code this can use local state.

For production this will later become Shopify order/payment verification.

Keep this distinction clear in comments.

---

## Mock Shopify Order

After simulated payment create something like:

```text
#WI-AI-1042
```

Generate a realistic but obviously mock-safe order number.

The booking/order ID should remain visible throughout the design flow to reinforce that the AI session belongs to a paid Shopify booking.

---

## Mock AI Layer

Create services such as:

```ts
interpretDesignRequest()
retrieveWajieContext()
buildGenerationPrompt()
generateFashionConcept()
generateVirtualTryOn()
```

Mock implementations may:

- wait 800–1500 ms
- derive text from form selections
- return fixture image paths
- increment usage

Do not call external AI APIs during v0.1 unless instructed.

---

## Generation Experience

Suggested progress copy:

```text
Understanding your request...
Applying Wajie design direction...
Building your fashion specification...
Generating your design...
```

Avoid overly technical terms like:

- embedding search
- vector database
- diffusion inference
- LLM context window

Customers do not need to see implementation details.

---

## Regeneration Rules

Before regeneration:

```text
payment confirmed?
generation quota remaining?
```

If quota remains:

```text
generationsUsed += 1
```

If quota is exhausted:

Display a premium, calm limit message.

Example intent:

> You've used the generations included with this booking.

Do not silently allow unlimited retries.

---

## Mock Try-On

The mock try-on should:

1. Require the customer to upload/select a photo.
2. Show a processing state.
3. Consume `tryOnsUsed`.
4. Return a placeholder composited/result image.
5. Stop when the included limit is reached.

---

## Finalize Action

Finalization should:

- Mark session as finalized.
- Preserve the selected/final design.
- Preserve usage counts.
- Preserve mock Shopify order ID.
- Show customer confirmation.
- Provide navigation to a Shopify Admin Preview for demo purposes if appropriate.

Do not send real emails or create real Shopify orders in v0.1.

---

## Visual Direction

Aim for:

- Luxury fashion
- Editorial spacing
- Neutral palette
- Strong typography
- Large imagery
- Refined buttons
- Minimal chrome
- Subtle motion
- Mobile-first usability

Avoid:

- SaaS dashboard styling
- Gamer/cyber aesthetics
- Generic AI gradients
- Neon purple-blue AI visual language
- Chatbot bubbles unless specifically needed

The AI should feel invisible and assistive.

---

## Code Quality

Use:

- TypeScript
- Reusable components
- Strong typing
- Small focused modules
- Clear service boundaries
- No API keys in client code
- No unnecessary dependencies
- Semantic HTML
- Accessible labels
- Responsive layouts

Do not over-engineer the mock.

---

## Required Demo Path

Before considering work complete, manually verify:

```text
1. Open AI Custom Design
2. See RM5 booking
3. Start booking
4. Complete mock payment
5. Receive mock Shopify order ID
6. AI flow unlocks
7. Complete design form
8. Submit
9. Watch mock AI progress
10. Receive generated design
11. Modify / regenerate
12. Usage count updates
13. Try-on works in mock form
14. Finalize design
15. Confirmation appears
16. Shopify Admin Preview shows final design data
```

There must be no dead-end screen during this path.

---

## Agent Handoff Format

Before ending a coding session, update this file or leave a concise handoff using the following structure:

```md
## Last Agent Update

### Completed
- ...

### Current State
- ...

### Files Changed
- ...

### Known Issues
- ...

### Next Recommended Task
- ...

### Important Decisions Made
- ...

### Commands
```bash
# relevant commands
```
```

Do not write vague handoffs such as "continue frontend".

The next agent should know exactly where to resume.

---

## Last Agent Update

_Updated 29 Sep 2026 — Approval Build v0.1 implemented._

### Completed
- A Next.js 16.3 app (App Router, Turbopack) with TypeScript and Tailwind v4 sits at the repo root. Everything is mocked: no API keys, no payments, no real Shopify orders.
- The full customer journey works with no dead ends:
  - `/` is a mock of Wajie's **Bespoke** page. The new "AI Custom Design RM5.00" card sits beside the real RM100 booking products.
  - `/ai-design` is the booking entry, built like Wajie's `ONLINE MEETING` booking product page.
  - `/ai-design/checkout` is a mock branded Shopify checkout, with a demo "simulate a declined payment" option.
  - `/ai-design/checkout/confirmed` is a Shopify-style thank-you page: `#WI-AI-1042 · PAID · AI DESIGN ACCESS UNLOCKED`.
  - `/ai-design/form` is the 9-section design brief. It has an "example brief" button that fills in the context.md example, and it autosaves the draft.
  - Submitting shows staged AI progress (the four context.md stages), then `/ai-design/result`. The result page shows the concept image, concept history, specification, selections, design notes, order ID and usage meters. Its actions are Finalize, Try-on, Modify and Regenerate.
  - `/ai-design/try-on` takes an uploaded photo or a sample photo, asks for consent, processes, and shows the result.
  - `/ai-design/complete` confirms the submission.
  - `/mock-shopify-admin` (orders list) and `/mock-shopify-admin/[orderId]` show the order page with the **"Halcyonic AI Custom Design"** admin block. It shows the final image, selections, notes, reference images, spec, usage, concept history and timeline, plus staff "Start review" and "Mark completed" actions. It is clearly labelled as an integration preview, not a dashboard.
- **Payment before generation** is enforced in two places:
  - `BookingGate` guards every AI route. An unpaid visitor is sent to `/ai-design?access=locked`, which shows a "Paid booking required" notice.
  - The API routes (`/api/ai/design`, `/api/ai/try-on`) check, in order: paid? → still open? → quota left? (402 / 409 / 429). Only then do they generate and increment usage.
- **Quota** is 3 generations and 1 try-on (`lib/usage/quota.ts`):
  - usage is consumed only when a result is actually returned;
  - at the limit, a calm message appears and the actions are disabled;
  - a shared "in flight" marker blocks a second run while one is still going.
- **Modify** keeps the edited concept's neckline, sleeves and kain unless the garment or fit changes. **Regenerate** explores a new variation. **Finalize** always submits the concept named in its dialog.
- **AI adapter boundaries** follow context.md §8. `lib/ai/services.ts` is the only switch point:
  - `interpretDesignRequest` and `buildDesignSpecification` are the mock GPT-6 Luna;
  - `retrieveWajieContext` is the mock RAG;
  - `buildGenerationPrompt` is real and shared;
  - `generateFashionConcept` is the mock FLUX;
  - `generateVirtualTryOn` is the mock FASHN;
  - `createMockShopifyOrder` and `verifyBookingAccess` are the mock Shopify.
- **Mock images** come from a deterministic SVG fashion-illustration renderer (`lib/ai/render/*`, served by `/api/mock-render`). Garment, colours, fabric, fit, details and placements all change the image.
- **Demo safety:**
  - The presenter **DEMO** panel sits bottom-left (or press `Shift+D`). It shows live state, jumps to any step, simulates failures, and resets the demo so it restarts at `#WI-AI-1042`. Hide it with `NEXT_PUBLIC_DEMO_CONTROLS=off`.
  - The session is kept in localStorage and syncs across tabs, so the admin preview can stay open in a second tab.
- **Accessibility and responsive:** native radio/checkbox controls, labelled colour groups, and a single screen-reader status line for progress. Focus is handled in the drawer, dropdown and dialogs. Greys meet WCAG AA. Inputs are 16px on mobile. Checked at 375, 800, 1280 and 1440px with no horizontal overflow.
- `README.md` was added with the demo script and architecture.

### Current State
- Checks pass:
  - `npm run build` (16 routes);
  - `npm run typecheck` (`next typegen && tsc`);
  - `npm run lint`;
  - a smoke test of the production server.
- The 18-step acceptance test from build-prompt.md was run in the browser: declined then successful payment, reference upload, modify, regenerate, the limit, try-on, finalize, the admin timeline and notes, and reset.
- Two structured multi-agent reviews ran: brand, requirements, accessibility, logic, architecture and fix-regression, with every finding adversarially verified. All confirmed findings are fixed except the items under Known Issues.
- `npm run dev` serves on port 3000.

### Files Changed
- **App:** `app/**` (route groups `(storefront)` and `(checkout)`, plus `mock-shopify-admin` and `api/*`), `components/**`, `lib/**`, `types/**`.
- **Config:** `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `AGENTS.md` and `CLAUDE.md` (Next.js agent rules).
- **Docs:** `README.md` (new) and this section of `handoff.md`. `context.md` and `build-prompt.md` are unchanged.
- Pushed to https://github.com/HalcyonicAI/WI-x-Halcyonic (`main`). The README explains that this repository is the demo / approval build.

### Known Issues
- **Brand assets are hotlinked** from Wajie's Shopify CDN (`lib/brand/assets.ts`): the logo, the bespoke hero and three booking photos. Offline fallbacks exist, but the demo looks best online. Get the official files from Wajie and put them in `/public/brand`.
- **Placeholder copy needs Wajie's approval:**
  - the brand design-notes corpus (`lib/ai/mock/wajie-knowledge.ts`, marked PLACEHOLDER);
  - the "Good to know" booking terms;
  - the "What happens next" steps;
  - the fabric and finishing wording.
- **Mock trust model:** the API routes trust the booking snapshot sent by the client (documented in `lib/shopify/mock-shopify.ts`). Production must verify the booking server-side, via Supabase and the Shopify order's `financial_status`.
- **Try-on is a placeholder:** it re-renders the design on the atelier figure (labelled "Demo preview") instead of compositing it onto the customer's photo.
- **Not implemented:** `SESSION_EXPIRED` (context §14) is out of scope for v0.1.
- **Images stay on the device:** reference images and the try-on photo live only in the browser. If storage fills up, images are dropped gradually and the DEMO panel shows a warning.
- **Product card image:** the AI card uses a concept illustration beside Wajie's photographs. This is intentional, since the product is a design concept, but a lifestyle photo from Wajie would suit the storefront better.

### Next Recommended Task
- **Before the 12–18 Oct meeting:**
  1. Put the brand assets in `/public/brand` and update `lib/brand/assets.ts`.
  2. Deploy to Vercel (no env vars needed).
  3. Rehearse the README demo on a phone and a laptop.
- **After approval:**
  - a Supabase schema;
  - a Shopify product and `orders/paid` webhook, replacing `app/api/checkout`;
  - real `lib/ai/live/*` adapters, selected in `lib/ai/services.ts`;
  - server-side booking verification in `verifyBookingAccess`;
  - a Shopify Admin block extension (`admin.order-details.block.render`), based on `components/shopify-admin/AIDesignBlock.tsx`.

### Important Decisions Made
- **The customer-facing UI was checked against the live wajieibrahim.com** on 29 Sep 2026: home, `/pages/bespoke`, `/products/online-meeting` and `/collections/custom-couture-booking`, on desktop and mobile. It was compared again after the review. The mock uses:
  - Bricolage Grotesque;
  - black on white, #666 secondary text and #DEDEDE hairlines;
  - the #EBEAEB product panel and #FCF7F1 cream secondary buttons;
  - square black primary buttons;
  - the live site's heading styles (48/700, 48/400 and 32/500) and 12px/1.6 body text;
  - the same header (switching to mobile below 990px) and footer;
  - 2:3 product imagery.
- **Intentional deviations from the live site:**
  - The checkout is styled as a branded Shopify checkout.
  - The admin preview is styled as Shopify Admin (Polaris).
  - The session and step bar are new, but built from the existing tokens.
  - The booking CTA is black, while the live booking product uses a cream button.
  - Halcyonic appears only in the footer credit, the admin app block and the presenter tools.
- "AI Custom Design (New)" was added to the Bespoke menu, and the RM5 booking is presented as another bespoke booking product.
- The mock order numbers start at `#WI-AI-1042`, and Reset Demo restarts them there.
- **Commercial values** (price, 3 generations, 1 try-on) live only in `lib/usage/quota.ts`. All customer copy is derived from them.

### Commands
```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # recommended for the staff meeting
npm run typecheck            # next typegen && tsc --noEmit
npm run lint
```
