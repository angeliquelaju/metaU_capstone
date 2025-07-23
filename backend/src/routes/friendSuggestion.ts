import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";
import { recipeMap } from "../utils/recipeMap";
import {
  top5Users
} from "../utils/similarity"

const router = Router();

router.get("/friends/suggestions", requireAuth, async (req, res) => {
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

    const otherUsers = await prisma.user.findMany({
      where: { id: { not: currUser.id } },
      include: { saved: true, liked: true },
    });

    const topUsers = top5Users(currUser, otherUsers);

    const suggestions = topUsers.map(({user, finalScore, recipeScore, ingredientScore}) => ({
      id: user.id,
      username: user.username,
      similarity: parseFloat(finalScore.toFixed(2)),
      recipeScore: parseFloat(recipeScore.toFixed(2)),
      ingredientScore: parseFloat(ingredientScore.toFixed(2)),
    }))

    res.json(suggestions);
  } catch (err) {
    console.error("error generating friend suggestions: ", err);
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
