import request from "supertest";
import app from "../app";

describe("get /meal-plan", () => {
    it("calculates the correct total nutrition", async () => {
        const a = request.agent(app);
        const login = await a.post("/login").send({
            username: "admin", 
            password: "hi123"
        });
        expect(login.status).toBe(200)
        const res = await a.get("/meal-plan");
        expect(res.status).toBe(200);
        expect(res.body.nutrition).toHaveProperty("weekly");
        expect(res.body.nutrition).toHaveProperty("daily");
    });
});