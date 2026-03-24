const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Routes working");
});

router.post("/", (req, res) => {
  console.log("POST /routes hit");
  res.json({ message: "Route added" });
});

module.exports = router;