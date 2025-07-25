import { getNutritionDiff, getExcess } from "../utils/nutritionCalcs";
describe('nutritionCalcs', () => {
    const goals = {calories: 1000, protein: 80, carbs: 50};
    const current = {calories: 500, protein: 50, carbs: 20};
    const example = {calories: 100, protein: 10, carbs: 15};
    const currentExcess = {calories: 1200, protein: 110, carbs: 70};
    
    it('calculates nutrition difference', () => {
        const score = getNutritionDiff(goals, current, example);
        expect(score).toBe(
            (500 * 100) + (30 * 10) + (30 * 15)
        );
    });

    it('calculates nutrition excess', () => {
        const excess = getExcess(goals, currentExcess, example);
        expect(excess).toBe(
            (200 * 100) + (30 * 10) + (20 * 15)
        );
    });
})