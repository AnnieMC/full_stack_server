const users = require("../controllers/users.server.controllers");
const auth = require("../lib/authentication");
module.exports = function (app) {
  app.route("/users").post(users.create);

  app.route("/login").post(users.login);

  app.route("/logout").post(auth.isAuthenticated, users.logout);
};
