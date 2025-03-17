const adminMiddleware = (req, res, next) => {
    if(req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    next();
};
module.exports = adminMiddleware;