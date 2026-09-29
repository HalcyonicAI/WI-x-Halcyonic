import "server-only";
import type { DesignRequestPayload, DesignResult, DesignVariant, GenerationKind, TryOnResult } from "@/types/design";
import { createId } from "@/lib/utils";
import { getAIServices } from "./services";
import { buildGenerationPrompt } from "./prompt-builder";

/**
 * Server-side AI orchestration (adapter-agnostic — adapters come from ./services only):
 *   interpretDesignRequest → retrieveWajieContext → buildDesignSpecification
 *   → buildGenerationPrompt → generateFashionConcept
 *
 * Access checks (payment + quota) happen BEFORE this is called — see the API routes.
 */
export async function runDesignPipeline(input: {
  request: DesignRequestPayload;
  kind: GenerationKind;
  /** 1-based index of this generation within the booking. */
  version: number;
  /** For modifications: the concept being edited (its construction is kept where possible). */
  base?: DesignVariant;
}): Promise<DesignResult> {
  const ai = getAIServices();

  const brief = await ai.interpreter.interpretDesignRequest(input.request);
  const context = await ai.knowledge.retrieveWajieContext(brief);
  const concept = await ai.interpreter.buildDesignSpecification(brief, context, {
    variantIndex: input.version - 1,
    base: input.kind === "modification" ? input.base : undefined,
  });
  const prompt = buildGenerationPrompt(concept, brief, context);
  const image = await ai.imageGenerator.generateFashionConcept(prompt);

  return {
    id: createId("gen"),
    version: input.version,
    kind: input.kind,
    createdAt: new Date().toISOString(),
    title: concept.title,
    variationLabel: concept.variationLabel,
    summary: concept.summary,
    specification: concept.specification,
    designNotes: concept.designNotes,
    imageUrl: image.imageUrl,
    prompt: prompt.text,
    model: image.model,
    seed: image.seed,
    request: input.request,
    variant: concept.variant,
  };
}

/** Virtual try-on of an existing concept: one call to the try-on adapter. */
export async function runTryOnPipeline(input: {
  design: Pick<DesignResult, "id" | "version" | "imageUrl" | "seed">;
}): Promise<Omit<TryOnResult, "customerPhoto">> {
  const ai = getAIServices();
  const image = await ai.tryOnGenerator.generateVirtualTryOn({
    designImageUrl: input.design.imageUrl,
    seed: input.design.seed,
  });
  return {
    id: createId("try"),
    createdAt: new Date().toISOString(),
    designResultId: input.design.id,
    designVersion: input.design.version,
    imageUrl: image.imageUrl,
    model: image.model,
  };
}
