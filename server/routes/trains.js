const router = require("express").Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const trains = await pool.query("SELECT * FROM trains");
  res.json(trains.rows);
});

router.post("/", async (req, res) => {
  const { train_number } = req.body;

  const newTrain = await pool.query(
    "INSERT INTO trains (train_number) VALUES ($1) RETURNING *",
    [train_number]
  );

  res.json(newTrain.rows[0]);
});

module.exports = router;