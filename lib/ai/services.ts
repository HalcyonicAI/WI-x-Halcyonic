import "server-only";
import type { AIServices } from "./types";
import { mockInterpreter } from "./mock/interpreter";
import { mockKnowledge } from "./mock/knowledge";
import { mockImageGenerator, mockTryOnGenerator } from "./mock/generators";

/**
 * The ONE place that decides which AI adapters are live.
 *
 * v0.1 (approval build): everything is mocked — no API keys required.
 * Later: implement `./live/*` adapters (GPT-6 Luna, Wajie RAG, FLUX, FASHN) and select
 * them here, e.g. `if (process.env.AI_PROVIDER === "live") return liveServices`.
 * API keys must only ever be read on the server (this module is server-only).
 */
const mockServices: AIServices = {
  interpreter: mockInterpreter,
  knowledge: mockKnowledge,
  imageGenerator: mockImageGenerator,
  tryOnGenerator: mockTryOnGenerator,
};

export function getAIServices(): AIServices {
  return mockServices;
}
