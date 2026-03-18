const router = require("express").Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const trips = await pool.query("SELECT * FROM trips");
  res.json(trips.rows);
});

module.exports = router;