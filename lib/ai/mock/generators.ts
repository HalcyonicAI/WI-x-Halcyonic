import { sleep } from "@/lib/utils";
import type { ImageGenerator, TryOnGenerator } from "../types";
import { renderParamsFromUrl, renderUrl } from "../render/params";

/** Simulated vendor latency (the UI's staged progress runs longer, so this is never the bottleneck). */
function mockLatency(seed: number) {
  return sleep(800 + (seed % 700));
}

/**
 * MOCK of FLUX: returns a URL to the deterministic SVG concept renderer.
 * Production: POST prompt.text to FLUX, store the returned image in Supabase Storage,
 * return the storage URL.
 */
export const mockImageGenerator: ImageGenerator = {
  async generateFashionConcept(prompt) {
    await mockLatency(prompt.seed);
    return {
      imageUrl: renderUrl({ ...prompt.render, mode: "concept", seed: prompt.seed }),
      model: "mock-flux · placeholder for FLUX",
      seed: prompt.seed,
    };
  },
};

/**
 * MOCK of FASHN virtual try-on: re-renders the same concept on the "try-on" backdrop.
 * Production: send the garment image + customer photo (signed URLs) to FASHN.
 */
export const mockTryOnGenerator: TryOnGenerator = {
  async generateVirtualTryOn(input) {
    await mockLatency(input.seed + 211);
    const render = renderParamsFromUrl(input.designImageUrl);
    return {
      imageUrl: renderUrl({ ...render, mode: "tryon" }),
      model: "mock-fashn · placeholder for FASHN",
      seed: input.seed,
    };
  },
};
