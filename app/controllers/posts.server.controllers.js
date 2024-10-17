//-------------- Run the server and test using Postman. All routes should return a 500 response because they have not yet been implemented???????

const posts = require("../models/posts.server.models");
const users = require("../models/users.server.models");
const Joi = require("joi");

const add_post = (req, res) => {
  //Create each of the function that you called from route files
  const schema = Joi.object({
    text: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.sendStatus(400);

  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    let post = Object.assign({}, req.body); //this line coverts the request body to an object
    posts.addNewPost(post, user_id, (err, id) => {
      if (err) {
        return res.sendStatus(500);
      } else {
        return res.status(201).send({ post_id: id });
      }
    });
  });
};

const get_post = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err) => {
    if (err) return res.sendStatus(500);

    posts.getSinglePost(post_id, (err, result) => {
      if (err === 404) return res.sendStatus(404);
      if (err) return res.sendStatus(500);

      return res.status(200).send(result);
    });
  });
};

const update_post = (req, res) => {
  const schema = Joi.object({
    text: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).send({ error_message: error.details[0].message });
  if (posts.text === req.body.text) {
    return res.sendStatus(200);
  }

  let post_id = parseInt(req.params.post_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    posts.updatePost(post_id, req.body.text, (err) => {
      if (err) return res.sendStatus(500);
      return res.sendStatus(200);
    });
  });
};

const delete_post = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    posts.deletePost(post_id, (err) => {
      if (err) return res.sendStatus(500);
      return res.sendStatus(200);
    });
  });
};
//----------------------------------
const add_like = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    posts.getSinglePost(post_id, (err, post) => {
      if (!post) return res.sendStatus(404);
      if (err) return res.sendStatus(500);

      posts.likingPost(post_id, user_id, (err) => {
        console.log(err);
        if (err) return res.sendStatus(403);

        return res.sendStatus(200);
      });
    });
  });
};

const remove_like = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get("X-Authorization");

  users.getIDFromToken(token, (err, user_id) => {
    if (err) return res.sendStatus(500);

    posts.getSinglePost(post_id, (err, post) => {
      if (!post) return res.sendStatus(404);
      if (err) return res.sendStatus(500);

      posts.unlikingPost(post_id, user_id, (err) => {
        if (err) return res.sendStatus(403);

        return res.sendStatus(200);
      });
    });
  });
};

//export the functions so that they can be accesed by other files
module.exports = {
  add_post: add_post,
  get_post: get_post,
  update_post: update_post,
  delete_post: delete_post,
  add_like: add_like,
  remove_like: remove_like,
};
