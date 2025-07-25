import request from "supertest";
import app from "../app";

describe("post /generate-plan", () => {
    it ("401 error cause user not logged in", async () => {
        const res = await request(app).post("/generate-plan");
        expect(res.status).toBe(401);
    });

    it("generate plan matching total meals", async () => {
        const a = request.agent(app);
        const login = await a.post("/login").send({
            username: "admin", 
            password: "hi123"
        });
        expect(login.status).toBe(200)
        const res = await a.post("/generate-plan").send({
            recipePreferences: [
                {title: "baked chicken", spoonacularId: 710766, servings: 1},
                {title: "italian chicken", spoonacularId: 648097, servings: 2}
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
        const total = res.body.plan.flatMap((d: any) => d.meals).length;
        expect(total).toBe(3);
    });
});