const app = require("./src/app");
const { initKafkaProducer } = require("./src/kafka");
const { connectDb } = require("./src/db");
const config = require("./src/config");

const PORT = config.port;

const startServer = async () => {
  try {
    // Initialize Kafka Producer
    await initKafkaProducer();
    console.log("Kafka Producer connected.");

    // Connect to PostgreSQL
    await connectDb();
    console.log("PostgreSQL database connected.");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Initiating graceful shutdown...");
  // Disconnect Kafka producer (handled internally by kafka.js on module unload)
  // Close DB connection (handled internally by db.js on process exit)
  process.exit(0);
});

startServer();
