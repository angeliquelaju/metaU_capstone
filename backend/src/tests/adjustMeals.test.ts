import { getNutritionDiff, getExcess } from "../utils/nutritionCalcs";

describe("adjustment logic", () => {
    const goals = {calories: 2000, protein: 150, carbs: 200};
    const nutritionMap = new Map<number, {calories: number, protein: number, carbs: number}>();
    nutritionMap.set(1, {calories: 500, protein: 40, carbs: 50});
    nutritionMap.set(2, {calories: 600, protein: 50, carbs: 60});

    const countMeals = (prefs: any[]) => 
        prefs.reduce((sum, r) => sum + r.servings, 0);

    it("increase servings to match total meals", () => {
        const servings = [
            {title: "recipe A", spoonacularId: 1, servings: 2},
            {title: "recipe B", spoonacularId: 1, servings: 1}
        ];
        const totalMeals = 4;

        let total = countMeals(servings);
        while (total < totalMeals) {
            const best = servings.reduce((a,b) => {
                const scoreA = getNutritionDiff(goals, {calories: 0, protein: 0, carbs: 0}, nutritionMap.get(a.spoonacularId)!);
                const scoreB = getNutritionDiff(goals, {calories: 0, protein: 0, carbs: 0}, nutritionMap.get(b.spoonacularId)!);
                return scoreA > scoreB ? a : b;
            });
            best.servings++;
            total++;
        } expect(countMeals(servings)).toBe(totalMeals);
    });

    it("decrease servings to match total meals", () => {
        const servings = [
            {title: "recipe A", spoonacularId: 1, servings: 2},
            {title: "recipe B", spoonacularId: 1, servings: 4}
        ];
        const totalMeals = 4;

        let total = countMeals(servings);
        while (total > totalMeals) {
            const worse = servings.reduce((a,b) => {
                const excessA = getExcess(goals, {calories: 0, protein: 0, carbs: 0}, nutritionMap.get(a.spoonacularId)!);
                const excessB = getExcess(goals, {calories: 0, protein: 0, carbs: 0}, nutritionMap.get(b.spoonacularId)!);
                return excessA > excessB ? a : b;
            });
            worse.servings--;
            total--;
        } expect(countMeals(servings)).toBe(totalMeals);
    });
});