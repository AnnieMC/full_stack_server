const db = require("../../database"); //function that interact with the database

//1st "post" details as a JSON, 2nd function called "done"-this is called a callback function and
//allows the code calling the function to define what happens when the addNewPost function has finished
const addNewPost = (post, user_id, done) => {
  const sql = `INSERT INTO posts (text, date_published, author_id) 
                 VALUES (?, ?, ?)`;
  let values = [post.text, Date.now(), user_id];
  db.run(sql, values, function (err) {
    //run()function allows us to access this.lastID for accessing the primary key of the record that has just been added to the database
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

//The "post_id of the post we want to retrieve", and callback "done"  so that the calling code can specify what happens afterwards.
const getSinglePost = (post_id, done) => {
  const sql = `SELECT p.post_id, p.date_published, p.text, 
                 u.user_id, u.first_name, u.last_name, u.username 
                 FROM posts p, users u 
                 WHERE p.post_id=? 
                 AND p.author_id = u.user_id`;
  db.get(sql, [post_id], function (err, post_details) {
    //------1st db interaction------
    if (err) return done(err);
    if (!post_details) return done(404); //----------------------

    //Now we will executes another db interaction to get the likes
    const sql = `SELECT u.user_id, u.first_name, u.last_name, u.username 
                     FROM users u, likes l 
                     WHERE l.post_id=? 
                     AND l.user_id = u.user_id`;
    const likes = []; //Empty array where we store the like
    db.each(
      //------2nd db interaction------
      sql, //SQL Statement
      [post_id], //Parameters - get likes for posts with this ID
      (err, row) => {
        //Execute this function for each like
        if (err) return done(err);
        likes.push({
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          username: row.username,
        });
      },
      (err, num_rows) => {
        //Execute this function once finished

        if (err) return done(err);
        return done(null, {
          post_id: post_details.post_id,
          timestamp: post_details.date_published,
          text: post_details.text,
          author: {
            user_id: post_details.user_id,
            first_name: post_details.first_name,
            last_name: post_details.last_name,
            username: post_details.username,
          },
          likes: likes,
        });
      }
    );
  });
};

const updatePost = (post_id, new_text, done) => {
  const sql = `UPDATE posts SET text=? 
                 WHERE post_id=?`;
  db.run(sql, [new_text, post_id], (err) => {
    return done(err);
  });
};

const deletePost = (post_id, done) => {
  const sql = `DELETE FROM posts 
                 WHERE post_id=?`;
  db.run(sql, [post_id], (err) => {
    return done(err);
  });
};

const likingPost = (post_id, user_id, done) => {
  const sql = `INSERT INTO likes (post_id, user_id)
                VALUES(?, ?)`;
  db.run(sql, [post_id, user_id], (err) => {
    return done(err);
  });
};

const unlikingPost = (post_id, user_id, done) => {
  const check_post_id = `SELECT COUNT(*) as count FROM likes 
                           WHERE post_id = ?
                           AND user_id = ?`;

  const sql = `DELETE FROM likes 
                 WHERE post_id = ? 
                 AND user_id = ?`;

  db.get(check_post_id, [post_id, user_id], (err, row) => {
    if (row.count == 0) return done(403);

    db.run(sql, [post_id, user_id], (err) => {
      return done(err);
    });
  });
};

//export the functions so that they can be accesed by other files
module.exports = {
  addNewPost: addNewPost,
  getSinglePost: getSinglePost,
  updatePost: updatePost,
  deletePost: deletePost,
  likingPost: likingPost,
  unlikingPost: unlikingPost,
};
