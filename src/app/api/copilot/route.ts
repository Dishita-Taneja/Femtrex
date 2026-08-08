import { NextResponse } from "next/server";
import { completeChat } from "@/lib/ai/chatCompletion";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message : "";

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const answer = await completeChat(message);
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "Unable to complete request" }, { status: 500 });
  }
}
