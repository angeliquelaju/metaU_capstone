"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRecipes = exports.recipeNutrition = exports.recipeInfo = void 0;
const SPOON_KEY = process.env.SPOON_KEY;
const BASE_URL = "https://api.spoonacular.com/recipes";
const connected = (endpoint) => `${BASE_URL}/${endpoint}?apiKey=${SPOON_KEY}`;
const recipeInfo = (id) => fetch(connected(`${id}/information`))
    .then((res) => res.json());
exports.recipeInfo = recipeInfo;
const recipeNutrition = (id) => fetch(connected(`${id}/nutritionWidget.json`))
    .then((res) => res.json());
exports.recipeNutrition = recipeNutrition;
const searchRecipes = (ingredients_1, ...args_1) => __awaiter(void 0, [ingredients_1, ...args_1], void 0, function* (ingredients, number = 10) {
    const URL = `${BASE_URL}/complexSearch?apiKey=${SPOON_KEY}&includeIngredients=${ingredients}&number=${number}&addRecipeInformation=true`;
    const res = yield fetch(URL);
    if (!res.ok) {
        throw new Error("failed to fetch searchRecipes");
    }
    return res.json();
});
exports.searchRecipes = searchRecipes;
