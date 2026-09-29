import { sleep } from "@/lib/utils";

/** Customer-facing progress copy (context.md §7 / handoff "Generation Experience"). */
export const DESIGN_STAGES = [
  "Understanding your request...",
  "Applying Wajie design direction...",
  "Building your fashion specification...",
  "Generating your design...",
] as const;

export const TRYON_STAGES = ["Preparing your photo...", "Fitting your design...", "Finishing your try-on preview..."] as const;

export const STAGE_MS = 1300;

/**
 * Runs `task` while stepping through presentation stages. Resolves only when the task
 * has finished AND every stage has been shown, so the experience feels considered.
 * Rejects as soon as the task fails.
 */
export async function runWithStages<T>(
  task: () => Promise<T>,
  stageCount: number,
  onStage: (index: number) => void,
  stageMs = STAGE_MS,
): Promise<T> {
  let index = 0;
  onStage(0);
  const timer = setInterval(() => {
    index = Math.min(index + 1, stageCount - 1);
    onStage(index);
  }, stageMs);
  try {
    const [result] = await Promise.all([task(), sleep(stageMs * stageCount)]);
    clearInterval(timer);
    onStage(stageCount);
    await sleep(450);
    return result;
  } finally {
    clearInterval(timer);
  }
}
