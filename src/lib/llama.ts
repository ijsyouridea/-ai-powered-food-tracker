import { MODEL_PATH } from "./config";
import { FoodItem } from "./types";

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
- "quantity": number (amount consumed; estimate if not stated)
- "unit": string (e.g. "g", "ml", "piece", "cup", "tbsp", "slice", "serving")
- "quantityType": "measured" if exact, "estimated" if guessing, "unknown" if completely unclear
- "calories": number (kcal; use standard reference values or reasonable estimate)
- "protein": number (grams; estimate based on food type)
- "carbs": number (grams; estimate based on food type)
- "fat": number (grams; estimate based on food type)
- "fiber": number (grams; estimate based on food type, 0 if none)

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
        const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : null;
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

