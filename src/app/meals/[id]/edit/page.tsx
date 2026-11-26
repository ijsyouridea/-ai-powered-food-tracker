"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FoodItem, Meal } from "@/lib/types";
import { FoodItemsGrid, emptyItem } from "@/app/components/FoodItemsGrid";

export default function EditMealPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <EditMealPage />
    </Suspense>
  );
}

function EditMealPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [mealTime, setMealTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nutritionBaseQty, setNutritionBaseQty] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/meals/${params.id}`);
        if (!res.ok) throw new Error("Meal not found");
        const data: Meal = (await res.json()).meal;
        setMeal(data);
        setItems(data.items || []);
        setDescription(data.description);
        const dt = new Date(data.mealTime);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        setMealTime(dt.toISOString().slice(0, 16));
      } catch {
        setError("Could not load meal");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const updateItem = (
    index: number,
    field: keyof FoodItem,
    value: string | number | null,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleQuantityChange = (index: number, newQtyStr: string) => {
    const newQty = newQtyStr === "" ? null : Number(newQtyStr);
    if (newQty && newQty > 0) {
      const baseQty = nutritionBaseQty[index] ?? 100;
      const scaleFactor = newQty / baseQty;
      const scale = (val: number | null) =>
        val ? Math.round(val * scaleFactor * 10) / 10 : null;
      setItems((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;
          return {
            ...item,
            quantity: newQty,
            calories: scale(item.calories),
            protein: scale(item.protein),
            carbs: scale(item.carbs),
            fat: scale(item.fat),
            fiber: scale(item.fiber),
          };
        }),
      );
      setNutritionBaseQty((prev) => ({ ...prev, [index]: newQty }));
    } else {
      updateItem(index, "quantity", newQty);
    }
  };

  const handleAnalyzeItem = async (index: number) => {
    const item = items[index];
    if (!item.name.trim()) return;
    setSaving(true);
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
      const analyzedItem = data.items[0];
      if (analyzedItem) {
        updateItem(index, "calories", analyzedItem.calories);
        updateItem(index, "protein", analyzedItem.protein);
        updateItem(index, "carbs", analyzedItem.carbs);
        updateItem(index, "fat", analyzedItem.fat);
        updateItem(index, "fiber", analyzedItem.fiber);
        if (!item.quantity)
          updateItem(index, "quantity", analyzedItem.quantity);
        if (item.unit === "g") updateItem(index, "unit", analyzedItem.unit);
        setNutritionBaseQty((prev) => ({ ...prev, [index]: 100 }));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/meals/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          mealTime: new Date(mealTime).toISOString(),
          items,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-2">{error || "Meal not found"}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Diary
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Meal</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meal time
        </label>
        <input
          type="datetime-local"
          value={mealTime}
          onChange={(e) => setMealTime(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      <FoodItemsGrid
        items={items}
        loading={saving}
        onUpdateItem={updateItem}
        onAnalyzeItem={handleAnalyzeItem}
        onAddRow={() => setItems((prev) => [...prev, emptyItem()])}
        onDeleteRow={(i) => setItems((prev) => prev.filter((_, j) => j !== i))}
        onQuantityChange={handleQuantityChange}
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || items.length === 0}
          className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <Link
          href="/"
          className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
