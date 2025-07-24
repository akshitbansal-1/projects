const express = require("express");
const playerService = require("../services/playerService");
const router = express.Router();

router.post("/players", async (req, res) => {
  const { playerId, playerName, teamName, role } = req.body;
  if (!playerId || !playerName) {
    return res.status(400).json({ error: "Player ID and Name are required." });
  }
  try {
    const newPlayer = await playerService.createPlayer(
      playerId,
      playerName,
      teamName,
      role
    );
    res.status(201).json(newPlayer);
  } catch (error) {
    // Check for unique constraint violation
    if (error.code === "23505") {
      // PostgreSQL unique violation error code
      return res
        .status(409)
        .json({ error: `Player with ID '${playerId}' already exists.` });
    }
    console.error("Error creating player:", error);
    res.status(500).json({ error: "Failed to create player." });
  }
});

router.get("/players/:playerId", async (req, res) => {
  try {
    const player = await playerService.getPlayerById(req.params.playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }
    res.status(200).json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ error: "Failed to fetch player." });
  }
});

router.get("/players", async (req, res) => {
  try {
    const players = await playerService.getAllPlayers();
    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching all players:", error);
    res.status(500).json({ error: "Failed to fetch players." });
  }
});

module.exports = router;
