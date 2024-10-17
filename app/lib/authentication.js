const users = require("../models/users.server.models");

const isAuthenticated = function (req, res, next) {
  let token = req.get("X-Authorization");

  if (!token || token === null) {
    return res.sendStatus(401);
  }

  users.getIDFromToken(token, (err, id) => {
    console.log(token, err, id);
    if (err || id === null || !id) {
      return res.sendStatus(401);
    }
    next();
  });
};

module.exports = {
  isAuthenticated: isAuthenticated,
};
