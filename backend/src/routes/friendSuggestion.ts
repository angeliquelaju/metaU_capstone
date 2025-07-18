import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();

//similarity = (number of the same recipes) / (number of unique recipes)
function computeJaccard(setA: Set<string>, setB: Set<string>): number { 
  const intersection = new Set([...setA].filter((x) => setB.has(x))); //same recipes saved
  const union = new Set([...setA, ...setB]); //unique recipes
  return union.size === 0 ? 0 : intersection.size / union.size;
}

router.get("/friends/suggestions", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  if (!username) {
    res.status(401).json({ error: "user not found" });
    return;
  }
  const currUser = await prisma.user.findUnique({
    where: { username },
    include: { saved: true },
  });

  if (!currUser) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  //making the current user's saved recipe IDs a Set for quick reference/look up
  const userSaved = new Set(currUser.saved.map((r) => r.id));
  const otherUsers = await prisma.user.findMany({
    where: { id: { not: currUser.id } },
    include: { saved: true },
  });

  //creating the list of suggestions and counting their similarity scores
  const suggestions = otherUsers
    .map((user) => {
      const savedIds = new Set(user.saved.map((r) => r.id));
      const similarity = computeJaccard(userSaved, savedIds);
      return {
        id: user.id,
        username: user.username,
        similarity: parseFloat(similarity.toFixed(2)),
      };
    })
    .filter((s) => s.similarity > 0) //filter out users who have no same recipe saved
    .sort((a, b) => b.similarity - a.similarity) //sort from highest similarity 
    .slice(0, 5); //top 5 users with the highest similarity

  res.json(suggestions);
});

export default router;
