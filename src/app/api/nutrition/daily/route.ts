import { NextRequest, NextResponse } from "next/server";
import { getMealsForDate } from "@/lib/db";
import { DailyNutrition } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const meals = await getMealsForDate(date);

    const nutrition: DailyNutrition = {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      mealCount: meals.length,
    };

    for (const meal of meals) {
      for (const item of meal.items) {
        nutrition.totalCalories += item.calories ?? 0;
        nutrition.totalProtein += item.protein ?? 0;
        nutrition.totalCarbs += item.carbs ?? 0;
        nutrition.totalFat += item.fat ?? 0;
        nutrition.totalFiber += item.fiber ?? 0;
      }
    }

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("GET /api/nutrition/daily error:", error);
    return NextResponse.json(
      { error: "Failed to calculate daily nutrition." },
      { status: 500 }
    );
  }
}
