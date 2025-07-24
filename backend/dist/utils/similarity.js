"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeSimilar = recipeSimilar;
exports.ingredientOverlap = ingredientOverlap;
exports.top5Users = top5Users;
const recipeMap_1 = require("../utils/recipeMap");
//calculates recipe similarity using weighted jaccard similarity
//weight: 1 (if saved), 2 (if liked), 3 (if saved and liked)
function recipeSimilar(mapA, mapB) {
    const allRecipeIds = new Set([...mapA.keys(), ...mapB.keys()]);
    let intersection = 0;
    let union = 0;
    for (const id of allRecipeIds) {
        const a = mapA.get(id) || 0;
        const b = mapB.get(id) || 0;
        intersection += Math.min(a, b); //min interaction of that recipe
        union += Math.max(a, b); //max interaction of that recipe
    }
    return union === 0 ? 0 : intersection / union;
}
//ingredient overlap similarity using jaccard
function ingredientOverlap(ingredientsA, ingredientsB) {
    // both users saved ingredients  
    const intersection = new Set([...ingredientsA].filter((ing) => ingredientsB.has(ing)));
    //unique recipes
    const union = new Set([...ingredientsA, ...ingredientsB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}
function top5Users(currUser, otherUsers) {
    const userIngredients = new Set();
    const userMap = (0, recipeMap_1.recipeMap)(currUser.saved, currUser.liked, userIngredients);
    return otherUsers
        .map((user) => {
        const otherIngredients = new Set();
        const otherMap = (0, recipeMap_1.recipeMap)(user.saved, user.liked, otherIngredients);
        //calculating similarity score for both recipe and ingredient based
        const recipeScore = recipeSimilar(userMap, otherMap);
        const ingredientScore = ingredientOverlap(userIngredients, otherIngredients);
        const finalScore = 0.7 * recipeScore + 0.3 * ingredientScore;
        return {
            user,
            finalScore,
            recipeScore,
            ingredientScore,
        };
    })
        .filter(({ finalScore }) => finalScore > 0.1) //filter out users who have little similarity
        .sort((a, b) => b.finalScore - a.finalScore) //sort from highest similarity
        .slice(0, 5); //top 5 users with the highest similarity
}
