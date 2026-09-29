/**
 * Design-domain types shared by the UI, the mock services and (later) the
 * real GPT / RAG / FLUX / FASHN adapters.
 */

export type GarmentType = "baju-kurung" | "kebaya" | "dress-gown" | "jubah" | "other";

export type Occasion =
  | "wedding"
  | "engagement"
  | "raya"
  | "formal"
  | "dinner"
  | "everyday"
  | "other";

export type StyleDirection =
  | "modern"
  | "traditional"
  | "minimalist"
  | "elegant"
  | "romantic"
  | "statement"
  | "contemporary";

export type Fabric = "chiffon" | "satin" | "silk" | "lace" | "songket" | "organza" | "no-preference";

export type Fit = "relaxed" | "regular" | "fitted";

export type DetailOption =
  | "embroidery"
  | "beading"
  | "lace"
  | "sequins"
  | "pleats"
  | "draping"
  | "minimal";

/** A customer reference image. In the mock the image stays on-device as a downscaled data URL. */
export interface ReferenceImage {
  id: string;
  name: string;
  /** Downscaled data URL (mock). Production: Supabase Storage object URL. */
  dataUrl: string;
}

/** What the customer submits from the design form. */
export interface DesignRequest {
  garmentType: GarmentType;
  garmentOther?: string;
  occasion: Occasion;
  occasionOther?: string;
  /** Colour id from the catalog (see lib/catalog/options.ts). */
  primaryColour: string;
  /** Optional accent colour id. */
  secondaryColour?: string;
  style: StyleDirection[];
  fabric: Fabric;
  fit: Fit;
  details: DetailOption[];
  referenceImages: ReferenceImage[];
  additionalRequest: string;
}

/** Form state while the customer is still filling it in. */
export type DesignDraft = Partial<Omit<DesignRequest, "style" | "details" | "referenceImages">> & {
  style: StyleDirection[];
  details: DetailOption[];
  referenceImages: ReferenceImage[];
};

/**
 * The request as sent to the AI service. Reference image pixels are NOT sent in the
 * mock — only their count. Production would send Supabase Storage URLs instead.
 */
export type DesignRequestPayload = Omit<DesignRequest, "referenceImages"> & {
  referenceImageCount: number;
};

/** Structured fashion design specification (the output of GPT + Wajie RAG). */
export interface DesignSpecification {
  garment: string;
  silhouette: string;
  neckline: string;
  sleeves: string;
  length: string;
  fabric: string;
  colour: string;
  details: string;
  placement: string;
  finishing: string;
  occasion: string;
  style: string;
}

export type GenerationKind = "initial" | "modification" | "regeneration";

/** The construction choices behind a concept (kept when the customer modifies other details). */
export interface DesignVariant {
  garment: string;
  fit: Fit;
  neckline: string;
  sleeve: string;
  skirt: string;
  seed: number;
}

/** One generated design concept. */
export interface DesignResult {
  id: string;
  /** 1-based position within the booking (Concept 1, 2, 3). */
  version: number;
  kind: GenerationKind;
  createdAt: string;
  title: string;
  /** Short line describing what makes this concept distinct (e.g. collar/sleeve variation). */
  variationLabel: string;
  summary: string;
  specification: DesignSpecification;
  /** Customer-friendly notes derived from the Wajie brand context. */
  designNotes: string[];
  imageUrl: string;
  /** Text prompt sent to the image model (staff/technical record only — never shown to customers). */
  prompt: string;
  model: string;
  seed: number;
  /** Snapshot of the request that produced this concept. */
  request: DesignRequestPayload;
  variant: DesignVariant;
  /**
   * The customer's reference images for this concept, attached on the device when the
   * result is stored (the API never receives them in the mock). Production: storage paths.
   */
  referenceImages?: ReferenceImage[];
}

export interface TryOnResult {
  id: string;
  createdAt: string;
  designResultId: string;
  designVersion: number;
  imageUrl: string;
  /** The customer photo, kept on-device in the mock. */
  customerPhoto: { name: string; dataUrl: string; isSample: boolean };
  model: string;
}
