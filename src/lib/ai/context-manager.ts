import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db/prisma";

const MAX_MESSAGES_IN_CONTEXT = 10;
const SUMMARIZATION_THRESHOLD = 20;

export async function buildOptimizedContext(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messageCount = conversation.messages.length;

  // If under threshold, return all messages
  if (messageCount <= MAX_MESSAGES_IN_CONTEXT) {
    return conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // Return last N messages + summary of older messages
  const recentMessages = conversation.messages.slice(
    -MAX_MESSAGES_IN_CONTEXT
  );

  const contextMessages: { role: string; content: string }[] = [];

  // Add summary of old messages if exists
  if (conversation.summaryText) {
    contextMessages.push({
      role: "user",
      content: `[Previous conversation summary: ${conversation.summaryText}]`,
    });
    // Need a paired assistant message for valid alternation
    contextMessages.push({
      role: "assistant",
      content:
        "I understand. Thank you for the context. I'll keep our previous conversation in mind as we continue.",
    });
  }

  // Add recent messages
  contextMessages.push(
    ...recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  );

  // Check if we need to create a new summary
  if (
    messageCount > SUMMARIZATION_THRESHOLD &&
    (!conversation.lastSummaryAt ||
      messageCount - SUMMARIZATION_THRESHOLD > MAX_MESSAGES_IN_CONTEXT)
  ) {
    // Trigger background summarization (don't await)
    summarizeOldMessages(conversationId).catch((err) => {
      console.error("[Context] Background summarization failed:", err);
    });
  }

  return contextMessages;
}

async function summarizeOldMessages(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) return;

  // Get messages to summarize (everything except the last 10)
  const messagesToSummarize = conversation.messages.slice(
    0,
    -MAX_MESSAGES_IN_CONTEXT
  );

  if (messagesToSummarize.length === 0) return;

  const transcript = messagesToSummarize
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Use Sonnet for summarization as well (user preference: Sonnet only)
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Summarize the key themes, emotions, and topics from this mental health support conversation in 2-3 sentences. Focus on what the person is going through and any coping strategies discussed. Do not include any personally identifying information.\n\n${transcript}`,
        },
      ],
    });

    const summary =
      response.content[0].type === "text" ? response.content[0].text : "";

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        summaryText: summary,
        lastSummaryAt: new Date(),
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Context] Summarized ${messagesToSummarize.length} messages for conversation ${conversationId}`
      );
    }
  } catch (err) {
    console.error("[Context] Summarization API call failed:", err);
  }
}
