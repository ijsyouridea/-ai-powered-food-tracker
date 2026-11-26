"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DailyNutrition } from "@/lib/types";
import { calculateTDEE, getRemainingCalories } from "@/lib/nutrition";

interface HistoryEntry {
  date: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodSuggestion {
  name: string;
  calories: number;
  purine_level: "low" | "medium" | "high";
  note: string;
}

export default function NutritionPage() {
  const [date, setDate] = useState("");
  const [daily, setDaily] = useState<DailyNutrition | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestingFoods, setSuggestingFoods] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);

  const tdee = calculateTDEE(37, 97, 186);
  const consumed = daily?.totalCalories ?? 0;
  const remaining = getRemainingCalories(consumed, tdee);

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const handleSuggestFoods = async () => {
    setSuggestingFoods(true);
    try {
      const res = await fetch("/api/meals/suggest-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remainingCalories: remaining, dietType: "low_purine" }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      }
    } finally {
      setSuggestingFoods(false);
    }
  };

  useEffect(() => {
    if (!date) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/nutrition/daily?date=${date}`);
        if (res.ok) setDaily(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  useEffect(() => {
    (async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      const days: HistoryEntry[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().slice(0, 10);
        days.push({
          date: ds,
          label: d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
      }

      try {
        const res = await fetch(`/api/meals?start=${startStr}&end=${endStr}`);
        if (res.ok) {
          const { meals } = await res.json();
          for (const meal of meals) {
            const mealDate = meal.mealTime.slice(0, 10);
            const entry = days.find((d) => d.date === mealDate);
            if (entry) {
              for (const item of meal.items) {
                entry.calories += item.calories ?? 0;
                entry.protein += item.protein ?? 0;
                entry.carbs += item.carbs ?? 0;
                entry.fat += item.fat ?? 0;
              }
            }
          }
        }
      } catch {}

      setHistory(days);
    })();
  }, []);

  const stats = daily
    ? [
        { label: "Consumed", value: daily.totalCalories, unit: "kcal", color: "text-blue-600" },
        { label: "Remaining", value: remaining, unit: "kcal", color: "text-blue-400" },
        { label: "Protein", value: daily.totalProtein, unit: "g", color: "text-green-600" },
        { label: "Carbs", value: daily.totalCarbs, unit: "g", color: "text-yellow-600" },
        { label: "Fat", value: daily.totalFat, unit: "g", color: "text-red-500" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nutrition</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Daily Summary</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : daily && daily.mealCount > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>
                  {Math.round(s.value)}
                </p>
                <p className="text-xs text-gray-400">{s.unit}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No meals recorded for this date</p>
        )}

        {daily && daily.mealCount > 0 && (
          <>
            <p className="text-xs text-gray-400 mt-3 text-center">
              {daily.mealCount} meal{daily.mealCount !== 1 ? "s" : ""} recorded
            </p>
            {remaining > 100 && (
              <button
                onClick={handleSuggestFoods}
                disabled={suggestingFoods}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {suggestingFoods ? "Getting suggestions..." : "What else can I eat?"}
              </button>
            )}
          </>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Food Suggestions</h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className={`border-l-4 p-3 rounded-sm ${
                  s.purine_level === "low"
                    ? "border-green-500 bg-green-50"
                    : s.purine_level === "medium"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{s.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{s.calories} kcal</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{s.purine_level} purine</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h2>
        {history.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={((value: unknown, name: unknown) => [
                    `${Math.round(Number(value))} ${String(name) === "calories" ? "kcal" : "g"}`,
                    String(name).charAt(0).toUpperCase() + String(name).slice(1),
                  ]) as never}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="calories" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="protein" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="carbs" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No data yet</p>
        )}
      </div>
    </div>
  );
}
