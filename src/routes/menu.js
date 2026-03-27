const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.is_available,
      p.category_id,
      c.name AS category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY c.sort_order ASC, p.id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Menu query hatası:", err);
      return res.status(500).json({ error: "Database fout" });
    }

    res.json(results);
  });
});

module.exports = router;