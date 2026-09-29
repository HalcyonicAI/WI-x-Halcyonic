import type {
  DesignRequestPayload,
  DesignSpecification,
  DesignVariant,
  DetailOption,
  Fabric,
  Fit,
  GarmentType,
  StyleDirection,
} from "@/types/design";
import type { RenderMotif, RenderParams, RenderPlacement } from "./render/params";

/**
 * AI adapter boundaries (context.md §8):
 *
 *   Customer input → GPT-6 Luna → Wajie RAG → Structured spec → Prompt builder → FLUX → (FASHN)
 *
 * Each interface below has a MOCK implementation in `./mock/*` today and will get a
 * real implementation later. Only `./services.ts` decides which one is used, so no UI
 * or route code changes when the real adapters arrive.
 */

export type Placement = RenderPlacement;
export type Motif = RenderMotif;

/** GPT's interpretation of the free-form request, normalised. */
export interface InterpretedBrief {
  request: DesignRequestPayload;
  garment: GarmentType;
  /** Label as the customer chose it ("Dress / Gown") — for lists. */
  garmentName: string;
  /** Noun for generated copy ("Gown", "Baju Kurung", "Kaftan"). */
  garmentNoun: string;
  occasionName: string;
  primary: { id: string; name: string; hex: string };
  accent: { id: string; name: string; hex: string } | null;
  styles: StyleDirection[];
  fabric: Fabric;
  fit: Fit;
  details: DetailOption[];
  /** Placements the customer asked for (e.g. "around the cuffs"). */
  requestedPlacements: Placement[];
  /** Placements the customer ruled out (e.g. "no embroidery on the sleeves"). */
  avoidPlacements: Placement[];
  motif: Motif;
  /** Tone cues from the notes: "subtle", "bold", … */
  intensity: "subtle" | "balanced" | "bold";
  isBridal: boolean;
  notes: string;
}

export interface WajieGuideline {
  id: string;
  topic: string;
  /** Internal guidance (staff / prompt use). */
  guidance: string;
  /** Customer-friendly phrasing shown as a design note (may adapt to the brief). */
  customerNote: string | ((brief: InterpretedBrief) => string);
  tags: {
    garments?: GarmentType[];
    occasions?: string[];
    fabrics?: Fabric[];
    styles?: StyleDirection[];
    details?: DetailOption[];
    always?: boolean;
  };
  /** Only relevant when this returns true (e.g. bridal palette notes need a bridal brief or an accent). */
  when?: (brief: InterpretedBrief) => boolean;
}

export interface WajieContext {
  guidelines: WajieGuideline[];
}

export interface DesignConcept {
  title: string;
  variationLabel: string;
  summary: string;
  specification: DesignSpecification;
  designNotes: string[];
  /** Construction choices, so a later modification can keep what the customer didn't change. */
  variant: DesignVariant;
  render: RenderParams;
}

export interface GenerationPrompt {
  text: string;
  negative: string;
  seed: number;
  aspectRatio: "2:3";
  /** Structured hints — the mock renderer draws from these; FLUX ignores them. */
  render: RenderParams;
}

export interface GeneratedImage {
  imageUrl: string;
  model: string;
  seed: number;
}

/** GPT-6 Luna (request interpretation + structured specification). */
export interface DesignInterpreter {
  interpretDesignRequest(request: DesignRequestPayload): Promise<InterpretedBrief>;
  buildDesignSpecification(
    brief: InterpretedBrief,
    context: WajieContext,
    options: {
      /** 0 for the first concept; advanced by regenerations to explore new variations. */
      variantIndex: number;
      /** For a modification: the concept being edited, whose construction is kept where possible. */
      base?: DesignVariant;
    },
  ): Promise<DesignConcept>;
}

/** Wajie RAG pipeline (brand knowledge + design constraints). */
export interface BrandKnowledgeRetriever {
  retrieveWajieContext(brief: InterpretedBrief): Promise<WajieContext>;
}

/** FLUX (fashion concept image generation). */
export interface ImageGenerator {
  generateFashionConcept(prompt: GenerationPrompt): Promise<GeneratedImage>;
}

/** FASHN (virtual try-on): garment image + customer photo → try-on image. */
export interface TryOnGenerator {
  generateVirtualTryOn(input: {
    designImageUrl: string;
    /** Production: signed Supabase Storage URL of the customer photo. Mock: not sent. */
    customerPhotoUrl?: string;
    seed: number;
  }): Promise<GeneratedImage>;
}

export interface AIServices {
  interpreter: DesignInterpreter;
  knowledge: BrandKnowledgeRetriever;
  imageGenerator: ImageGenerator;
  tryOnGenerator: TryOnGenerator;
}
