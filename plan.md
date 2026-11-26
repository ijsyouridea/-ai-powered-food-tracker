Нижче — коротке технічне завдання англійською в стилі ASD-STE100: прості речення, конкретні дії та мінімум неоднозначностей. Його можна передати іншому coding agent.

# Project: Personal AI Nutrition Tracker

## 1. Goal

Build a web application for personal food tracking.

The user must enter food data by text.

Use the local Llama 3.2 3B model to process user input. (example in level up folder ../prototype, so do not copy model file, just reuse implemetatnion I' ve tested in server.js file)

Do not implement image recognition in the first version.

Use Next.js

## 2. Technology

- Frontend: Next.js
- Backend: Next.js
- Database: write to local json file for now.
- AI: Local Llama 3.2 3B.
- Charts: Recharts.
- UI: Responsive design for desktop and mobile (tailwind).

## 3. Main workflow

1. The user enters a meal description.
2. The frontend sends the text to the backend.
3. The backend sends the text to the local Llama model.
4. The model identifies food items and quantities and nutritions.
5. The model returns structured JSON.
6. The frontend displays the detected food items.
7. The user can edit food items and quantities.
8. The user confirms the meal.
9. The backend calculates nutrition values.
10. The backend saves the confirmed meal in json file.

Do not save a meal before user confirmation.

## 4. AI processing

Use Llama for these tasks:

- Identify food items.
- Extract quantities, nutritions and units.
- Normalize food names.
- Return valid JSON.
- Mark unknown or missing quantities.

Do not ask the model to invent exact nutrition values, if not clear just show empty value and user will add it.

Keep estimated quantities separate from measured quantities.

## 5. Data model

Create a Meal collection.

Each meal must contain:

- Date and time.
- Original user description.
- Food items.
- Quantity and unit for each item.
- Quantity type: measured or estimated.
- Nutrition values.
- User confirmation status.

Keep the data model easy to extend.

## 6. Frontend features

Create these pages:

- Food diary.
- Add meal.
- Edit meal.
- Daily nutrition summary.
- Nutrition history.

Show daily totals for calories and macronutrients.

Add charts for nutrition history.

Allow the user to edit or delete saved meals.

## 7. Backend API

Create these endpoints:

- POST `/api/meals/analyze` — analyze text with Llama.
- POST `/api/meals` — save a confirmed meal.
- GET `/api/meals` — get meals for a date range.
- GET `/api/meals/:id` — get one meal.
- PUT `/api/meals/:id` — update a meal.
- DELETE `/api/meals/:id` — delete a meal.
- GET `/api/nutrition/daily` — get daily nutrition totals.

Validate all input data.

Handle AI errors and invalid JSON.

## 8. Development requirements

1. Inspect the local Llama setup and identify its API endpoint.
2. Create the frontend and backend.
3. Connect the backend to the local model.
4. Connect MongoDB.
5. Implement the complete text-to-meal workflow.
6. Add basic error handling.
7. Add environment variables for configuration.
8. Add a README with setup instructions.

Run the application locally.

Test the complete workflow before you finish.

## 9. Scope limits

Do not implement these features in the first version:

- Image recognition.
- Telegram integration.
- External AI APIs.
- Automatic meal saving.
- Complex user authentication.

Keep the architecture ready for future image input and additional nutrition metrics.

## 10. Definition of done

The application is ready when the user can:

1. Enter a meal in natural language.
2. Receive a structured food list.
3. Correct the food list and quantities.
4. Confirm and save the meal.
5. View daily nutrition totals.
6. Review previous meals and nutrition history.

All AI processing must use the local Llama model in this version.

Важлива архітектурна деталь: агент має спочатку перевірити, як саме запущена Llama доступна локально (наприклад, через Ollama API), і лише після цього реалізувати інтеграцію. Не варто зашивати адресу API без перевірки.