import * as spoonacular from "../utils/spoonacular";
import prisma from "../prisma";
import { nutritionInfo } from "../utils/nutritionCache";

jest.mock("../utils/spoonacular");

describe("nutrition info", () => {
    it("use cache data if there is", async () => {
        const cached = { spoonacularId: 710766, calories: 389, protein: 33, carbs: 9 };
        prisma.nutritionCache.findUnique = jest.fn().mockResolvedValue(cached);
        const result = await nutritionInfo(710766);
        expect(result).toEqual(cached);
    });

    it("gets api values if not cached", async() => {
        (spoonacular.recipeNutrition as jest.Mock).mockResolvedValue({
            calories: "380",
            protein: "30g",
            carbs: "10g",
        });
        prisma.nutritionCache.findUnique = jest.fn().mockResolvedValue(null);
        prisma.nutritionCache.upsert = jest.fn();
        const result = await nutritionInfo(700000);
        expect(result.calories).toBe(380);
        expect(result.protein).toBe(30);
        expect(result.carbs).toBe(10);
    })
})