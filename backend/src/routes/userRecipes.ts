import { Router, Request, Response } from "express";
import requireAuth from "../middleware/requireAuth";
import prisma from "../prisma";
const router = Router();

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
export default router;