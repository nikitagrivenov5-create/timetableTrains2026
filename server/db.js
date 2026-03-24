const { Pool } = require("pg");

const pool = new Pool({
  user: "nikitagrivenov",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "trainsdb"
});

module.exports = pool;