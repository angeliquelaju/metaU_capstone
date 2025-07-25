"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe("post /generate-plan", () => {
    it("401 error cause user not logged in", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).post("/generate-plan");
        expect(res.status).toBe(401);
    }));
    it("generate plan matching total meals", () => __awaiter(void 0, void 0, void 0, function* () {
        const a = supertest_1.default.agent(app_1.default);
        const login = yield a.post("/login").send({
            username: "admin",
            password: "hi123"
        });
        expect(login.status).toBe(200);
        const res = yield a.post("/generate-plan").send({
            recipePreferences: [
                { title: "baked chicken", spoonacularId: 710766, servings: 1 },
                { title: "italian chicken", spoonacularId: 648097, servings: 2 }
            ],
            dailyMeals: {
                monday: 1,
                tuesday: 1,
                wednesday: 1,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0,
            }
        });
        expect(res.status).toBe(200);
        const total = res.body.plan.flatMap((d) => d.meals).length;
        expect(total).toBe(3);
    }));
});
