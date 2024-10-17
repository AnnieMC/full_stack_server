const Joi = require("joi");
const users = require("../models/users.server.models");

const create = (req, res) => {
  let exp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,30}$";

  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().pattern(new RegExp(exp)).required(),
  });

  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).send({ error_message: error.details[0].message });

  let user = Object.assign({}, req.body);

  users.addNewUser(user, (err, id) => {
    if (err) {
      console.log("CONSOLE LOG REEEEEEE " + err);
      if (err === 400) {
        return res
          .status(400)
          .send({ error_message: "The username is already taken" });
      }
      return res.sendStatus(500);
    } else {
      return res.status(201).send({ user_id: id });
    }
  });
};

const login = (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).send({ error_message: error.details[0].message }); //-------- here is where I need to return the json respond by the example above

  users.authenticateUser(req.body.username, req.body.password, (err, id) => {
    //Check POST - Login is correct or not
    if (err === 404)
      return res
        .status(400)
        .send({ error_message: "Inavlid email/password suplied" });
    if (err) return res.sendStatus(500);

    users.getToken(id, (err, token) => {
      if (err) return res.sendStatus(500);

      if (token) {
        return res.status(200).send({ user_id: id, session_token: token });
      } else {
        users.setToken(id, (err, token) => {
          if (err) return res.sendStatus(500);
          return res.status(200).send({ user_id: id, session_token: token });
        });
      }
    });
  });
};

const logout = (req, res) => {
  let token = req.get("X-Authorization");

  users.removeToken(token, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
};

module.exports = {
  create: create,
  login: login,
  logout: logout,
};
