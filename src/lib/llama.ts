import { MODEL_PATH } from "./config";
import { FoodItem } from "./types";

interface FoodSuggestion {
  name: string;
  calories: number;
  purine_level: "low" | "medium" | "high";
  note: string;
}

let llamaInstance: any = null;
let modelInstance: any = null;

async function getModel() {
  if (modelInstance) return modelInstance;

  const { getLlama } = await import("node-llama-cpp");
  llamaInstance = await getLlama();
  modelInstance = await llamaInstance.loadModel({ modelPath: MODEL_PATH });
  return modelInstance;
}

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];

  return text.trim();
}

export async function analyzeMeal(description: string): Promise<FoodItem[]> {
  const { LlamaChatSession } = await import("node-llama-cpp");
  const model = await getModel();
  const context = await model.createContext();
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });

  const prompt = `You are a nutrition analysis assistant. The user describes a meal. Identify every food item, quantity, unit, and estimate nutritional values using your knowledge of common foods.

Return ONLY a valid JSON array. No explanation, no markdown, no text before or after the JSON.

Each object in the array must have exactly these fields:
- "name": string (normalized food name in English)
- "quantity": number ONLY (the amount as a number, no units; e.g. 100 not "100g")
- "unit": string (e.g. "g", "ml", "piece", "cup", "tbsp", "slice", "serving")
- "quantityType": "measured" if exact, "estimated" if guessing, "unknown" if completely unclear
- "calories": number (kcal; use standard reference values or reasonable estimate)
- "protein": number (grams; estimate based on food type)
- "carbs": number (grams; estimate based on food type)
- "fat": number (grams; estimate based on food type)
- "fiber": number (grams; estimate based on food type, 0 if none)

IMPORTANT: quantity must be a number with no letters or units attached.

Always provide numeric estimates using your knowledge of food composition. Use reasonable defaults: carbs for bread/pasta, protein for meat/eggs, fat for fried foods, etc.

User meal description: "${description}"

JSON array:`;

  try {
    const response = await session.prompt(prompt);
    const jsonStr = extractJson(response);
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    return parsed.map((item: Record<string, unknown>) => {
      const numOrNull = (v: unknown) => {
        let n: number | null = null;
        if (typeof v === "number") {
          n = v;
        } else if (typeof v === "string") {
          const stripped = v.replace(/[^\d.]/g, "");
          n = stripped ? Number(stripped) : null;
        }
        return n !== null && !isNaN(n) ? n : null;
      };
      return {
        name: String(item.name || "Unknown item"),
        quantity: numOrNull(item.quantity),
        unit: String(item.unit || "serving"),
        quantityType: (["measured", "estimated", "unknown"].includes(item.quantityType as string)
          ? item.quantityType
          : "unknown") as FoodItem["quantityType"],
        calories: numOrNull(item.calories),
        protein: numOrNull(item.protein),
        carbs: numOrNull(item.carbs),
        fat: numOrNull(item.fat),
        fiber: numOrNull(item.fiber),
      };
    });
  } finally {
    session.dispose();
    context.dispose();
  }
}

export async function suggestFoods(
  remainingCalories: number,
  dietType: string
): Promise<FoodSuggestion[]> {
  const { LlamaChatSession } = await import("node-llama-cpp");
  const model = await getModel();
  const context = await model.createContext();
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });

  const prompt = `You are a nutrition advisor helping someone stay within their daily calorie budget while following a ${dietType} diet.

The user has ${remainingCalories} calories remaining today. Suggest 3-5 specific food items or meals that:
1. Fit within the remaining calorie budget
2. Are appropriate for a ${dietType} diet
3. Are practical to eat now

For each suggestion, provide:
- Food name and portion
- Estimated calories
- Purine level (low/medium/high) - relevant for low_purine diets
- Brief note (why it's good or any warnings)

Return ONLY valid JSON array. No explanation, no markdown, no text before or after.

Each object must have exactly these fields:
- "name": string (e.g. "grilled chicken 150g")
- "calories": number (estimated kcal)
- "purine_level": "low" or "medium" or "high"
- "note": string (brief reason or note)

JSON array:`;

  try {
    const response = await session.prompt(prompt);
    const jsonStr = extractJson(response);
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    return parsed.map((item: Record<string, unknown>) => ({
      name: String(item.name || "Unknown food"),
      calories: typeof item.calories === "number" ? item.calories : 0,
      purine_level: (["low", "medium", "high"].includes(item.purine_level as string)
        ? item.purine_level
        : "medium") as FoodSuggestion["purine_level"],
      note: String(item.note || ""),
    }));
  } finally {
    session.dispose();
    context.dispose();
  }
}

