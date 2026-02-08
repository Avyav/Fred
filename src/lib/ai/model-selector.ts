export type ModelChoice = "sonnet";

/**
 * Always returns 'sonnet' — this app uses Claude Sonnet 4.5 exclusively.
 * Kept as a function for future flexibility if model routing is re-enabled.
 */
export function selectModel(
  _userMessage: string,
  _conversationLength: number
): ModelChoice {
  return "sonnet";
}

export function getModelString(_choice: ModelChoice): string {
  return "claude-sonnet-4-5-20250929";
}
