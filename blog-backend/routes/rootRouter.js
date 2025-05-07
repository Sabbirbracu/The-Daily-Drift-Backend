const authRoutes = require("./auth");
const userRoutes = require("./users");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const analyticRoutes = require("./analytics");
const adminRoutes = require("./admin");
const newsletterRoutes = require("./newsletter");

const rootRouter = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/analytics", analyticRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/newsletter", newsletterRoutes); 
};

module.exports = rootRouter;
