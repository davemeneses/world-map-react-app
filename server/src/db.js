const monk = require("monk");
// const db = monk(process.env.DATABASE_URL);
const db = monk(
  "mongodb://user:rootroot1@ds149806.mlab.com:49806/heroku_xg7xt3f1"
);

module.exports = db;
