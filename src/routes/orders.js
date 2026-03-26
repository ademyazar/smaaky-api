const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Test sipariş oluştur
router.get("/create-test", (req, res) => {
  const orderSql = `
    INSERT INTO orders (
      customer_name,
      customer_phone,
      customer_address,
      total_price
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    orderSql,
    ["Adem", "0612345678", "Rotterdam", 19.95],
    (err, orderResult) => {
      if (err) {
        console.error("Test order insert hatası:", err);
        return res.status(500).json({ error: "Test sipariş eklenemedi" });
      }

      const orderId = orderResult.insertId;

      const itemSql = `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price_each,
          line_total
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        itemSql,
        [orderId, 1, 2, 9.95, 19.90],
        (itemErr, itemResult) => {
          if (itemErr) {
            console.error("Test order item insert hatası:", itemErr);
            return res.status(500).json({ error: "Test sipariş item eklenemedi" });
          }

          res.json({
            message: "Test sipariş oluşturuldu",
            orderId: orderId,
            itemId: itemResult.insertId
          });
        }
      );
    }
  );
});

// Tüm siparişleri getir
router.get("/", (req, res) => {
  const sql = "SELECT * FROM orders ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Orders query hatası:", err);
      return res.status(500).json({
        error: "Siparişler alınamadı"
      });
    }

    res.json(results);
  });
});

// Tek sipariş detayını getir
router.get("/:id", (req, res) => {
  const orderId = req.params.id;

  const orderSql = "SELECT * FROM orders WHERE id = ?";
  const itemsSql = `
    SELECT 
      oi.*,
      p.name,
      p.description
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;

  db.query(orderSql, [orderId], (err, orderResults) => {
    if (err) {
      console.error("Order detail hatası:", err);
      return res.status(500).json({ error: "Sipariş alınamadı" });
    }

    if (orderResults.length === 0) {
      return res.status(404).json({ error: "Sipariş bulunamadı" });
    }

    db.query(itemsSql, [orderId], (itemErr, itemResults) => {
      if (itemErr) {
        console.error("Order items detail hatası:", itemErr);
        return res.status(500).json({ error: "Sipariş ürünleri alınamadı" });
      }

      res.json({
        order: orderResults[0],
        items: itemResults
      });
    });
  });
});

// Yeni sipariş oluştur
router.post("/", (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_address,
    items
  } = req.body;

  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "customer_name ve items zorunlu"
    });
  }

  let totalPrice = 0;

  for (const item of items) {
    totalPrice += Number(item.line_total);
  }

  const orderSql = `
    INSERT INTO orders (
      customer_name,
      customer_phone,
      customer_address,
      total_price
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    orderSql,
    [customer_name, customer_phone || null, customer_address || null, totalPrice],
    (err, orderResult) => {
      if (err) {
        console.error("Order insert hatası:", err);
        return res.status(500).json({
          error: "Sipariş kaydedilemedi"
        });
      }

      const orderId = orderResult.insertId;

      const itemSql = `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price_each,
          line_total
        )
        VALUES ?
      `;

      const itemValues = items.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price_each,
        item.line_total
      ]);

      db.query(itemSql, [itemValues], (itemErr) => {
        if (itemErr) {
          console.error("Order items insert hatası:", itemErr);
          return res.status(500).json({
            error: "Sipariş ürünleri kaydedilemedi"
          });
        }

        res.status(201).json({
          message: "Sipariş oluşturuldu",
          orderId: orderId
        });
      });
    }
  );
});

module.exports = router;