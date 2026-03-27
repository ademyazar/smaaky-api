require("dotenv").config();
require("./config/db");

console.log("INDEX FILE GERÇEKTEN ÇALIŞTI");

const express = require("express");
const app = express();

app.use(express.json());

const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const cors = require("cors");
app.use(cors());
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/debug", (req, res) => {
  res.json({ message: "debug route aktif" });
});

app.get("/", (req, res) => {
  res.send("Smaaky API çalışıyor 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server çalışıyor: ${PORT}`);
});