"use client";

import { FoodItem } from "@/lib/types";

const badgeColor: Record<string, string> = {
  measured: "bg-green-100 text-green-700",
  estimated: "bg-yellow-100 text-yellow-700",
  unknown: "bg-red-100 text-red-700",
};

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

const numVal = (v: string) => (v === "" ? null : Number(v));

interface FoodItemsGridProps {
  items: FoodItem[];
  loading?: boolean;
  onUpdateItem: (index: number, field: keyof FoodItem, value: string | number | null) => void;
  onAnalyzeItem: (index: number) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onQuantityChange: (index: number, qty: string) => void;
}

export function FoodItemsGrid({
  items,
  loading = false,
  onUpdateItem,
  onAnalyzeItem,
  onAddRow,
  onDeleteRow,
  onQuantityChange,
}: FoodItemsGridProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Food Items</h2>
        <button
          onClick={onAddRow}
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
            <div key={i} className="space-y-1">
              <div className="grid grid-cols-[1fr_60px_70px_60px_80px_70px_70px_70px_70px_70px_32px] gap-1 items-center">
                <input
                  value={item.name}
                  onChange={(e) => onUpdateItem(i, "name", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => onAnalyzeItem(i)}
                  disabled={loading || !item.name.trim()}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  title="Analyze nutrition for this item"
                >
                  AI
                </button>
                <input
                  type="number"
                  value={item.quantity ?? ""}
                  onChange={(e) => onQuantityChange(i, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  value={item.unit}
                  onChange={(e) => onUpdateItem(i, "unit", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span
                  className={`text-xs text-center px-1 py-0.5 rounded-full ${badgeColor[item.quantityType]}`}
                >
                  {item.quantityType}
                </span>
                <input
                  type="number"
                  value={item.calories ?? ""}
                  onChange={(e) => onUpdateItem(i, "calories", numVal(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.protein ?? ""}
                  onChange={(e) => onUpdateItem(i, "protein", numVal(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.carbs ?? ""}
                  onChange={(e) => onUpdateItem(i, "carbs", numVal(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.fat ?? ""}
                  onChange={(e) => onUpdateItem(i, "fat", numVal(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.fiber ?? ""}
                  onChange={(e) => onUpdateItem(i, "fiber", numVal(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => onDeleteRow(i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { emptyItem };
