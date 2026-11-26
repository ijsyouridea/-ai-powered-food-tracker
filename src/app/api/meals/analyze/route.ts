import { NextRequest, NextResponse } from "next/server";
import { analyzeMeal } from "@/lib/llama";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "A non-empty 'description' string is required." },
        { status: 400 }
      );
    }

    const items = await analyzeMeal(description.trim());
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze meal. The AI model may be unavailable." },
      { status: 500 }
    );
  }
}
