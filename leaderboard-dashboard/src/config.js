module.exports = {
  port: process.env.PORT || 3000,
  kafka: {
    clientId: "match-events-api",
    brokers: process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(",")
      : ["localhost:9092"],
    topic: "match-events",
  },
  pg: {
    user: process.env.PG_USER || "myuser", // Change me!
    host: process.env.PG_HOST || "localhost",
    database: process.env.PG_DATABASE || "fantasy_dashboard",
    password: process.env.PG_PASSWORD || "123", // Change me!
    port: process.env.PG_PORT || 5432,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
};
