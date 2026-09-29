You are the lead product engineer building an approval mock-up for Halcyonic AI Solutions' first client, Wajie Ibrahim.

Before writing code:

1. Read `context.md` completely.
2. Read `handoff.md` completely.
3. Inspect the existing repository and reuse good existing structure where possible.
4. Do not introduce architecture that conflicts with the documented product decisions.


## Mandatory Visual Reference — Wajie Ibrahim Website

The current live Wajie Ibrahim website is the **visual source of truth** for this mock:

https://www.wajieibrahim.com/

Before designing the customer-facing UI:

1. Inspect the live homepage.
2. Inspect at least one shop/product or bespoke-related page where accessible.
3. Identify the existing visual system.
4. Build the mock as an extension of that system.

The AI Custom Design experience must look like it naturally belongs inside Wajie's existing Shopify site.

### Match the live site

Closely follow its current:

- typography and font character
- uppercase/lowercase conventions
- heading hierarchy
- navigation treatment
- whitespace and spacing rhythm
- container widths
- button treatment
- border treatment
- background colours
- product/editorial image proportions
- section organization
- mobile behavior
- footer/header styling
- overall visual restraint

Do not guess based only on this prompt. Inspect the live site because its design may change.

### Do NOT generate a separate AI aesthetic

Do not introduce visual language that feels unrelated to Wajie, including:

- generic AI startup UI
- neon colours
- glowing elements
- blue/purple AI gradients
- glassmorphism
- cyberpunk effects
- chatbot bubbles as the main interface
- dashboard-style app chrome
- unrelated typography
- Halcyonic branding dominating the customer journey

If a component does not exist on the current website, derive it from Wajie's existing patterns.

For example, an AI progress state should still use Wajie-like typography, spacing, buttons, backgrounds, and image treatment rather than turning into a futuristic loading console.

### Brand hierarchy

Treat:

```text
WAJIE IBRAHIM
```

as the primary brand customers see.

Halcyonic AI is the implementation/technology partner.

If attribution is needed, keep it subtle, e.g.:

```text
AI experience powered by Halcyonic AI
```

Do not redesign Wajie's storefront around Halcyonic branding.

### UI completion check

Before declaring UI work complete, compare each major screen against the live Wajie website.

Ask:

- Does this look like it belongs on wajieibrahim.com?
- Would a customer think they were redirected to an unrelated app?
- Are the buttons, typography, spacing and imagery consistent?
- Did we invent any unnecessary "AI-looking" visual treatment?

If the answer indicates a mismatch, revise it before handoff.

---

## Goal

Build **Wajie Ibrahim AI Custom Design — Approval Build v0.1**.

This is a polished, interactive mock-up for a staff approval meeting, NOT the final production build.

The mock must demonstrate the entire customer journey from RM5 booking through AI-assisted fashion design and final submission.

The experience must look believable enough that Wajie's staff can evaluate the proposed workflow.

## Core Flow

Implement this exact business flow:

```text
Customer visits Wajie Shopify experience
→ Opens AI Custom Design booking
→ Pays RM5
→ Mock Shopify order is created
→ Payment is confirmed
→ AI design session is unlocked
→ Customer fills design form
→ Mock GPT + RAG processing
→ Mock FLUX generation
→ Customer reviews design
→ Customer may modify/regenerate within quota
→ Optional mock FASHN virtual try-on
→ Customer finalizes design
→ Design is associated with Shopify order
→ Show how Wajie staff would see the information inside Shopify Admin
```

## Critical Rules

### Payment before generation

Do not allow AI design generation until the booking is marked paid.

In the mock, payment can be simulated.

Use the conceptual rule:

```ts
if (paymentStatus !== "paid") {
  blockAI()
}
```

### No separate staff dashboard

Do NOT create a standalone Wajie operations dashboard.

Wajie's production staff workflow will live in Shopify Admin.

You may create a page called something like:

```text
/mock-shopify-admin/[orderId]
```

only to preview how Halcyonic AI information could appear inside a Shopify order.

### AI usage limits

Use these mock defaults:

```text
generationLimit = 3
tryOnLimit = 1
```

Track and display usage.

Do not allow unlimited regeneration.

## Technical Stack

Use:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Reusable components
- Clean service/adaptor architecture

Prefer no unnecessary dependencies.

Make the app Vercel-ready.

For demo persistence, localStorage is acceptable.

Do not require Supabase, Shopify credentials, GPT keys, FLUX keys or FASHN keys for the mock.

## Required Pages / States

### 1. AI Custom Design Entry

Create a premium storefront-style page introducing:

- Wajie AI Custom Design
- RM5 booking fee
- What is included
- Limited AI generation access
- Optional try-on
- CTA: `Book AI Design — RM5`

The page should feel like luxury fashion ecommerce, not a SaaS tool.

### 2. Mock Checkout

Build a simple mock Shopify checkout experience.

Show:

```text
AI Custom Design Booking
RM5.00
```

Allow the customer to simulate successful payment.

After payment:

- create a mock Shopify order ID such as `#WI-AI-1042`
- set payment status to `paid`
- unlock the design experience

### 3. AI Design Form

Fields:

- garment type
- occasion
- primary colour
- optional secondary colour
- style direction
- fabric preference
- fit
- design details
- reference image upload
- additional request

Use elegant controls.

Include sample options appropriate to Malaysian modest / formal fashion such as:

- Baju Kurung
- Kebaya
- Dress / Gown
- Jubah
- Wedding
- Engagement
- Raya
- Formal Event
- Modern
- Traditional
- Minimalist
- Elegant
- Chiffon
- Satin
- Silk
- Lace
- Songket
- Organza
- Embroidery
- Beading
- Lace
- Sequins
- Pleats
- Draping

### 4. AI Processing State

After form submission, show a staged progress experience:

```text
Understanding your request...
Applying Wajie design direction...
Building your fashion specification...
Generating your design...
```

Use mocked delays.

Do not show technical implementation jargon.

### 5. Design Result

Show:

- large fashion design image
- design title
- design summary
- structured fashion specification
- customer selections
- Shopify order ID
- generation usage indicator

Actions:

- Modify Design
- Regenerate
- Virtual Try-On
- Finalize Design

The mock result text should derive from the form selections so the experience feels responsive.

### 6. Modify / Regenerate

Allow customer changes and regenerated mock outputs.

Before each generation:

- confirm payment is paid
- confirm quota remains

Increment usage.

When quota is exhausted, show a refined quota message.

### 7. Virtual Try-On Mock

Build:

- customer photo upload area
- processing state
- mock result image
- usage counter

Enforce `tryOnLimit = 1`.

Do not integrate FASHN yet.

### 8. Final Confirmation

Show:

```text
Your design has been submitted to Wajie Ibrahim.
```

Include:

- booking/order ID
- finalized design preview
- submitted status
- short explanation that Wajie's team will review the request

### 9. Shopify Admin Preview

Create a mock Shopify order-detail presentation.

This is NOT a new dashboard.

Show an order such as:

```text
Order #WI-AI-1042
Paid
```

and a section:

```text
Halcyonic AI Custom Design
```

Include:

- final generated image
- garment
- colour
- fabric
- occasion
- style
- customer notes
- structured specification
- generation usage
- try-on usage
- AI design status

Make it obvious how this could eventually become a Shopify Admin extension.

## Mock Service Architecture

Do not place mock API behavior directly in UI components.

Create service boundaries such as:

```ts
interpretDesignRequest()
retrieveWajieContext()
buildGenerationPrompt()
generateFashionConcept()
generateVirtualTryOn()
createMockShopifyOrder()
```

For now these functions should return fixtures / derived mock data.

This makes future integration straightforward:

```text
mock implementation
↓ later replace with
GPT / RAG / FLUX / FASHN / Shopify API
```

## Suggested State

Use a centralized `DemoSession` or equivalent:

```ts
{
  bookingId,
  shopifyOrderId,
  paymentStatus,
  status,
  generationLimit,
  generationsUsed,
  tryOnLimit,
  tryOnsUsed,
  customer,
  designRequest,
  designResult
}
```

Persist enough state so refresh/navigation does not immediately break the demo.

## Visual Direction

This must feel like a high-end fashion experience **and must remain visually consistent with the current live Wajie Ibrahim website**.

Use:

- strong editorial layout
- generous whitespace
- refined typography
- large imagery
- muted / neutral visual language
- subtle animations
- premium buttons
- smooth transitions

Avoid:

- generic SaaS UI
- developer dashboards
- cyberpunk aesthetics
- neon AI styling
- purple/blue "AI startup" gradients
- raw JSON
- visible technical jargon
- chatbot-first interface

AI should feel invisible behind the fashion experience.

## Responsive Design

The approval build must work well on:

- desktop
- tablet
- mobile

Assume many customers will use mobile.

## Demo Safety

Add a development-only or subtle `Reset Demo` function so the entire flow can be replayed easily during the staff meeting.

Do not require any external API keys.

Do not create real Shopify orders.

Do not perform real payments.

Do not upload data to third-party services.

## Acceptance Test

Do not call the mock complete until this works end-to-end:

```text
1. Open AI Custom Design
2. See RM5 booking
3. Start booking
4. Complete mock payment
5. Receive mock Shopify order ID
6. AI design flow unlocks
7. Complete design form
8. Submit
9. Watch AI processing state
10. Receive personalized mock design
11. Modify/regenerate
12. Generation usage updates
13. Try-on flow works
14. Try-on usage updates
15. Finalize design
16. Final confirmation appears
17. Shopify Admin Preview contains the finalized AI data
18. Refresh/navigation does not destroy the demo unexpectedly
```

## Implementation Behavior

Work autonomously.

Do not stop after scaffolding.

Do not leave major buttons non-functional.

Do not implement real external APIs unless specifically instructed.

If an image asset is unavailable, use a clean placeholder and structure the component so the final asset can be swapped later.

Prefer complete working mock behavior over premature production infrastructure.

## Handoff Requirement

Before finishing your session:

1. Update the `Last Agent Update` section of `handoff.md`.
2. Record:
   - what was completed
   - what files changed
   - current state
   - known issues
   - exact next recommended task
   - any important decisions
   - useful commands
   - confirmation that the customer-facing UI was checked against the current live Wajie Ibrahim website

The next agent must be able to continue without rereading the entire git history.

Build the mock from top to bottom and keep the product decisions in `context.md` intact.
