# Wajie Ibrahim AI Custom Design — Project Context

## 1. Project Overview

Halcyonic AI Solutions is building an AI-assisted custom fashion design experience for Wajie Ibrahim.

The immediate goal is **not** to build the final production system. The current target is an **Approval Build / Mock-Up v0.1** that can be demonstrated to Wajie Ibrahim's staff before production implementation is finalized.

The mock-up must make the proposed customer journey feel real enough for Wajie's staff to review, understand, and approve the flow, UI, information captured, and operational process.

The expected staff review meeting is around **12–18 October 2026**.

---

## 2. Core Business Idea

Customers pay a small booking fee to access an AI-assisted custom design experience.

Current planned booking price:

- **RM5 per AI design booking**

The payment must happen **before AI generation is unlocked**.

Reason:

- AI image generation has real API cost.
- Allowing generation before payment makes the system easy to abuse.
- A paid booking provides a clear Shopify order/reference for every valid AI session.
- Usage limits can be tied directly to the paid booking.

The system must follow this rule:

> No valid paid Shopify order = no AI generation access.

---

## 3. Approved Customer Workflow

This is the current intended workflow and should be treated as the source of truth unless explicitly changed later.

```text
Customer
   ↓
Wajie Shopify Website
   ↓
AI Custom Design Booking
   ↓
Pay RM5
   ↓
Shopify Order Created
   ↓
Payment Confirmed
   ↓
AI Design Session Unlocked
   ↓
Customer Completes Design Form
   ↓
GPT Custom Prompting
   +
Wajie RAG Context
   ↓
Structured Fashion Design Specification
   ↓
FLUX Image Generation
   ↓
Customer Reviews Generated Design
   ↓
Modify / Regenerate
   ↓
Optional FASHN Virtual Try-On
   ↓
Customer Finalizes Design
   ↓
Final AI Design Data Attached / Linked to Shopify Order
   ↓
Wajie Staff Manages Customer Through Shopify Admin
```

---

## 4. Important Architecture Decision

### Wajie does NOT need a separate staff dashboard.

Wajie's staff already works inside Shopify Admin.

The production goal is therefore:

- Keep Shopify as the main operational interface for Wajie's staff.
- Keep customer/order/payment information in Shopify.
- Store AI-specific data in Halcyonic's backend/database where appropriate.
- Link AI design data back to the Shopify order.
- Later, optionally build a Shopify Admin extension that displays AI design information directly inside the relevant order page.

Do **not** build a standalone Wajie staff dashboard unless this decision is explicitly changed later.

For the mock-up, a **Shopify Admin Preview** page may be created only to demonstrate how AI information would appear to staff. It must be clearly presented as a mock representation, not a separate production dashboard.

---

## 5. Planned Production Technology

The long-term architecture currently planned is:

### Storefront / Commerce
- Shopify
- Existing Wajie Ibrahim Shopify storefront
- Shopify checkout/payment
- Shopify Orders
- Shopify Admin for staff

### Halcyonic Application
- Next.js
- TypeScript
- Tailwind CSS
- Vercel

### Data / Backend
- Supabase PostgreSQL
- Supabase Storage
- Potential Supabase Auth where needed
- Next.js server routes / server actions

### AI
- GPT-6 Luna for request interpretation / custom prompting
- Wajie-specific RAG pipeline for brand knowledge and design constraints
- FLUX for fashion concept image generation
- FASHN for optional virtual try-on

The mock-up should NOT depend on real API integrations unless explicitly requested.

---

## 6. Approval Build v0.1 Scope

The approval build should demonstrate the complete customer journey using mocked services.

### Required Screens / States

#### A. AI Custom Design Booking Entry

Explain what the service is.

Include:

- AI Custom Design
- RM5 booking fee
- Short explanation of what the customer receives
- Number of included generations
- Optional try-on indication
- CTA: `Book AI Design — RM5`

This page should feel like part of Wajie's storefront.

---

#### B. Mock Shopify Checkout / Payment

For v0.1 this may be simulated.

The user should be able to:

1. Click the RM5 booking button.
2. See a mock checkout/payment state.
3. Complete payment.
4. Receive a mock Shopify order ID.

Example:

```text
Order: #WI-AI-1042
Payment: PAID
AI Design Access: UNLOCKED
```

Do not integrate a real payment provider in the mock unless specifically requested later.

---

#### C. Paid Access Gate

The AI design route must require a valid paid booking state.

For the mock:

```text
payment_status = "paid"
```

is sufficient.

If unpaid, the customer should be redirected back to the booking/payment screen.

The UI should clearly demonstrate the production security concept:

> Paid booking required before generation.

---

#### D. AI Design Form

The form should collect enough information to demonstrate the proposed experience.

Recommended fields:

### Garment
Examples:
- Baju Kurung
- Kebaya
- Dress / Gown
- Jubah
- Other

### Occasion
Examples:
- Wedding
- Engagement
- Eid / Raya
- Formal Event
- Dinner
- Everyday / Casual
- Other

### Colour
- Primary colour
- Secondary / accent colour if applicable

### Style Direction
Examples:
- Modern
- Traditional
- Minimalist
- Elegant
- Romantic
- Statement
- Contemporary

### Fabric Preference
Examples:
- Chiffon
- Satin
- Silk
- Lace
- Songket
- Organza
- No preference

### Fit
Examples:
- Relaxed
- Regular
- Fitted

### Details
Examples:
- Embroidery
- Beading
- Lace
- Sequins
- Pleats
- Draping
- Minimal detailing

### Customer Reference Image
Mock upload UI is sufficient.

### Additional Request
Free-text field.

Example:

> "I want something elegant for my sister's wedding with subtle floral embroidery around the cuffs."

---

## 7. Mock AI Processing

For Approval Build v0.1, no real AI API is required.

When the user submits the form:

1. Show an AI processing animation/state.
2. Simulate these internal stages:

```text
Understanding your request...
Applying Wajie design guidelines...
Building your fashion specification...
Generating your design...
```

3. After a short simulated delay, return a deterministic mock result.

The result should feel believable and should be derived from the customer's form choices.

---

## 8. Planned AI Pipeline

The production pipeline is expected to become:

```text
Customer Input
   ↓
GPT-6 Luna
   ↓
Wajie RAG Retrieval
   ↓
Structured Design Specification
   ↓
Prompt Builder
   ↓
FLUX
   ↓
Generated Fashion Concept
   ↓
FASHN (optional)
```

The mock should preserve these boundaries in the codebase so that mocked functions can later be replaced by real adapters.

Example interfaces:

```ts
interpretDesignRequest()
retrieveWajieContext()
buildGenerationPrompt()
generateFashionConcept()
generateVirtualTryOn()
```

For v0.1, these functions can return fixtures.

---

## 9. Design Result Screen

Display:

- Large generated fashion image placeholder
- Design title
- Customer-selected attributes
- AI-generated design summary
- Structured specification
- Booking/order ID
- Generation count

Example:

```text
Modern Sage Green Baju Kurung

Fabric:
Chiffon

Silhouette:
Relaxed contemporary Baju Kurung

Details:
Subtle floral embroidery around cuffs and hem

Occasion:
Wedding

Colour:
Sage green with muted ivory accents
```

Actions:

- Modify Design
- Regenerate
- Virtual Try-On
- Finalize Design

---

## 10. Generation Limits

Payment does NOT provide unlimited generations.

The system should demonstrate usage limits.

Initial mock values:

```text
generation_limit: 3
generations_used: 0

tryon_limit: 1
tryons_used: 0
```

Recommended interpretation:

- 1 initial generation
- Up to 2 regenerations / modifications
- 1 virtual try-on

The exact commercial limits may change after Wajie staff feedback.

Every generation request must conceptually check:

```text
Is payment confirmed?
        ↓
Has generation limit been reached?
        ↓
Generate
        ↓
Increment usage
```

When the limit is reached, show a polished message instead of allowing another generation.

---

## 11. Virtual Try-On

FASHN integration is planned for production.

For v0.1:

- Use a mock customer-photo upload area.
- Show a simulated processing state.
- Return a placeholder try-on result.
- Enforce the mock try-on usage limit.

Do not build a real FASHN integration yet unless explicitly requested.

---

## 12. Finalization

When the customer clicks `Finalize Design`, show a final confirmation state.

Example:

```text
Your design has been submitted to Wajie Ibrahim.

Booking: #WI-AI-1042
Status: Design Submitted

Wajie's team can now review your design request.
```

The finalized record should conceptually contain:

- Shopify order ID
- Customer details
- Paid status
- Design form data
- Generated image URL
- Customer reference image(s)
- Structured design specification
- Generation count
- Try-on count
- Finalized status

---

## 13. Shopify Staff Experience

Production staff workflow:

```text
Shopify Admin
   ↓
Orders
   ↓
Open AI Custom Design Order
   ↓
Halcyonic AI Design Information
```

Information to eventually surface:

- AI booking ID
- Generated design preview
- Final design image
- Garment type
- Colour
- Fabric
- Occasion
- Style
- Customer notes
- Reference images
- Structured design specification
- AI design status
- Link to full AI design record if needed

For v0.1, create a mock `Shopify Admin Preview` only if useful for the presentation.

This is a preview of future Shopify integration, NOT a separate dashboard.

---

## 14. Suggested Status Lifecycle

```text
PAID
↓
DESIGNING
↓
DESIGN GENERATED
↓
CUSTOMER REVISION
↓
FINALIZED
↓
STAFF REVIEW
↓
COMPLETED
```

Possible abandoned/error states:

```text
PAYMENT FAILED
GENERATION FAILED
SESSION EXPIRED
LIMIT REACHED
```

---

## 15. Suggested Mock Data Shape

```ts
type AIBooking = {
  id: string
  shopifyOrderId: string
  paymentStatus: "paid" | "unpaid"
  status:
    | "paid"
    | "designing"
    | "generated"
    | "revision"
    | "finalized"
    | "staff_review"
    | "completed"

  generationLimit: number
  generationsUsed: number

  tryOnLimit: number
  tryOnsUsed: number

  customer: {
    name: string
    email: string
    phone?: string
  }

  designRequest?: {
    garmentType: string
    occasion: string
    primaryColour: string
    secondaryColour?: string
    style: string[]
    fabric?: string
    fit?: string
    details: string[]
    additionalRequest?: string
    referenceImages?: string[]
  }

  designResult?: {
    imageUrl: string
    title: string
    summary: string
    specification: Record<string, string | string[]>
  }
}
```

---

## 16. UX Principles

The product should feel:

- Premium
- Fashion-first
- Elegant
- Minimal
- Calm
- High-end
- Easy for non-technical customers

Avoid:

- Generic SaaS dashboard aesthetics
- Overly technical AI terminology
- Neon / cyberpunk AI styling
- Excessive gradients
- Developer-looking forms
- Visible raw JSON
- Chatbot-first UX

The customer should feel like they are using a premium Wajie Ibrahim design service, not an AI playground.

---


## 16A. Wajie Ibrahim Website Is the Visual Source of Truth

The mock must visually belong to the existing Wajie Ibrahim website.

Reference:

- https://www.wajieibrahim.com/

Before implementing or redesigning any customer-facing screen, inspect the current live Wajie Ibrahim website and follow its existing visual language.

This is a **hard design constraint**.

The AI Custom Design flow should feel like a natural new feature inside Wajie's existing Shopify storefront, not like a separate Halcyonic AI product pasted on top.

### Match the existing site as closely as practical

Agents should study and reuse the site's current patterns for:

- typography hierarchy
- font feel
- capitalization style
- header / navigation treatment
- spacing
- section widths
- button shapes
- button styling
- borders
- backgrounds
- product imagery proportions
- layout rhythm
- footer treatment
- mobile behavior
- visual density
- colour palette
- labels and microcopy style

At the time this context was written, the live storefront presents a restrained fashion-commerce structure with prominent uppercase section headings such as `LATEST COLLECTIONS`, `CUSTOM COUTURE`, and `PRE-ORDER COLLECTIONS`, along with simple commerce-focused navigation and product presentation.

However, **do not rely only on this written description**. The live website itself is the source of truth because its design may change.

### Do not invent a new AI design language

Avoid introducing:

- futuristic AI dashboards
- blue/purple AI gradients
- glassmorphism
- neon effects
- glowing borders
- chat-style interfaces unless specifically required
- generic startup landing-page visuals
- Halcyonic branding that visually overrides Wajie
- unrelated typefaces
- noticeably different button systems
- unrelated navigation
- a separate app-shell look

If the AI flow needs a new component that does not already exist on the website, design it by extending Wajie's existing visual system.

### Brand hierarchy

For this client-facing experience:

```text
WAJIE IBRAHIM = primary customer-facing brand
HALCYONIC AI = technology provider behind the experience
```

Halcyonic branding should be subtle or absent in the main customer flow unless explicitly requested by Wajie.

Possible understated attribution:

```text
AI experience powered by Halcyonic AI
```

Do not turn the mock into a Halcyonic-branded product.

### Agent requirement

Before major UI work, the implementing agent must:

1. Open the live Wajie Ibrahim website.
2. Inspect the homepage plus at least one shop/product or bespoke-related page where accessible.
3. Identify reusable visual patterns.
4. Implement the mock using those patterns.
5. Compare the mock against the live site before declaring UI work complete.

If there is any conflict between a generic design recommendation in this document and the current Wajie website, prefer the Wajie website unless doing so breaks usability or the documented product workflow.

---

## 17. Mock Build Technical Guidance

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
App Router
Reusable components
Mock service layer
Local fixture data
LocalStorage or lightweight in-memory state for demo persistence
Responsive design
Vercel-ready
```

Real Supabase, Shopify, GPT, FLUX and FASHN integrations should be isolated behind adapters/interfaces so they can be swapped in later.

Suggested project structure:

```text
app/
  ai-design/
  ai-design/form/
  ai-design/result/
  ai-design/try-on/
  ai-design/complete/
  mock-checkout/
  mock-shopify-admin/

components/
  ai-design/
  checkout/
  shared/

lib/
  mock/
  ai/
  shopify/
  usage/

types/
```

---

## 18. v0.1 Acceptance Criteria

The mock is considered ready for staff review when:

- Customer can enter the AI Custom Design experience.
- RM5 booking is shown.
- Customer can complete simulated payment.
- Mock Shopify order is created.
- AI design is locked until payment succeeds.
- Customer can complete the design form.
- Generation animation works.
- A believable design result appears.
- Generation usage is tracked.
- Regenerate / modify works within the limit.
- Try-on is represented.
- Try-on limit is represented.
- Customer can finalize the design.
- Final design remains associated with the mock Shopify order.
- A Shopify staff preview can demonstrate how the data will appear operationally.
- No separate Wajie staff dashboard is introduced.
- The app is responsive and demo-safe.
- No real API secrets are required to run the demo.

---

## 19. Out of Scope for v0.1

Do not spend time on these unless explicitly requested:

- Real Shopify checkout
- Real Shopify App installation
- Real Shopify Admin extension
- Production Shopify webhooks
- Real GPT integration
- Real RAG pipeline
- Real FLUX generation
- Real FASHN integration
- Production Supabase schema
- Production authentication
- Full observability
- Full billing system
- Production rate limiting
- Production deployment hardening

These come after workflow approval.

---

## 20. Core Principle

The approval build exists to answer:

> "Is this the experience Wajie Ibrahim wants customers and staff to use?"

It is not meant to answer:

> "Is every production integration already finished?"

Build the experience first. Harden the infrastructure after approval.
