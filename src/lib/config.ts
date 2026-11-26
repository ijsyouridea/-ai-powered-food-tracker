import path from "path";

export const MODEL_PATH =
  process.env.MODEL_PATH ||
  path.resolve(process.cwd(), "../prototype/models/Llama-3.2-3B-Instruct-Q8_0.gguf");

export const DATA_DIR =
  process.env.DATA_DIR || path.join(process.cwd(), "data");

export const MEALS_FILE = path.join(DATA_DIR, "meals.json");
