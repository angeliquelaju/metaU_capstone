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
exports.getSession = exports.logout = exports.me = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const existingUser = yield prisma_1.default.user.findUnique({ where: { username } });
        if (existingUser) {
            res.status(400).json({ message: "User exists" });
            return;
        }
        const hashed = yield bcrypt_1.default.hash(password, 10);
        yield prisma_1.default.user.create({
            data: {
                username,
                password: hashed,
            },
        });
        res.status(201).json({ message: "Signup successful!" });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        req.session.user = { username };
        res.json({ username });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
const me = (req, res) => {
    if (!req.session.user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }
    res.json(req.session.user.username);
};
exports.me = me;
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to log out" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
    });
};
exports.logout = logout;
const getSession = (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user });
    }
    else {
        res.status(401).json({ message: "Not logged in" });
    }
};
exports.getSession = getSession;
