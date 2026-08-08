import { NextResponse } from "next/server";
import { saveDocument } from "@/lib/firebase/firestore";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await saveDocument("onboarding", "priya-demo", {
    ...body,
    updatedAt: new Date().toISOString()
  });
  return NextResponse.json(result);
}
