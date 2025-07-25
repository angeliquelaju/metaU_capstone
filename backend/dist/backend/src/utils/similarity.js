"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeSimilar = recipeSimilar;
exports.ingredientOverlap = ingredientOverlap;
exports.top5Users = top5Users;
exports.cosineSimilarity = cosineSimilarity;
const recipeMap_1 = require("../utils/recipeMap");
//calculates similarity between 2 user's recipe interactions using weighted jaccard similarity
//weight: 1 (if saved), 2 (if liked), 3 (if saved and liked)
//similarity = intersection (min interaction of that recipe) / union (max interaction of that recipe)
function recipeSimilar(mapA, mapB) {
    const allRecipeIds = new Set([...mapA.keys(), ...mapB.keys()]);
    let intersection = 0;
    let union = 0;
    for (const id of allRecipeIds) {
        const a = mapA.get(id) || 0;
        const b = mapB.get(id) || 0;
        intersection += Math.min(a, b);
        union += Math.max(a, b);
    }
    return union === 0 ? 0 : intersection / union;
}
//calculate ingredient similarity between 2 users using jaccard similarity
//see how much the individual ingredients overlap based on recipes they have liked/saved
//intersection (shared ingredients) / union (unique recipes)
function ingredientOverlap(ingredientsA, ingredientsB) {
    const intersection = new Set([...ingredientsA].filter((ing) => ingredientsB.has(ing)));
    const union = new Set([...ingredientsA, ...ingredientsB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}
//returns the top 5 users with the highest similarity score to the current user
//70% recipe similarity, 30% ingredient similarity
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
//calculates cosine similarity between 2 users (recipe interactions)
//compares users patterns (see how they interact with all the recipes) even if they do not overlap
//dot product (how much do the 2 user's interactions overlap) / (magnitudeA * magnitudeB) (how much the users interact overall) 
function cosineSimilarity(a, b) {
    const allRecipeIds = new Set([...a.keys(), ...b.keys()]);
    let dot = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (const id of allRecipeIds) {
        const valA = a.get(id) || 0;
        const valB = b.get(id) || 0;
        dot += valA * valB; //calculate how much users interact with the same recipe
        //overall interaction for that user
        magnitudeA += valA ** 2;
        magnitudeB += valB ** 2;
    }
    if (magnitudeA === 0 || magnitudeB === 0)
        return 0;
    return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)); //final similarity score (closer to 1 more similar they are)
}
