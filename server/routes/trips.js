const router = require("express").Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const trips = await pool.query("SELECT * FROM trips");
  res.json(trips.rows);
});

router.post("/", async (req, res) => {
  const { train_id } = req.body;

  const newTrip = await pool.query(
    "INSERT INTO trips (train_id) VALUES ($1) RETURNING *",
    [train_id]
  );

  res.json(newTrip.rows[0]);
});

module.exports = router;