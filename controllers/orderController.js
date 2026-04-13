const logger = require("../config/logger");
const pool = require("../db");

exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { items } = req.body;
    const user_id = req.user.user_id;

    let total = 0;

    // STEP 1: validate + calculate total + update stock
    for (let item of items) {
      const [product] = await connection.query(
        "SELECT * FROM products WHERE id = ? AND is_deleted = FALSE FOR UPDATE",
        [item.product_id]
      );

      if (product.length === 0) {
        return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      }

      if (product[0].stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${item.product_id}` });
      }

      total += product[0].price * item.quantity;

      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // STEP 2: create order (NOW order_id exists)
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
      [user_id, total]
    );

    const order_id = orderResult.insertId;

    // STEP 3: insert order items (second loop)
    for (let item of items) {
      const [product] = await connection.query(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );

      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [order_id, item.product_id, item.quantity, product[0].price]
      );
    }

    await connection.commit();

    res.json({ message: "Order created" });

  } catch (err) {
    await connection.rollback();
    logger.error(`Create Order Failed: ${err.message}`);
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
};
exports.cancelOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE id = ? FOR UPDATE",
      [id]
    );

    if (orders.length === 0) {
      throw new Error("Order not found");
    }

    const order = orders[0];

    if (order.status === "CANCELLED") {
      throw new Error("Order already cancelled");
    }

    // get items
    const [items] = await connection.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id]
    );

    // restore stock
    for (let item of items) {
      await connection.query(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // update status
    await connection.query(
      "UPDATE orders SET status = 'CANCELLED' WHERE id = ?",
      [id]
    );

    await connection.commit();

    res.json({ message: "Order cancelled" });

  } catch (err) {
    await connection.rollback();
    logger.error(`Cancel Order Failed: ${err.message}`);
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
};

exports.getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  const [orders] = await pool.query(
    "SELECT * FROM orders LIMIT ? OFFSET ?",
    [limit, offset]
  );

  const [count] = await pool.query(
    "SELECT COUNT(*) as total FROM orders"
  );

  res.json({
    total: count[0].total,
    page,
    limit,
    data: orders,
  });
};