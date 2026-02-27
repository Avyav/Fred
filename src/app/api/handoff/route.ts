import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import Anthropic from "@anthropic-ai/sdk";

const SUMMARIZATION_PROMPT = `Generate a structured handoff summary for a mental health professional.
The following is a transcript from one or more conversations between a user and FRED (an AI mental health support companion).

Format your response as valid JSON with these sections:
- patientContext: 1-2 sentences about the person's situation
- keyThemes: array of main topics discussed (e.g., "work stress", "sleep issues")
- emotionalJourney: brief narrative of how their emotional state evolved
- copingStrategies: array of objects with "strategy" and "helpful" (boolean or null if unknown) fields
- riskFactors: any concerns noted (crisis moments, recurring negative patterns) as an array of strings
- recommendations: what might be helpful for a professional to explore further, as an array of strings
- conversationDates: date range covered as a string

Respond ONLY with the JSON object, no markdown fences or extra text.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationIds } = body;

    if (
      !conversationIds ||
      !Array.isArray(conversationIds) ||
      conversationIds.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one conversation ID is required" },
        { status: 400 }
      );
    }

    // Fetch all conversations and verify ownership
    const conversations = await prisma.conversation.findMany({
      where: {
        id: { in: conversationIds },
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { role: true, content: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (conversations.length === 0) {
      return NextResponse.json(
        { error: "No conversations found" },
        { status: 404 }
      );
    }

    // Build transcript
    const transcriptParts: string[] = [];
    for (const convo of conversations) {
      const date = new Date(convo.createdAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      transcriptParts.push(`\n--- Conversation: ${convo.title || "Untitled"} (${date}) ---`);
      for (const msg of convo.messages) {
        const role = msg.role === "user" ? "User" : "FRED";
        transcriptParts.push(`${role}: ${msg.content}`);
      }
    }

    const transcript = transcriptParts.join("\n");

    // Call Claude for summarization
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({ apiKey, timeout: 60_000 });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      temperature: 0.3,
      system: SUMMARIZATION_PROMPT,
      messages: [{ role: "user", content: transcript }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let summary;
    try {
      summary = JSON.parse(text);
    } catch {
      // If JSON parsing fails, wrap in a basic structure
      summary = {
        patientContext: text,
        keyThemes: [],
        emotionalJourney: "",
        copingStrategies: [],
        riskFactors: [],
        recommendations: [],
        conversationDates: "",
      };
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[Handoff API]", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
