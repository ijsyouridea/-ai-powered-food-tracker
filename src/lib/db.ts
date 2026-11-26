import fs from "fs/promises";
import path from "path";
import { DATA_DIR, MEALS_FILE } from "./config";
import { Meal } from "./types";

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(MEALS_FILE);
  } catch {
    await fs.writeFile(MEALS_FILE, "[]", "utf-8");
  }
}

async function readMeals(): Promise<Meal[]> {
  await ensureDataFile();
  const raw = await fs.readFile(MEALS_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeMeals(meals: Meal[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(MEALS_FILE, JSON.stringify(meals, null, 2), "utf-8");
}

export async function getAllMeals(): Promise<Meal[]> {
  return readMeals();
}

export async function getMealById(id: string): Promise<Meal | undefined> {
  const meals = await readMeals();
  return meals.find((m) => m.id === id);
}

export async function saveMeal(meal: Meal): Promise<Meal> {
  const meals = await readMeals();
  meals.push(meal);
  await writeMeals(meals);
  return meal;
}

export async function updateMeal(
  id: string,
  updates: Partial<Omit<Meal, "id">>
): Promise<Meal | null> {
  const meals = await readMeals();
  const idx = meals.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  meals[idx] = { ...meals[idx], ...updates, id };
  await writeMeals(meals);
  return meals[idx];
}

export async function deleteMeal(id: string): Promise<boolean> {
  const meals = await readMeals();
  const filtered = meals.filter((m) => m.id !== id);
  if (filtered.length === meals.length) return false;
  await writeMeals(filtered);
  return true;
}

export async function getMealsByDateRange(
  start: string,
  end: string
): Promise<Meal[]> {
  const meals = await readMeals();
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T23:59:59.999");
  return meals.filter((m) => {
    const d = new Date(m.mealTime);
    return d >= startDate && d <= endDate && m.confirmed;
  });
}

export async function getMealsForDate(date: string): Promise<Meal[]> {
  const meals = await readMeals();
  const start = new Date(date + "T00:00:00").getTime();
  const end = new Date(date + "T23:59:59.999").getTime();
  return meals.filter((m) => {
    const t = new Date(m.mealTime).getTime();
    return t >= start && t <= end && m.confirmed;
  });
}
