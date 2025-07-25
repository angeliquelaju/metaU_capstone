import { Router, Request, Response } from "express";
import requireAuth from "../middleware/requireAuth";
import prisma from "../prisma";
const router = Router();

//liking recipes
//checks if the user exists and upserts the recipe if it does not exist
//it updates the ingredients list if it is missing, then connects the user to the recipe
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
          userLikes: { some: { id: user.id } } },
      });

      if (alreadyLiked) {
        res.status(409).json({ error: "recipe liked already" });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { liked: { connect: { id: updatedRecipe.id } } },
      });
      res.status(200).json({ message: "recipe liked" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "server error" });
    }
  }
);

//getting the recipes that have been liked by a user
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

//unlike recipes that have been liked
//checks if the user exists and updates the liked recipes to disconnect that recipe from the user
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
        data: { liked: { disconnect: { id } } },
      });
      res.status(200).json({ message: "recipe unliked" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal error" });
    }
  }
);
export default router;