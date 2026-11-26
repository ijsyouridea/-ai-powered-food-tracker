import { NextRequest, NextResponse } from "next/server";
import { suggestFoods } from "@/lib/llama";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { remainingCalories, dietType } = body;

    if (remainingCalories === undefined || !dietType) {
      return NextResponse.json(
        { error: "remainingCalories and dietType are required" },
        { status: 400 }
      );
    }

    const suggestions = await suggestFoods(remainingCalories, dietType);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggest foods error:", error);
    return NextResponse.json(
      { error: "Failed to suggest foods. The AI model may be unavailable." },
      { status: 500 }
    );
  }
}
