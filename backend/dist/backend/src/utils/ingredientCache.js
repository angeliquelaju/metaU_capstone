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
exports.ingredientInfo = ingredientInfo;
const prisma_1 = __importDefault(require("../prisma"));
const spoonacular_1 = require("./spoonacular");
function ingredientInfo(spoonacularId) {
    return __awaiter(this, void 0, void 0, function* () {
        const cached = yield prisma_1.default.ingredientCache.findUnique({
            where: { spoonacularId },
        });
        if (cached)
            return cached.ingredients;
        const data = yield (0, spoonacular_1.recipeInfo)(spoonacularId);
        const parsed = {
            spoonacularId,
            ingredients: data,
        };
        yield prisma_1.default.ingredientCache.upsert({
            where: { spoonacularId },
            update: parsed,
            create: parsed,
        });
        return parsed.ingredients;
    });
}
