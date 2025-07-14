import { Router, Request, Response } from "express";
import requireAuth from "../middleware/requireAuth";
import prisma from "../prisma";

import "express-session";
import { all } from "axios";
declare module "express-session" {
  interface SessionData {
    user?: { username: string };
  }
}

//saving recipes
const router = Router();
router.post(
  "/recipes/save",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id, title, image } = req.body;
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
        update: {},
        create: { id, title, image },
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
  },
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
  },
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
  },
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
      const alreadyLiked = await prisma.recipe.findFirst({
        where: {
          id,
          userLikes: {
            some: {
              id: user.id,
            },
          },
        },
      });

      if (alreadyLiked) {
        res.status(409).json({ error: "recipe liked already" });
        return;
      }

      const recipe = await prisma.recipe.upsert({
        where: { id },
        update: {},
        create: { id, title, image, ingredients },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          liked: {
            connect: { id: recipe.id },
          },
        },
      });
      res.status(200).json({ message: "recipe liked" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "server error" });
    }
  },
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
  },
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
  },
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
        (r) => r.ingredients || [],
      );
      console.log("user liked ingredients: ", allIngredients);

      if (allIngredients.length === 0) {
        res.status(400).json({ error: "no recipes have been liked" });
        return;
      }

      //group ingredient words (ex. chicken breast -> chicken)
      const tokens = allIngredients.flatMap((ing) =>
        ing.toLowerCase().split(/\s+/),
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

      const apiKey = "6883c7a59696409ba35b059d9d5b08e1";
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&includeIngredients=${topIngredients}&number=10`,
      );
      if (!response.ok) throw new Error("failed to get personalized recipes");
      const data = await response.json();
      res.json(data.results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "server error" });
    }
  },
);

export default router;
