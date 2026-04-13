const  pool  = require("../db");

exports.createProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  console.log(name, price, stock)
  await pool.query(
    "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
    [name, price, stock]
  );

  res.json({ message: "Product created" });
};

exports.getProducts = async (req, res) => {
  const [products] = await pool.query("SELECT * FROM products");
  res.json(products);
};