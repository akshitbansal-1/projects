const Redis = require("ioredis");
const config = require("../config");

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

process.on("exit", () => {
  if (redisClient) {
    console.log("Disconnecting Redis client for leaderboardService...");
    redisClient.quit();
    console.log("Redis client for leaderboardService disconnected.");
  }
});

const getTopUsers = async (matchId, k) => {
  const leaderboardKey = `leaderboard:${matchId}`;
  // ZREVRANGE fetches elements in descending order (highest score first)
  // WITHSCORSES includes the score with each member
  const result = await redisClient.zrevrange(
    leaderboardKey,
    0,
    k - 1,
    "WITHSCORES"
  );

  // Parse the result into a more readable array of objects
  const topUsers = [];
  for (let i = 0; i < result.length; i += 2) {
    topUsers.push({
      userId: result[i],
      score: parseFloat(result[i + 1]), // Scores are strings, convert to float
      rank: Math.floor(i / 2) + 1, // Rank starts from 1
    });
  }
  return topUsers;
};

const getUserRankAndScore = async (matchId, userId) => {
  const leaderboardKey = `leaderboard:${matchId}`;

  // ZREVRANK gives the 0-based rank in descending order (higher score = lower rank)
  // ZSCORE gives the score
  const rank = await redisClient.zrevrank(leaderboardKey, userId);
  const score = await redisClient.zscore(leaderboardKey, userId);

  if (rank === null || score === null) {
    return null; // User not found in leaderboard for this match
  }

  return {
    userId: userId,
    score: parseFloat(score),
    rank: rank + 1, // Convert 0-based rank to 1-based rank
  };
};

module.exports = {
  getTopUsers,
  getUserRankAndScore,
};
