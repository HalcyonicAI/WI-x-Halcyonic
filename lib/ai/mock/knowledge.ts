import type { BrandKnowledgeRetriever, InterpretedBrief, WajieGuideline } from "../types";
import { WAJIE_GUIDELINES } from "./wajie-knowledge";

/**
 * MOCK of the Wajie RAG retriever: tag-overlap scoring over a small placeholder corpus.
 * Production: embed the brief, query the Wajie vector index, re-rank, return passages.
 */

function score(g: WajieGuideline, brief: InterpretedBrief): number {
  if (g.when && !g.when(brief)) return 0;
  const t = g.tags;
  let s = t.always ? 0.5 : 0;
  if (t.garments?.includes(brief.garment)) s += 3;
  if (t.occasions?.includes(brief.request.occasion)) s += 2;
  if (t.fabrics?.includes(brief.fabric)) s += 2;
  if (t.details?.some((d) => brief.details.includes(d))) s += 2;
  if (t.styles?.some((st) => brief.styles.includes(st))) s += 1.5;
  return s;
}

export const mockKnowledge: BrandKnowledgeRetriever = {
  async retrieveWajieContext(brief) {
    const ranked = WAJIE_GUIDELINES.map((g) => ({ g, s: score(g, brief) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map((x) => x.g);
    return { guidelines: ranked };
  },
};
