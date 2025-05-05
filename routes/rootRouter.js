const authRoutes = require("./auth"); // ✅ no /routes/ prefix needed
const userRoutes = require("./users");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const analyticRoutes = require("./analytics");
const adminRoutes = require("./admin");

const rootRouter = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/analytics", analyticRoutes);
  app.use("/api/admin", adminRoutes);
};

module.exports = rootRouter;
