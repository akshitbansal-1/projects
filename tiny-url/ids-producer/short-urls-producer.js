const { Kafka } = require("kafkajs");
const base62 = require("base62");
const getLastCheckpoint = require("./numbers-checkpoint");

const kafka = new Kafka({
  clientId: "url-ids-producer",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  idempotent: true,
});

/**
 * This function publishes messages to kafka topic.
 * @param topic - topic of the kafka
 * @param messages - The `messages` parameter is an array of short ids
 */
async function publishMessages(topic, messages) {
  await producer.send({
    topic,
    messages,
  });
}

/**
 * Get last save checkpoint from DB after which we will start creating random url ids.
 */
async function getNumbersCheckpoint() {
  return await getLastCheckpoint();
}

/**
 * This function generates an array of numbers to encode based on a given last checkpoint and a
 * specified number of IDs.
 * @param lastCheckpoint - `lastCheckpoint` is a variable that represents the last checkpoint of
 * numbers that were encoded. It is used to determine which numbers to encode next. In the function,
 * it is also being passed as a parameter, but it is not necessary since it is being assigned a value
 * using `await getNumbersCheckpoint
 * @returns The function `generateNumbers` is returning an array of numbers to encode.
 */
async function generateNumbers() {
  const numbersToEncode = [];
  const lastCheckpoint = await getNumbersCheckpoint();
  const idsCount = Number(process.env.PRODUCER_IDS_COUNT);
  for (let i = lastCheckpoint; i < lastCheckpoint + idsCount; i++) {
    numbersToEncode.push(i);
  }
  return numbersToEncode;
}

async function encodeAndPublishNumbers() {
  const numbers = await generateNumbers();
  const topic = "url-ids";
  let publishedRecords = 0;
  try {
    await producer.connect();
    let messages = [];
    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];
      const encodedNumber = base62.encode(number);
      publishedRecords++;
      messages.push({
        value: encodedNumber,
      });

      if (messages.length === 1e4) {
        await publishMessages(topic, messages);
        messages = [];
      }
    }
    if (messages.length) {
      await publishMessages(topic, messages);
      messages = [];
    }
    console.log('Published records:', publishedRecords);
  } catch (error) {
    console.error("Error occurred:", error.message);
  } finally {
    console.log("Pushed messages");
    await producer.disconnect();
  }
}

module.exports = {
  encodeAndPublishNumbers,
};
