const Redis = require("ioredis");
const redis = new Redis();

const players = [
  "Virat Kohli",
  "MS Dhoni",
  "Rohit Sharma",
  "Jasprit Bumrah",
  "Ravindra Jadeja",
  "KL Rahul",
  "Shikhar Dhawan",
  "Hardik Pandya",
  "Bhuvneshwar Kumar",
  "Yuzvendra Chahal",
];

// Let's say we want to assign 1 million users randomly to players
const TOTAL_USERS = 1_000_000;
const BATCH_SIZE = 10000; // pipeline batch size

async function bulkInsert() {
  let userId = 1;
  while (userId <= TOTAL_USERS) {
    const pipeline = redis.pipeline();

    for (let i = 0; i < BATCH_SIZE && userId <= TOTAL_USERS; i++, userId++) {
      // Pick a random player for this user
      const player = players[Math.floor(Math.random() * players.length)];

      // Add user to player's set
      pipeline.sadd(`player:${player}`, `user${userId}`);
    }

    await pipeline.exec();
    console.log(`Inserted up to user${userId - 1}`);
  }

  console.log("Bulk insert completed.");
  redis.quit();
}

bulkInsert().catch(console.error);
