const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool(config.pg);

// Function to connect and test the database connection
const connectDb = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL pool connected successfully.");
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err.message);
    throw err; // Re-throw to prevent server from starting without DB connection
  }
};

// Expose a function to query the database
const query = (text, params) => pool.query(text, params);

module.exports = {
  connectDb,
  query,
  pool, // Export pool directly if more advanced transactions are needed
};
