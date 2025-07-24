const { query } = require("../db");

const createUser = async (userId, username) => {
  const res = await query(
    "INSERT INTO users(user_id, username) VALUES($1, $2) RETURNING *",
    [userId, username]
  );
  return res.rows[0];
};

const getUserById = async (userId) => {
  const res = await query("SELECT * FROM users WHERE user_id = $1", [userId]);
  return res.rows[0];
};

const getAllUsers = async () => {
  const res = await query("SELECT * FROM users");
  return res.rows;
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
};
