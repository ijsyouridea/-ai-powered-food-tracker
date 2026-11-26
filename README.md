# Personal AI Nutrition Tracker

A web app for tracking meals using natural language. Enter what you ate in plain text, and a local Llama 3.2 3B model identifies food items, quantities, and nutrition values. Review, edit, and confirm before saving.

## Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router, TypeScript)
- **AI**: Llama 3.2 3B via node-llama-cpp (runs locally, no external APIs)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Storage**: Local JSON file (`data/meals.json`)

## Prerequisites

- Node.js 20+
- The Llama model file at `../prototype/models/Llama-3.2-3B-Instruct-Q8_0.gguf` (relative to project root)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To use a model at a different path, set the `MODEL_PATH` environment variable:

```bash
MODEL_PATH=/path/to/model.gguf npm run dev
```

## Pages

| Route | Description |
|---|---|
| `/` | Food diary — browse meals by date, edit or delete entries |
| `/add` | Add a meal — type a description, AI analyzes it, review and confirm |
| `/meals/[id]/edit` | Edit an existing meal's items and nutrition |
| `/nutrition` | Daily nutrition summary and 7-day history chart |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/meals/analyze` | Send text to Llama, get structured food items back |
| `POST` | `/api/meals/suggest-foods` | Suggest foods based on remaining calories and diet type |
| `POST` | `/api/meals` | Save a confirmed meal |
| `GET` | `/api/meals?date=YYYY-MM-DD` | Get meals for a date (or use `start`/`end` for a range) |
| `GET` | `/api/meals/:id` | Get a single meal |
| `PUT` | `/api/meals/:id` | Update a meal |
| `DELETE` | `/api/meals/:id` | Delete a meal |
| `GET` | `/api/nutrition/daily?date=YYYY-MM-DD` | Get aggregated nutrition totals for a date |

## How It Works

1. You type a meal description (e.g. "2 eggs, toast with butter, coffee with milk")
2. The backend sends it to the local Llama model
3. The model returns structured JSON with food items, quantities, and nutrition estimates
4. You review and edit the results — fix names, quantities, add missing nutrition values
5. Confirm to save. Nothing is saved until you confirm.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `MODEL_PATH` | `../prototype/models/Llama-3.2-3B-Instruct-Q8_0.gguf` | Path to the GGUF model file |
| `DATA_DIR` | `./data` | Directory for the JSON data file |

## Known Issues

- **First request is slow**: The Llama model takes 10-30 seconds to load into memory on the first `/api/meals/analyze` call. Subsequent calls are fast.
- **Model accuracy**: Llama 3.2 3B is a small model. It may misidentify foods, return incomplete nutrition data, or produce malformed JSON. Always review the AI output before confirming.
- **No authentication**: The app has no user accounts or access control. It's designed for single-user local use.
- **JSON file storage**: Data is stored in a flat JSON file. This works for personal use but won't scale to large datasets or concurrent writes.
- **Nutrition values may be null**: If the model isn't confident about a nutrition value, it returns null rather than guessing. Fill in values manually if needed.
- **Recharts tooltip types**: A type cast (`as never`) is used on the Recharts tooltip formatter due to a strict generic mismatch in the library's types. No runtime impact.
