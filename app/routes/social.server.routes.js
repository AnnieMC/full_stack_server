const social = require("../controllers/social.server.controllers");
const auth = require("../lib/authentication");

module.exports = function (app) {
  app.route("/users/:user_id").get(social.get_detSingleUser);

  app
    .route("/users/:user_id/follow")
    .post(auth.isAuthenticated, social.post_follower)
    .delete(auth.isAuthenticated, social.delete_followingaUser);

  app.route("/search").get(social.get_allUsers);
};
