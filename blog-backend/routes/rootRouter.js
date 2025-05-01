const authRoutes = require("./auth");
const userRoutes = require("./users");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const analyticRoutes = require("./analytics");
const adminRoutes = require("./admin");
const registerRouter = require("./register");
const loginRouter = require("./login");
const rootRouter = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/analytics", analyticRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/register", registerRouter);
  app.use("/api/login", loginRouter);
};

module.exports = rootRouter;
