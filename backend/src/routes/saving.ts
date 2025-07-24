import { Router, Request, Response } from "express";
import requireAuth from "../middleware/requireAuth";
import prisma from "../prisma";
const router = Router();

//saving recipes
//checks if the user exists and if that recipes is already saved 
//if it is not then it is upserted into the database, then connects the user to the recipe
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
        where: { id, userSaves: { some: { id: user.id, } } },
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
        data: { saved: { connect: { id: recipe.id } } },
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

//remove recipes that have been saved
//checks if the user exists and updates the saved recipes to disconnect that recipe from the user
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
        data: { saved: { disconnect: { id } } },
      });
      res.status(200).json({ message: "recipe removed" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);
export default router;