const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const constants = require("../config/constant");
const pool = require("../db");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );

    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (users.length === 0) {
return res.status(400).json({ message: "User not found" });  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }


const token = jwt.sign(
  { user_id: user.id },
  constants.JWT.SECRET,
  { expiresIn: constants.JWT.EXPIRES_IN }
);

  res.json({ token });
};