export type ModelChoice = "sonnet";

/**
 * Always returns 'sonnet' — this app uses Claude Sonnet 4.5 exclusively.
 * Kept as a function for future flexibility if model routing is re-enabled.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function selectModel(userMessage: string, conversationLength: number): ModelChoice {
  return "sonnet";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getModelString(choice: ModelChoice): string {
  return "claude-sonnet-4-5-20250929";
}
