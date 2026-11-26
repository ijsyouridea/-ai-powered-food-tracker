"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FoodItem } from "@/lib/types";

const emptyItem = (): FoodItem => ({
  name: "",
  quantity: null,
  unit: "g",
  quantityType: "measured",
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  fiber: null,
});

const badgeColor: Record<string, string> = {
  measured: "bg-green-100 text-green-700",
  estimated: "bg-yellow-100 text-yellow-700",
  unknown: "bg-red-100 text-red-700",
};

export default function AddMealPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [mealTime, setMealTime] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMealTime(now.toISOString().slice(0, 16));
  }, []);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }
      const data = await res.json();
      setItems(data.items);
      setAnalyzed(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeItem = async (index: number) => {
    const item = items[index];
    if (!item.name.trim()) return;
    setAnalyzing(true);
    setError("");
    try {
      const description = item.quantity
        ? `${item.quantity} ${item.unit} ${item.name}`
        : item.name;
      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }
      const data = await res.json();
      const analyzed = data.items[0];
      if (analyzed) {
        updateItem(index, "calories", analyzed.calories);
        updateItem(index, "protein", analyzed.protein);
        updateItem(index, "carbs", analyzed.carbs);
        updateItem(index, "fat", analyzed.fat);
        updateItem(index, "fiber", analyzed.fiber);
        if (!item.quantity) updateItem(index, "quantity", analyzed.quantity);
        if (item.unit === "g") updateItem(index, "unit", analyzed.unit);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateItem = (index: number, field: keyof FoodItem, value: string | number | null) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const numVal = (v: string) => (v === "" ? null : Number(v));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          mealTime: new Date(mealTime).toISOString(),
          items,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Meal</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meal time
        </label>
        <input
          type="datetime-local"
          value={mealTime}
          onChange={(e) => setMealTime(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Describe your meal
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 2 eggs, toast with butter, coffee with milk"
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !description.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {analyzing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Analyze with AI"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {analyzed && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Food Items</h2>
            <button
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add row
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <div className="space-y-3 min-w-[640px]">
              <div className="grid grid-cols-[1fr_60px_70px_60px_80px_70px_70px_70px_70px_70px_32px] gap-1 text-xs font-medium text-gray-500 px-1">
                <span>Name</span>
                <span />
                <span>Qty</span>
                <span>Unit</span>
                <span>Type</span>
                <span>Kcal</span>
                <span>Protein</span>
                <span>Carbs</span>
                <span>Fat</span>
                <span>Fiber</span>
                <span />
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_60px_70px_60px_80px_70px_70px_70px_70px_70px_32px] gap-1 items-center"
                >
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAnalyzeItem(i)}
                    disabled={analyzing || !item.name.trim()}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    title="Analyze nutrition for this item"
                  >
                    AI
                  </button>
                  <input
                    type="number"
                    value={item.quantity ?? ""}
                    onChange={(e) => updateItem(i, "quantity", numVal(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className={`text-xs text-center px-1 py-0.5 rounded-full ${badgeColor[item.quantityType]}`}>
                    {item.quantityType}
                  </span>
                  <input
                    type="number"
                    value={item.calories ?? ""}
                    onChange={(e) => updateItem(i, "calories", numVal(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.protein ?? ""}
                    onChange={(e) => updateItem(i, "protein", numVal(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.carbs ?? ""}
                    onChange={(e) => updateItem(i, "carbs", numVal(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.fat ?? ""}
                    onChange={(e) => updateItem(i, "fat", numVal(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.fiber ?? ""}
                    onChange={(e) => updateItem(i, "fiber", numVal(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 text-lg leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || items.length === 0}
              className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
