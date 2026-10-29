import { NextRequest, NextResponse } from "next/server";
import { sendSmsNotification } from "@/lib/sms-service";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuthenticatedActor, GPTLessonAuthError } from "@/lib/gpt-lesson-server";

interface SmsRequestBody {
  to: string | string[];
  body: string;
}

/** POST /api/notifications/sms - send an SMS notification */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "notifications-sms", limit: 10, windowMs: 60_000 });
  if (limited) return limited;
  try {
    await requireAuthenticatedActor(request);
    const body: SmsRequestBody = await request.json();

    if (!body.to || !body.body) {
      return NextResponse.json(
        { error: "to and body are required" },
        { status: 400 }
      );
    }

    const result = await sendSmsNotification({
      to: body.to,
      body: body.body,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[notifications/sms] error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
