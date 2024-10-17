const db = require("../../database");
const crypto = require("crypto");

const getHash = (password, salt) => {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 256, "sha256")
    .toString("hex");
};

const addNewUser = (user, done) => {
  //POST - User
  const salt = crypto.randomBytes(64);
  const hash = getHash(user.password, salt);

  const sql = `INSERT INTO users (first_name, last_name, username, password, salt)
                 VALUES (?,?,?,?,?)`;
  let valuesnewUser = [
    user.first_name,
    user.last_name,
    user.username,
    hash,
    salt.toString("hex"),
  ];

  db.run(sql, valuesnewUser, function (err) {
    if (err) {
      console.log(err);
      if (err.errno === 19) {
        return done(400);
      }
      return done(err);
    } else {
      return done(err, this.lastID);
    }
  });
};

const authenticateUser = (username, password, done) => {
  //POST - Login
  const sql = `SELECT user_id, password, salt 
                 FROM users
                 WHERE username=?`;

  db.get(sql, [username], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404); //wrong email

    if (row.salt === null) row.salt = "";

    let salt = Buffer.from(row.salt, "hex");

    if (row.password === getHash(password, salt)) {
      return done(false, row.user_id);
    } else {
      return done(404); //wrong password
    }
  });
};

const getToken = (id, done) => {
  const sql = `SELECT session_token FROM users
                 WHERE user_id=?`;

  db.get(sql, [id], (err, row) => {
    console.log(id, row);
    return done(err, row.session_token);
  });
};

const setToken = (id, done) => {
  let token = crypto.randomBytes(16).toString("hex");

  const sql = `UPDATE users SET session_token=?
                 WHERE user_id=?`;

  db.run(sql, [token, id], (err) => {
    return done(err, token);
  });
};

const removeToken = (token, done) => {
  //POST - Log out
  const sql = `UPDATE users SET session_token=null
                 WHERE session_token=?`;

  db.run(sql, [token], (err) => {
    return done(err);
  });
};

const getIDFromToken = (token, done) => {
  const sql = `SELECT user_id 
                 FROM users
                 WHERE session_token=?`;

  db.get(sql, [token], (err, row) => {
    if (!row) return done(404);
    if (err) return done(err);

    return done(err, row.user_id);
  });
};

module.exports = {
  getHash: getHash,
  addNewUser: addNewUser,
  authenticateUser: authenticateUser,
  getToken: getToken,
  setToken: setToken,
  removeToken: removeToken,
  getIDFromToken: getIDFromToken,
};
