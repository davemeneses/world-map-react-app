const monk = require("monk");
const db = monk(process.env.REACT_APP_DATABASE_URL);

module.exports = db;
