const { Kafka, } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["127.0.0.1:9092"],
  producer: {
    // Set the linger.ms value
    'batchSize': 10*1024,
    'linger.ms': 20
  }
});

module.exports = kafka;
