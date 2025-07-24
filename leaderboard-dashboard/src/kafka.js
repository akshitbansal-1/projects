const { Kafka } = require("kafkajs");
const config = require("./config");

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

const producer = kafka.producer();

const initKafkaProducer = async () => {
  await producer.connect();
};

const publishEvent = async (event) => {
  const kafkaMessage = {
    topic: config.kafka.topic,
    messages: [
      {
        key: event.playerId.toString(),
        value: JSON.stringify(event),
      },
    ],
  };

  try {
    await producer.send(kafkaMessage);
    console.log("Published to Kafka:", event);
  } catch (err) {
    console.error("Kafka publish error:", err);
    throw err; // Propagate error for API endpoint to handle
  }
};

// Graceful shutdown for Kafka producer
process.on("exit", async () => {
  if (producer) {
    console.log("Disconnecting Kafka producer...");
    await producer.disconnect();
    console.log("Kafka Producer disconnected.");
  }
});

module.exports = {
  initKafkaProducer,
  publishEvent,
};
