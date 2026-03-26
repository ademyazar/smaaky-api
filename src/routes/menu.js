const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Menu query hatası:", err);
      return res.status(500).json({ error: "Database fout" });
    }

    res.json(results);
  });
});

module.exports = router;