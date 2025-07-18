"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireAuth;
function requireAuth(req, res, next) {
    if (!req.session.user) {
        res.status(401).json({ message: "Unauthorized " });
        return;
    }
    next();
}
