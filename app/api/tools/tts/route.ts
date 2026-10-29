import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient } from "@/lib/openai-config";

// Valid voices for OpenAI TTS
const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = typeof VALID_VOICES[number];

// Maximum text length (OpenAI limit is 4096 characters)
const MAX_TEXT_LENGTH = 4096;

export async function POST(request: NextRequest) {
  try {
    const openai = await createOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { success: false, error: "No AI provider configured. Go to Settings > LLM Configuration or set OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, voice = "alloy" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!VALID_VOICES.includes(voice as Voice)) {
      return NextResponse.json(
        { success: false, error: `Invalid voice. Valid options: ${VALID_VOICES.join(", ")}` },
        { status: 400 }
      );
    }

    // Call OpenAI TTS API
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as Voice,
      input: text,
      response_format: "mp3",
    });

    // Get the audio as a buffer
    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());

    // Return the audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Content-Disposition": 'attachment; filename="speech.mp3"',
      },
    });

  } catch (error: any) {
    console.error("TTS error:", error);

    if (error?.status === 401) {
      return NextResponse.json(
        { success: false, error: "Invalid OpenAI API key" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Text-to-speech conversion failed" },
      { status: 500 }
    );
  }
}
