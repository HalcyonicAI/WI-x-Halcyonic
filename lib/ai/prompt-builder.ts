import type { DesignConcept, GenerationPrompt, InterpretedBrief, WajieContext } from "./types";

/**
 * Prompt builder — turns the structured specification into an image-model prompt.
 * This is NOT a mock: the same builder will feed the real FLUX adapter.
 */
export function buildGenerationPrompt(
  concept: DesignConcept,
  brief: InterpretedBrief,
  context: WajieContext,
): GenerationPrompt {
  const s = concept.specification;
  const palette = [
    `${brief.primary.name} (${brief.primary.hex})`,
    brief.accent ? `${brief.accent.name} (${brief.accent.hex})` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const text = [
    "Full-length fashion design concept illustration, front view, single figure on a warm neutral studio background.",
    `Garment: ${s.silhouette}. ${s.length}.`,
    `Neckline: ${s.neckline}. Sleeves: ${s.sleeves}.`,
    `Fabric: ${s.fabric}. Colour palette: ${palette}.`,
    `Details: ${s.details}; placement: ${s.placement}.`,
    `Occasion: ${s.occasion}. Style: ${s.style}.`,
    "Modest Malaysian couture in the Wajie Ibrahim house style.",
    `House guidance: ${context.guidelines.map((g) => g.guidance).join(" ")}`,
    brief.notes ? `Customer note: "${brief.notes}".` : "",
    "Soft diffused light, refined editorial fashion illustration, high detail on fabric texture.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    text,
    negative: "text, logos, watermark, revealing cut, short hemline, distorted hands, extra limbs, busy background",
    seed: concept.render.seed,
    aspectRatio: "2:3",
    render: concept.render,
  };
}
