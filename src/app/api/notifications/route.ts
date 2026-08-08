import { NextResponse } from "next/server";
import { notifications } from "@/shared/constants/demo-data";

export async function GET() {
  return NextResponse.json({ notifications });
}
