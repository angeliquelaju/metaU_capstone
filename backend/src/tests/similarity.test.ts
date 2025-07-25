import {
    recipeSimilar,
    ingredientOverlap,
    top5Users,
    cosineSimilarity,
} from "../utils/similarity";

describe("recipe similarity", () => {
    it("calculate weighted jaccard similarity score", () => {
        const a = new Map([
            ["1", 1],
            ["2", 3],
        ]);
        const b = new Map([
            ["2", 2],
            ["3", 2],
        ]);
        const result = recipeSimilar(a, b);
        expect(result).toBe(2/6);
    });
});

describe("ingredient overlap", () => {
    it("calculate jaccard similarity score for ingredients", () => {
        const setA = new Set(["chicken", "garlic", "onion", "tomato"]);
        const setB = new Set(["lemon", "chicken", "tomato"])
        const result = ingredientOverlap(setA, setB);
        expect(result).toBe(2/5);
    });
});

describe("cosine similarity", () => {
    it("calculates cosine similarity for users", () => {
        const a = new Map([
            ["1", 1],
            ["2", 2],
        ]);
        const b = new Map([
            ["1", 2],
            ["2", 1],
            ["3", 2],
        ]);
        const result = cosineSimilarity(a, b);
        expect(result).toBeCloseTo(4/(Math.sqrt(5) * 3));
    });
    it("results to 0 if a user has no interactions", () => {
        const a = new Map([["1", 1]]);
        const b = new Map();
        expect(cosineSimilarity(a,b)).toBe(0);
    });
});

describe("top 5 users", () => {
    const recipe = (id: string, ingredients: string[]) => ({ id, ingredients });
    const userA = {
        id: "1",
        username: "userA",
        saved: [recipe("1", ["chicken", "lemon"])],
        liked: [recipe("2", ["onion", "tomato"])],
    }
    const userB = {
        id: "2",
        username: "userB",
        saved: [recipe("1", ["chicken", "lemon"])],
        liked: [recipe("2", ["onion", "tomato"])],
    }
    const userC = {
        id: "3",
        username: "userC",
        saved: [recipe("3", ["garlic", "salt"])],
        liked: [],
    }
    const userD = {
        id: "4",
        username: "userD",
        saved: [recipe("3", ["garlic", "salt"])],
        liked: [recipe("2", ["onion", "tomato"])],
    }
    const userE = {
        id: "5",
        username: "userE",
        saved: [recipe("3", ["garlic", "salt"]), recipe("2", ["onion", "tomato"])], 
        liked: [],
    }
    const userF = {
        id: "6",
        username: "userF",
        saved: [], 
        liked: [],
    }
    it("return top 5 users sorted by similarity", () => {
        const result = top5Users(userA, [userB, userC, userD, userE, userF]);
        expect(result.length).toBe(3);
        expect(result[0].user.username).toBe("userB");
        expect(result[0].finalScore).toBeGreaterThan(result[1]?.finalScore);
    });
    it("does not include users with 0 similarity", () => {
        const result = top5Users(userA, [userF]);
        expect(result.length).toBe(0);
    })
})