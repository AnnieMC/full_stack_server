const users = require("../models/users.server.models");
const social = require("../models/social.server.models");

const post_follower = (req, res) => {
  let follower_id = parseInt(req.params.user_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    social.addNewFollower(follower_id, user_id, (err) => {
      //---------------put 404 if no user exits
      if (err) {
        if (err.errno === 19) {
          return res.status(403).send("You are already following this user");
        }
        if (err == 404) {
          return res.sendStatus(404);
        } else {
          return res.sendStatus(500);
        }
      }

      return res.sendStatus(200); //--------------------------
    });
  });
};

const get_detSingleUser = (req, res) => {
  let user_id = parseInt(req.params.user_id);

  social.detailsSingleUser(user_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);

    return res.status(200).send(result);
  });
};

const delete_followingaUser = (req, res) => {
  let follower_id = parseInt(req.params.user_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    social.stopFollowingaUser(follower_id, user_id, (err) => {
      if (err)
        return res.status(403).send({
          error: "You cannot unfollow a user that you are not following",
        });
      return res.sendStatus(200);
    });
  });
};

const get_allUsers = (req, res) => {
  const params = req.query;
  console.log(params);
  social.searchUsers(params, (err, results) => {
    if (err) {
      console.log(results);
      return res.sendStatus(400);
    } else {
      return res.status(200).send(results);
    }
  });
};

module.exports = {
  post_follower: post_follower,
  get_detSingleUser: get_detSingleUser,
  delete_followingaUser: delete_followingaUser,
  get_allUsers: get_allUsers,
};
