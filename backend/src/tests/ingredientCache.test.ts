import * as spoonacular from "../utils/spoonacular";
import prisma from "../prisma";
import { ingredientInfo } from "../utils/ingredientCache";

jest.mock("../utils/spoonacular");

describe("ingredient info", () => {
    it("use cache ingredients if there is", async () => {
        const cached = { spoonacularId: 1, ingredients: {mock: "yes"} };
        prisma.ingredientCache.findUnique = jest.fn().mockResolvedValue(cached);
        const result = await ingredientInfo(1);
        expect(result).toEqual({mock: "yes"});
    });

    it("gets api recipe ingredients if not cached", async() => {
        (spoonacular.recipeInfo as jest.Mock).mockResolvedValue({
            title: "test recipe",
            extendedIngredients: [{name: "sample ingredients"}],
        });
        prisma.ingredientCache.findUnique = jest.fn().mockResolvedValue(null);
        prisma.ingredientCache.upsert = jest.fn().mockResolvedValue({});
        const result = await ingredientInfo(2);
        expect(result.extendedIngredients[0].name).toBe("sample ingredients");
    })
})