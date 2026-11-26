import { NextRequest, NextResponse } from "next/server";
import { getAllMeals, getMealsByDateRange, getMealsForDate, saveMeal } from "@/lib/db";
import { Meal, FoodItem } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const date = searchParams.get("date");
    if (date) {
      const meals = await getMealsForDate(date);
      return NextResponse.json({ meals });
    }

    if (start && end) {
      const meals = await getMealsByDateRange(start, end);
      return NextResponse.json({ meals });
    }

    const meals = await getAllMeals();
    return NextResponse.json({ meals });
  } catch (error) {
    console.error("GET /api/meals error:", error);
    return NextResponse.json({ error: "Failed to fetch meals." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, items, mealTime } = body;

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "'description' is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "'items' must be a non-empty array." },
        { status: 400 }
      );
    }

    const meal: Meal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      mealTime: mealTime || new Date().toISOString(),
      description,
      items: items as FoodItem[],
      confirmed: true,
    };

    const saved = await saveMeal(meal);
    return NextResponse.json({ meal: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/meals error:", error);
    return NextResponse.json({ error: "Failed to save meal." }, { status: 500 });
  }
}
