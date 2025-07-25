"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNutritionDiff = getNutritionDiff;
exports.getExcess = getExcess;
function getNutritionDiff(goals, current, nutrition) {
    const diff = (goal, actual) => goal - actual;
    return (diff(goals.calories, current.calories) * nutrition.calories +
        diff(goals.protein, current.protein) * nutrition.protein +
        diff(goals.carbs, current.carbs) * nutrition.carbs);
}
function getExcess(goals, current, nutrition) {
    return (Math.max(0, current.calories - goals.calories) * nutrition.calories +
        Math.max(0, current.protein - goals.protein) * nutrition.protein +
        Math.max(0, current.carbs - goals.carbs) * nutrition.carbs);
}
