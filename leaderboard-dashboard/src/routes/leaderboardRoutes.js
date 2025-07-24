const express = require("express");
const leaderboardService = require("../services/leaderboardService");
const router = express.Router();

// Get Top K users for a match
// GET /api/leaderboard/:matchId/top/:k
router.get("/leaderboard/:matchId/top/:k", async (req, res) => {
  const { matchId, k } = req.params;
  const limit = parseInt(k, 10);

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "K must be a positive integer." });
  }

  try {
    const topUsers = await leaderboardService.getTopUsers(matchId, limit);
    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ error: "Failed to fetch top users." });
  }
});

// Get rank and score of a specific user in a match
// GET /api/leaderboard/:matchId/user/:userId
router.get("/leaderboard/:matchId/user/:userId", async (req, res) => {
  const { matchId, userId } = req.params;

  try {
    const userRankData = await leaderboardService.getUserRankAndScore(
      matchId,
      userId
    );
    if (userRankData === null) {
      return res
        .status(404)
        .json({ message: "User not found in leaderboard for this match." });
    }
    res.status(200).json(userRankData);
  } catch (error) {
    console.error("Error fetching user rank and score:", error);
    res.status(500).json({ error: "Failed to fetch user rank and score." });
  }
});

module.exports = router;
