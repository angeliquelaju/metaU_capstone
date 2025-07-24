import { Router, Request, Response } from "express";
import requireAuth from "../middleware/requireAuth";
import prisma from "../prisma";
import {recipeMap} from "../utils/recipeMap";

import "express-session";
declare module "express-session" {
  interface SessionData {
    user?: { username: string };
  }
}
const SPOON_KEY = process.env.SPOON_KEY!;

//saving recipes
const router = Router();
router.post(
  "/recipes/save",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id, title, image, ingredients } = req.body;
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }
      const alreadySaved = await prisma.recipe.findFirst({
        where: {
          id,
          userSaves: {
            some: {
              id: user.id,
            },
          },
        },
      });

      if (alreadySaved) {
        res.status(409).json({ error: "recipe already saved" });
        return;
      }

      const recipe = await prisma.recipe.upsert({
        where: { id },
        update: { ingredients: ingredients?.length ? ingredients : undefined },
        create: {
          id,
          title,
          image,
          ingredients: ingredients?.length ? ingredients : [],
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          saved: {
            connect: { id: recipe.id },
          },
        },
      });
      res.status(200).json({ message: "recipe saved" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "internal error" });
    }
  }
);

//getting the recipes that have been saved by a user
router.get(
  "/recipes/user",
  requireAuth,
  async (req: Request, res: Response) => {
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }

    try {
      const userWithRecipes = await prisma.user.findUnique({
        where: { username },
        include: { saved: true },
      });
      res.json(userWithRecipes?.saved ?? []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);

//delete recipes that have been saved
router.delete(
  "/recipes/remove/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const username = req.session.user?.username;
    const { id } = req.params;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          saved: {
            disconnect: { id },
          },
        },
      });
      res.status(200).json({ message: "recipe removed" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);

//liking recipes
router.post(
  "/recipes/like",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id, title, image, ingredients } = req.body;
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }
      const existingRecipe = await prisma.recipe.findUnique({
        where: { id },
      });

      let updatedRecipe;
      if (existingRecipe) {
        if (
          !existingRecipe.ingredients ||
          existingRecipe.ingredients.length === 0
        ) {
          updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: { ingredients },
          });
        } else {
          updatedRecipe = existingRecipe;
        }
      } else {
        updatedRecipe = await prisma.recipe.create({
          data: { id, title, image, ingredients },
        });
      }

      const alreadyLiked = await prisma.recipe.findFirst({
        where: {
          id,
          userLikes: {
            some: { id: user.id },
          },
        },
      });

      if (alreadyLiked) {
        res.status(409).json({ error: "recipe liked already" });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          liked: {
            connect: { id: updatedRecipe.id },
          },
        },
      });
      res.status(200).json({ message: "recipe liked" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "server error" });
    }
  }
);

//getting the recipes that have been liked
router.get(
  "/recipes/likedRecipes",
  requireAuth,
  async (req: Request, res: Response) => {
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }

    try {
      const userwithLiked = await prisma.user.findUnique({
        where: { username },
        include: { liked: true },
      });
      if (!userwithLiked) {
        res.status(404).json({ error: "user not found" });
        return;
      }
      res.status(200).json(userwithLiked.liked);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);

//unlike recipes
router.delete(
  "/recipes/unlike/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const username = req.session.user?.username;
    const { id } = req.params;
    if (!username) {
      res.status(401).json({ error: "not logged in" });
      return;
    }
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          liked: {
            disconnect: { id },
          },
        },
      });
      res.status(200).json({ message: "recipe unliked" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);

//getting personalized recipes
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

      //group ingredient words (ex. chicken breast -> chicken)
      const tokens = allIngredients.flatMap((ing) =>
        //.trim().split(/\s+/) takes out all whitespaces and splits it no matter what whitespace there is
        ing.trim().toLowerCase().split(/\s+/)
      );

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
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOON_KEY}&includeIngredients=${topIngredients}&number=10&addRecipeInformation=true`
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

//get other user's saved recipes using username
router.get("/recipes/user/:username", async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { saved: true },
    });

    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    res.json(user.saved);
  } catch (err) {
    console.error("error in public user recipe fetch: ", err);
    res.status(500).json({ error: "internal error" });
  }
});

//gets users patterns (see how they interact with all the recipes) not just the ones that overlap
//how much recipes a user has interacted with does not effect the score as it uses magnitude
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>
): number {
  const allRecipeIds = new Set([...a.keys(), ...b.keys()]);
  let dot = 0; //
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
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)); //final similarity score (closer to 1 more similar they are)
}

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
    const seenRecipes = new Set<string>();

    for (const recipeId of userSaved.keys()) {
      seenRecipes.add(recipeId);
    }

    //other user's interactions
    const otherUsers = await prisma.user.findMany({
      where: { id: { not: currUser.id } },
      include: { saved: true, liked: true },
    });

    const scores: Map<
      string,
      { recipe: any; totalWeighted: number }
    > = new Map();

    for (const user of otherUsers) {
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
        } else {
          scores.set(recipeId, {
            recipe: otherRecipe.get(recipeId),
            totalWeighted: totalScore,
          });
        }
      }
    }
    const topRecipes = [...scores.values()]
      .map(({ recipe, totalWeighted }) => {
        //make the score consistent by dividing it by the maximum weight (3). total weight can be over 1
        //cause there are multiple user scores added together. max the score at 100 even if totalWeighted is over 100
        const percentage = Math.min((totalWeighted / 3) * 100, 100);
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
