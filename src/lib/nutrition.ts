export function calculateTDEE(ageYears: number, weightKg: number, heightCm: number): number {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  const activityMultiplier = 1.55;
  return Math.round(bmr * activityMultiplier);
}

export function getRemainingCalories(consumed: number, tdee: number): number {
  return Math.max(0, tdee - consumed);
}
