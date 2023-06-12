const kafka = require("../repository/kafka");
const urlIds = {
  count: 0,
  data: [],
};
let isConsumerRunning = false,
  isConnected = false,
  consumer;

/**
 * This function connects a Kafka consumer to a specified topic.
 * @param topic - The topic parameter is a string that represents the name of the Kafka topic that the
 * consumer will subscribe to.
 */
async function connectKafkaConsumer(topic) {
  consumer = kafka.consumer({ groupId: "shorturl" });
  await consumer.connect();
  await consumer.subscribe({ topic });
}

/**
 * This function fetches a specified number of messages from a Kafka topic and returns them as an array
 * of short IDs.
 * @param topic - The Kafka topic from which messages are to be fetched.
 * @param numberOfMessages - The number of messages that the function should fetch from the Kafka
 * topic.
 * @returns A promise is being returned.
 */
async function fetchMessages(topic, numberOfMessages) {
  if (!isConnected) {
    await connectKafkaConsumer(topic);
    isConnected = true;
  }

  const shortIds = [];
  return new Promise(async (resolve, reject) => {
    if (isConsumerRunning) {
      // parallel requests can cause this, return empty array for those requests
      resolve([]);
    }
    let timeout = setTimeout(() => {
      reject(new Error("Timeout while fetching short url ids"));
    }, 10 * 1000);
    try {
      isConsumerRunning = true;
      await consumer.run({
        eachMessage: ({ topic, partition, message }) => {
          shortIds.push(message.value.toString());
          // Stop consuming messages once the desired number is reached
          if (shortIds.length === numberOfMessages) {
            clearTimeout(timeout);
            isConsumerRunning = false;
            consumer.stop();
            resolve(shortIds);
          }
        },
      });
    } catch (error) {
      reject(error);
      console.error(`Error consuming messages: ${error}`);
    }
  });
}

/**
 * The function saves a list of short URLs and increments a count for each URL added.
 * @param shortUrls - `shortUrls` is an array of strings representing shortened URLs that need to be
 * saved. The function `saveUrlIds` takes this array as a parameter and adds each URL to an object
 * called `urlIds`. The `count` property of `urlIds` is incremented for each URL added to
 */
function saveUrlIds(shortUrls) {
  for (const shortUrl of shortUrls) {
    urlIds.count++;
    urlIds.data.push(shortUrl);
  }
}

/**
 * This function caches a required number of short URL IDs by fetching them from a Kafka message queue.
 */
async function cacheIds() {
  const requiredShortIds = 2e4;
  const shortUrls = await fetchMessages("url-ids", requiredShortIds);
  if (shortUrls.length < requiredShortIds) {
    throw new Error("Less number of messages received from kafka");
  }
  saveUrlIds(shortUrls);
}

/**
 * This function returns a short ID by popping it from a cached data array.
 * @returns the value of the `shortId` variable, which is the last element of the `data` array in the
 * `urlIds` object.
 */
async function getShortId() {
  if (urlIds.count < 10 * 1000) {
    cacheIds();
  } else if (urlIds.count < 1000) {
    await cacheIds();
  }

  const shortId = urlIds.data.pop();
  urlIds.count--;
  return shortId;
}

module.exports = {
  cacheIds,
  getShortId,
};
