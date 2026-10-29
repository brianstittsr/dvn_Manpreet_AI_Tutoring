import { NextRequest, NextResponse } from "next/server";
import { getLLMRuntime } from "@/lib/llm-runtime";

interface CourseGenerateRequest {
  systemPrompt: string;
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CourseGenerateRequest = await request.json();
    const { systemPrompt, userPrompt } = body;

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { success: false, error: "System prompt and user prompt are required" },
        { status: 400 }
      );
    }

    const runtime = await getLLMRuntime();
    if (!runtime.client || !runtime.model) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No AI provider configured. Go to Settings > LLM Configuration or set OPENAI_API_KEY.",
        },
        { status: 500 }
      );
    }

    const completion = await runtime.client.chat.completions.create({
      model: runtime.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty model response");
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("AI Course Generate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
