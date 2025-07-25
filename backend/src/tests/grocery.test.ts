import request from "supertest";
import app from "../app";

describe("get /grocery", () => {
    it("groups ingredients by aisle", async () => {
        const a = request.agent(app);
        const login = await a.post("/login").send({
            username: "admin", 
            password: "hi123"
        });
        expect(login.status).toBe(200)
        const res = await a.get("/grocery");
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty("category");
        expect(res.body[0]).toHaveProperty("ingredients");
    })
})