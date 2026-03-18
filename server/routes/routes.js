const router = require("express").Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const routes = await pool.query("SELECT * FROM routes");
  res.json(routes.rows);
});

router.post("/", async (req, res) => {
  const { departure_station, arrival_station, stops } = req.body;

  const newRoute = await pool.query(
    "INSERT INTO routes (departure_station, arrival_station, stops) VALUES ($1,$2,$3) RETURNING *",
    [departure_station, arrival_station, stops]
  );

  res.json(newRoute.rows[0]);
});

module.exports = router;