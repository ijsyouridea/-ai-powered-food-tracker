"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Meal } from "@/lib/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function mealCalories(meal: Meal) {
  return meal.items.reduce((sum, item) => sum + (item.calories ?? 0), 0);
}

export default function DiaryPage() {
  const [date, setDate] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?date=${date}`);
      if (res.ok) setMeals((await res.json()).meals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (date) fetchMeals(); }, [date]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this meal?")) return;
    const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
    if (res.ok) setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Food Diary</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">No meals recorded</p>
          <Link href="/add" className="text-blue-600 hover:underline font-medium">
            Add your first meal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">
                      {formatTime(meal.mealTime)}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {mealCalories(meal)} kcal
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 italic truncate">
                    &ldquo;{meal.description}&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.items.map((item, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                      >
                        {item.quantity != null ? `${item.quantity} ${item.unit} ` : ""}
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/meals/${meal.id}/edit`}
                    className="text-sm px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="text-sm px-3 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
