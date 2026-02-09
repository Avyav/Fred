import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, messageContext } = await req.json();

    // Build context from conversation or provided text
    let context = messageContext || "";
    if (conversationId && !context) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { role: true, content: true },
      });
      context = messages
        .reverse()
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");
    }

    if (!context) {
      return NextResponse.json(
        { error: "Please provide conversation context" },
        { status: 400 }
      );
    }

    // Get all available resources for matching
    const allResources = await prisma.resource.findMany({
      where: { active: true },
      orderBy: { priority: "desc" },
    });

    const resourceSummary = allResources
      .map(
        (r) =>
          `[${r.id}] ${r.name} (${r.type}, ${r.region}) - Tags: ${r.tags.join(", ")} - ${r.description.substring(0, 100)}`
      )
      .join("\n");

    // Use Claude to match resources intelligently
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Based on this conversation context from a mental health support session, identify the most relevant support resources. Return ONLY a JSON object with "resourceIds" (array of up to 5 resource IDs) and "handoffMessage" (a brief, empathetic 1-2 sentence message introducing the resources).

Conversation:
${context.substring(0, 1500)}

Available resources:
${resourceSummary}

Return valid JSON only, no markdown.`,
        },
      ],
    });

    const aiText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: { resourceIds?: string[]; handoffMessage?: string };
    try {
      parsed = JSON.parse(aiText);
    } catch {
      // Fallback: return crisis resources
      const crisisResources = allResources
        .filter((r) => r.tags.includes("crisis"))
        .slice(0, 5);
      return NextResponse.json({
        resources: crisisResources,
        handoffMessage:
          "Here are some key support services that may be helpful for you.",
      });
    }

    const matchedResources = allResources.filter((r) =>
      (parsed.resourceIds || []).includes(r.id)
    );

    // If AI didn't match enough, add top crisis resources
    if (matchedResources.length < 2) {
      const crisisResources = allResources
        .filter(
          (r) =>
            r.tags.includes("crisis") &&
            !matchedResources.some((m) => m.id === r.id)
        )
        .slice(0, 3);
      matchedResources.push(...crisisResources);
    }

    return NextResponse.json({
      resources: matchedResources.slice(0, 5),
      handoffMessage:
        parsed.handoffMessage ||
        "Based on our conversation, these resources might be helpful for you.",
    });
  } catch (error) {
    console.error("Resource match error:", error);
    return NextResponse.json(
      { error: "Failed to match resources" },
      { status: 500 }
    );
  }
}
