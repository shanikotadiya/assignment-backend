const mysql = require("mysql2/promise");
const constants = require("../config/constant");

const pool = mysql.createPool({
  host: constants.DB.HOST,
  user: constants.DB.USER,
  password: constants.DB.PASSWORD,
  database: constants.DB.NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;