export interface FoodItem {
  name: string;
  quantity: number | null;
  unit: string;
  quantityType: "measured" | "estimated" | "unknown";
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
}

export interface Meal {
  id: string;
  createdAt: string;
  mealTime: string;
  description: string;
  items: FoodItem[];
  confirmed: boolean;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  mealCount: number;
}
