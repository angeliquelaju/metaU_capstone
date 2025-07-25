import express from "express";
import session from "express-session";
import authRoutes from "./routes/auth";
import recipeRoutes from "./routes/recipes";
import generatePlanRoutes from "./routes/generatePlan";
import groceryRoutes from "./routes/grocery";
import mealPlanRoutes from "./routes/mealPlan";
import userGoalRoutes from "./routes/userGoals";
import friendSuggestionRoutes from "./routes/friendSuggestion";
import saveRoutes from "./routes/saving";
import likeRoutes from "./routes/liking";
import userRecipeRoutes from "./routes/userRecipes"

import dotenv from "dotenv";

dotenv.config();

const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://metau-capstone.onrender.com", "https://metau-capstone.onrender.com/"],
    credentials: true,
  }),
);

app.use(express.json());
app.set("trust proxy", 1);

const isTest = process.env.NODE_ENV === "test";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: !isTest, httpOnly: true, sameSite: "none", maxAge: 1000 * 60 * 60 },
  }),
);

app.get("/", (req, res) => {
  res.send("backend running");
});

app.use(authRoutes);
app.use(recipeRoutes);
app.use(generatePlanRoutes);
app.use(groceryRoutes);
app.use(mealPlanRoutes);
app.use(userGoalRoutes);
app.use(friendSuggestionRoutes);
app.use(likeRoutes);
app.use(saveRoutes);
app.use(userRecipeRoutes);

export default app;
