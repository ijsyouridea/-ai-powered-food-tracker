import { NextRequest, NextResponse } from "next/server";
import { getMealById, updateMeal, deleteMeal } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meal = await getMealById(id);
    if (!meal) {
      return NextResponse.json({ error: "Meal not found." }, { status: 404 });
    }
    return NextResponse.json({ meal });
  } catch (error) {
    console.error("GET /api/meals/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch meal." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, mealTime, items } = body;
    const updated = await updateMeal(id, { description, mealTime, items });
    if (!updated) {
      return NextResponse.json({ error: "Meal not found." }, { status: 404 });
    }
    return NextResponse.json({ meal: updated });
  } catch (error) {
    console.error("PUT /api/meals/[id] error:", error);
    return NextResponse.json({ error: "Failed to update meal." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteMeal(id);
    if (!deleted) {
      return NextResponse.json({ error: "Meal not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/meals/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete meal." }, { status: 500 });
  }
}
