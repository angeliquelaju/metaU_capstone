import { Router, Request, Response } from "express";
import requireAuth from "../middleware/requireAuth";
import prisma from "../prisma";
import { recipeMap } from "../utils/recipeMap";
import { top5Users, cosineSimilarity } from "../utils/similarity";

const SPOON_KEY = process.env.SPOON_KEY!;
const router = Router();

//getting personalized recipes based on user's top 5 ingredients of their liked recipes
//looks through liked recipes, gets all the ingredients from those recipes then groups them together 
//gets the top 5 ingredients, then call spoonacular API to find recipes with those 5 ingredients
router.get(
  "/recipes/personalized",
  requireAuth,
  async (req: Request, res: Response) => {
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }

    try {
      const userwithLike = await prisma.user.findUnique({
        where: { username },
        include: { liked: true },
      });
      if (!userwithLike || userwithLike.liked.length === 0) {
        res.status(404).json({ error: "no liked recipes" });
        return;
      }

      //get ingredients from the liked recipes
      const allIngredients = userwithLike.liked.flatMap(
        (r) => r.ingredients || []
      );

      if (allIngredients.length === 0) {
        res.status(400).json({ error: "no ingredients" });
        return;
      }

      //splits ingredient words (ex. chicken breast -> chicken, breast)
      const tokens = allIngredients.flatMap((ing) =>
        //.trim().split(/\s+/) takes out all whitespaces and splits it no matter what whitespace there is
        ing.trim().toLowerCase().split(/\s+/)
      );

      //acts as a counter for the ingredients
      const frequency: Record<string, number> = {};
      for (const token of tokens) {
        frequency[token] = (frequency[token] || 0) + 1;
      }

      const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
      const topIngredients = sorted
        .slice(0, 5)
        .map(([key]) => key)
        .join(",");

      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOON_KEY}&includeIngredients=${topIngredients}&number=10&addRecipeInformation=true`
      );
      if (!response.ok) throw new Error("failed to get personalized recipes");
      const data = await response.json();
      res.json(data.results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "server error" });
    }
  }
);

//returns recipes saved by the current user's suggested users that they have not interacted with
//displays a match score for that recipe comparing it to the current user and how similar they are to the user who saved/liked it
router.get("/recipes/recommended", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  if (!username) {
    res.status(401).json({ error: "user not found" });
    return;
  }
  try {
    const currUser = await prisma.user.findUnique({
      where: { username },
      include: { saved: true, liked: true },
    });

    if (!currUser) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    //current user's interactions
    const userSaved = recipeMap(currUser.saved, currUser.liked);
    const seenRecipes = new Set(userSaved.keys());

    //other user's interactions
    const otherUsers = await prisma.user.findMany({
      where: { id: { not: currUser.id } },
      include: { saved: true, liked: true },
    });

    const topUsers = top5Users(currUser, otherUsers);

    const scores: Map<
      string,
      { recipe: any; totalWeighted: number; numUsers: Set<string> }
    > = new Map();

    for (const { user } of topUsers) {
      //map of weights
      const otherSaved = recipeMap(user.saved, user.liked);
      //map of recipeIds and its information (title, ingredients, etc)
      const otherRecipe = new Map<string, any>();

      //adding all saved recipes to recipe map
      for (const recipe of user.saved) {
        otherRecipe.set(recipe.id, recipe);
      }

      //adding liked-only recipes that were not saved
      for (const liked of user.liked) {
        if (!otherRecipe.has(liked.id)) {
          otherRecipe.set(liked.id, liked);
        }
      }

      const sim = cosineSimilarity(userSaved, otherSaved); //gets similarity score for current user and other user
      if (sim === 0) continue; //skip users who have 0 similarity score

      for (const [recipeId, score] of otherSaved.entries()) {
        if (seenRecipes.has(recipeId)) continue; //skip receipes that the current user has interacted with

        const existing = scores.get(recipeId);
        //calculating that specific user's contribution to the recipe score
        //user similarity * their weight (1,2,3) for that recipe
        const totalScore = sim * score;

        if (existing) {
          //total of all the score and other user similarities
          existing.totalWeighted += totalScore;
          existing.numUsers.add(user.id.toString());
        } else {
          scores.set(recipeId, {
            recipe: otherRecipe.get(recipeId),
            totalWeighted: totalScore,
            numUsers: new Set([user.id.toString()]),
          });
        }
      }
    }
    const topRecipes = [...scores.values()]
      .map(({ recipe, totalWeighted, numUsers }) => {
        //make the score consistent by dividing it by the maximum weight (3) * number of users interacted. total weight can be over 1
        //cause there are multiple user scores added together. max the score at 100 even if totalWeighted is over 100
        const denominator = 3 * numUsers.size;
        const percentage =
          denominator > 0 ? (totalWeighted / denominator) * 100 : 0;
        return {
          ...recipe,
          score: parseFloat(percentage.toFixed(2)),
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json(topRecipes);
    return;
  } catch (err) {
    console.error("recommendation error: ", err);
    res.status(500).json({ error: "internal server error" });
  }
});
export default router;