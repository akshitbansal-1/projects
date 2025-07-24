const express = require("express");
const teamService = require("../services/teamService");
const router = express.Router();

router.put("/user/:userId/match/:matchId/team", async (req, res) => {
  const { userId, matchId } = req.params;
  const { playerIds } = req.body;

  //   if (!Array.isArray(playerIds) || playerIds.length !== 11) {
  //     return res
  //       .status(400)
  //       .json({ error: "Team must contain exactly 11 player IDs in an array." });
  //   }
  //   const uniquePlayerIds = new Set(playerIds);
  //   if (uniquePlayerIds.size !== 11) {
  //     return res
  //       .status(400)
  //       .json({ error: "Duplicate player IDs found in the team." });
  //   }

  try {
    await teamService.updateUserTeam(userId, matchId, playerIds);
    res
      .status(200)
      .json({ status: "Team updated successfully", team: playerIds });
  } catch (error) {
    console.error("Error in teamRoutes.js updating team:", error);
    res.status(500).json({ error: "Failed to update team." });
  }
});

router.get("/user/:userId/match/:matchId/team", async (req, res) => {
  const { userId, matchId } = req.params;
  try {
    const playerIds = await teamService.getUserTeam(userId, matchId);
    if (playerIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No team found for this user and match." });
    }
    res.status(200).json({ userId, matchId, team: playerIds });
  } catch (error) {
    console.error("Error in teamRoutes.js fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team." });
  }
});

module.exports = router;
