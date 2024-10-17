const db = require("../../database");

const addNewFollower = (user_id, follower_id, done) => {
  const checkUserExistsSql = `SELECT COUNT(*) as count FROM users WHERE user_id = ?`;
  const sql = `INSERT INTO followers (user_id, follower_id)
  VALUES (?, ?)`;

  db.get(checkUserExistsSql, [user_id], (err, row) => {
    if (row.count == 0) return done(404);

    db.run(sql, [user_id, follower_id], (err) => {
      return done(err);
    });
  });
};

const detailsSingleUser = (user_id, done) => {
  /*1st iteraction to get users details*/
  const Usersql = `SELECT u.user_id, u.first_name, u.last_name, u.username 
                     FROM users u
                     WHERE u.user_id=?`;
  db.get(Usersql, [user_id], function (err, user_details) {
    if (err) return done(err);
    if (!user_details) return done(404);

    /*2nd iteraction to get an array of followers*/
    const Followerssql = `SELECT u.user_id, u.first_name, u.last_name, u.username
                               FROM users u
                               JOIN followers f ON u.user_id = f.user_id
                               WHERE f.follower_id = ?`;
    const followers = [];
    db.each(
      Followerssql,
      [user_id],
      (err, row) => {
        if (err) return done(err);
        followers.push({
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          username: row.username,
        });
      },
      (err, num_rows) => {
        if (err) return done(err);

        /*3rd iteration to get an array of following*/
        const Followingsql = `SELECT u.user_id, u.first_name, u.last_name, u.username
                                  FROM users u
                                  JOIN followers f ON u.user_id = f.follower_id
                                  WHERE f.user_id = ?`;
        const following = [];
        db.each(
          Followingsql,
          [user_id],
          (err, row) => {
            if (err) return done(err);
            following.push({
              user_id: row.user_id,
              first_name: row.first_name,
              last_name: row.last_name,
              username: row.username,
            });
          },
          (err, num_rows) => {
            if (err) return done(err);

            /*4th iteration to get the post for each user*/
            const Postsql = `SELECT p.post_id, p.date_published, p.text, u.user_id, u.first_name, u.last_name, u.username 
                                 FROM posts p, users u 
                                 WHERE p.post_id=? 
                                 AND p.author_id = u.user_id`;

            const posts = [];
            db.each(
              Postsql,
              [user_id],
              (err, post_details) => {
                if (err) return done(err);

                posts.push({
                  post_id: post_details.post_id,
                  timestamp: post_details.date_published,
                  text: post_details.text,
                  author: {
                    user_id: post_details.user_id,
                    first_name: post_details.first_name,
                    last_name: post_details.last_name,
                    username: post_details.username,
                  },
                });
              },
              (err, num_rows) => {
                if (err) return done(err);

                /*5th iteration to get likes-post*/
                let count_likes = 0;
                let post_leng = posts.length;

                if (post_leng != 0) {
                  //------
                  posts.forEach((post) => {
                    const LikesSql = `SELECT u.user_id, u.first_name, u.last_name, u.username 
                        FROM users u, likes l 
                        WHERE l.post_id=? 
                        AND l.user_id = u.user_id`;
                    let likes = [];
                    db.each(
                      LikesSql,
                      [post.post_id],
                      (err, row) => {
                        if (err) return done(err);
                        console.log("bunny");
                        likes.push({
                          user_id: row.user_id,
                          first_name: row.first_name,
                          last_name: row.last_name,
                          username: row.username,
                        });
                      },
                      (err, num_rows) => {
                        /*add likes - totalPost */
                        post["likes"] = likes;
                        count_likes++;

                        console.log(count_likes, post_leng);

                        if (count_likes === post_leng) {
                          return done(err, {
                            user_id: user_details.user_id,
                            first_name: user_details.first_name,
                            last_name: user_details.last_name,
                            username: user_details.username,
                            followers: followers,
                            following: following,
                            posts: posts,
                          });
                        }
                      }
                    );
                  });
                } else {
                  return done(err, {
                    user_id: user_details.user_id,
                    first_name: user_details.first_name,
                    last_name: user_details.last_name,
                    username: user_details.username,
                    followers: followers,
                    following: following,
                    totalPost: [],
                  });
                }
              }
            );
          }
        );
      }
    );
  });
};

const stopFollowingaUser = (follower_id, user_id, done) => {
  const check_user_id = `SELECT COUNT(*) as count FROM followers
                           WHERE follower_id=?
                           AND user_id=?`;

  const sql = `DELETE FROM followers
                 WHERE follower_id=?
                 AND user_id=?`;

  db.get(check_user_id, [follower_id, user_id], (err, row) => {
    if (row.count == 0) return done(403);

    db.run(sql, [follower_id, user_id], (err) => {
      return done(err);
    });
  });
};

const searchUsers = (params, done) => {
  const query =
    "SELECT user_id, first_name, last_name, username FROM users WHERE first_name LIKE '%" +
    params.q +
    "%'  OR last_name LIKE '%" +
    params.q +
    "%' OR username LIKE '%" +
    params.q +
    "%' ";

  db.all(query, (err, users) => {
    if (err) return done(err);
    return done(null, users);
  });
};

module.exports = {
  addNewFollower: addNewFollower,
  detailsSingleUser: detailsSingleUser,
  stopFollowingaUser: stopFollowingaUser,
  searchUsers: searchUsers,
};
