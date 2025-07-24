const { query, pool } = require("../db");
const Redis = require("ioredis");
const config = require("../config");

// Redis client for the 'player:<playerId>' sets for Flink
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

// Graceful shutdown for Redis client
process.on("exit", () => {
  if (redisClient) {
    console.log("Disconnecting Redis client for teamService...");
    redisClient.quit();
    console.log("Redis client for teamService disconnected.");
  }
});
const getUserTeam = async (userId, matchId) => {
  const res = await query(
    "SELECT player_id FROM user_teams WHERE user_id = $1 AND match_id = $2",
    [userId, matchId]
  );
  return res.rows.map((row) => row.player_id);
};

const updateUserTeam = async (userId, matchId, newPlayerIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start PostgreSQL transaction

    const oldPlayersRes = await client.query(
      "SELECT player_id FROM user_teams WHERE user_id = $1 AND match_id = $2",
      [userId, matchId]
    );
    const oldPlayerIds = oldPlayersRes.rows.map((row) => row.player_id);

    await client.query(
      "DELETE FROM user_teams WHERE user_id = $1 AND match_id = $2",
      [userId, matchId]
    );

    const insertPromises = newPlayerIds.map((playerId) =>
      client.query(
        "INSERT INTO user_teams(user_id, match_id, player_id) VALUES($1, $2, $3)",
        [userId, matchId, playerId]
      )
    );
    await Promise.all(insertPromises);

    await client.query("COMMIT"); // Commit PostgreSQL transaction

    // --- Start Redis Update (after successful PostgreSQL commit) ---
    const multi = redisClient.multi();

    const playersToRemoveUserFrom = oldPlayerIds.filter(
      (id) => !newPlayerIds.includes(id)
    );
    for (const playerId of playersToRemoveUserFrom) {
      // CORRECTED KEY: include matchId
      multi.srem(`player:${matchId}:${playerId}`, userId);
    }

    const playersToAddUserTo = newPlayerIds.filter(
      (id) => !oldPlayerIds.includes(id)
    );
    for (const playerId of playersToAddUserTo) {
      // CORRECTED KEY: include matchId
      multi.sadd(`player:${matchId}:${playerId}`, userId);
    }

    await multi.exec(); // Execute Redis transaction

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating user team:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getUserTeam,
  updateUserTeam,
};
