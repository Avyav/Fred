import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_V1 } from "./system-prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The Anthropic API supports cache_control on system blocks at runtime,
// but the SDK types in v0.30 don't fully expose it. Use type assertion.
interface CachedTextBlock {
  type: "text";
  text: string;
  cache_control: { type: "ephemeral" };
}

export async function createCachedMessage(
  messages: { role: string; content: string }[],
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
) {
  const { maxTokens = 300, temperature = 0.7 } = options;

  const systemBlock: CachedTextBlock = {
    type: "text",
    text: SYSTEM_PROMPT_V1,
    cache_control: { type: "ephemeral" },
  };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    temperature,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    system: [systemBlock] as any,
    messages: messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  });

  // Development logging for cache monitoring
  if (process.env.NODE_ENV === "development") {
    const u = response.usage as unknown as Record<string, number>;
    const cacheRead = u.cache_read_input_tokens || 0;
    const cacheCreation = u.cache_creation_input_tokens || 0;
    console.log(
      `[AI] Tokens — input: ${u.input_tokens}, output: ${u.output_tokens}, cache_read: ${cacheRead}, cache_creation: ${cacheCreation}`
    );
    if (cacheRead > 0) {
      console.log("[AI] Cache HIT — system prompt served from cache");
    } else if (cacheCreation > 0) {
      console.log("[AI] Cache MISS — system prompt cached for next request");
    }
  }

  return response;
}

export function extractUsage(response: Anthropic.Message) {
  const u = response.usage as unknown as Record<string, number>;
  return {
    inputTokens: u.input_tokens || 0,
    outputTokens: u.output_tokens || 0,
    cacheCreationTokens: u.cache_creation_input_tokens || 0,
    cacheReadTokens: u.cache_read_input_tokens || 0,
  };
}
