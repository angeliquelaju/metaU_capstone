import request from "supertest";
import app from "../app";

describe("get n post /user/goals", () => {
    it ("401 error cause user not logged in", async () => {
        const res = await request(app).post("/generate-plan");
        expect(res.status).toBe(401);
    });

    it("gets n sets user goals", async() => {
        const a = request.agent(app);
        const login = await a.post("/login").send({
            username: "admin", 
            password: "hi123"
        });
        expect(login.status).toBe(200)
        
        const goalSet = await a.post("/user/goals").send({
            calories: 1800,
            protein: 100,
            carbs: 50,
        });
        const res = await a.get("/user/goals");
        expect(res.status).toBe(200);
        expect(res.body.calories).toBe(1800);
        expect(res.body.protein).toBe(100);
        expect(res.body.carbs).toBe(50);
    })
})