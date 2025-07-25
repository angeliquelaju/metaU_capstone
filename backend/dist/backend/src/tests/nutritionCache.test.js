"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const spoonacular = __importStar(require("../utils/spoonacular"));
const prisma_1 = __importDefault(require("../prisma"));
const nutritionCache_1 = require("../utils/nutritionCache");
jest.mock("../utils/spoonacular");
describe("nutrition info", () => {
    it("use cache data if there is", () => __awaiter(void 0, void 0, void 0, function* () {
        const cached = { spoonacularId: 710766, calories: 389, protein: 33, carbs: 9 };
        prisma_1.default.nutritionCache.findUnique = jest.fn().mockResolvedValue(cached);
        const result = yield (0, nutritionCache_1.nutritionInfo)(710766);
        expect(result).toEqual(cached);
    }));
    it("gets api values if not cached", () => __awaiter(void 0, void 0, void 0, function* () {
        spoonacular.recipeNutrition.mockResolvedValue({
            calories: "380",
            protein: "30g",
            carbs: "10g",
        });
        prisma_1.default.nutritionCache.findUnique = jest.fn().mockResolvedValue(null);
        prisma_1.default.nutritionCache.upsert = jest.fn();
        const result = yield (0, nutritionCache_1.nutritionInfo)(700000);
        expect(result.calories).toBe(380);
        expect(result.protein).toBe(30);
        expect(result.carbs).toBe(10);
    }));
});
