"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const generatePlan_1 = __importDefault(require("./routes/generatePlan"));
const grocery_1 = __importDefault(require("./routes/grocery"));
const mealPlan_1 = __importDefault(require("./routes/mealPlan"));
const userGoals_1 = __importDefault(require("./routes/userGoals"));
const friendSuggestion_1 = __importDefault(require("./routes/friendSuggestion"));
const saving_1 = __importDefault(require("./routes/saving"));
const liking_1 = __importDefault(require("./routes/liking"));
const userRecipes_1 = __importDefault(require("./routes/userRecipes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const cors = require("cors");
app.use(cors({
    origin: ["http://localhost:5173", "https://metau-capstone.onrender.com", "https://metau-capstone.onrender.com/"],
    credentials: true,
}));
app.use(express_1.default.json());
app.set("trust proxy", 1);
const isTest = process.env.NODE_ENV === "test";
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: !isTest, httpOnly: true, sameSite: "none", maxAge: 1000 * 60 * 60 },
}));
app.get("/", (req, res) => {
    res.send("backend running");
});
app.use(auth_1.default);
app.use(recipes_1.default);
app.use(generatePlan_1.default);
app.use(grocery_1.default);
app.use(mealPlan_1.default);
app.use(userGoals_1.default);
app.use(friendSuggestion_1.default);
app.use(liking_1.default);
app.use(saving_1.default);
app.use(userRecipes_1.default);
exports.default = app;
