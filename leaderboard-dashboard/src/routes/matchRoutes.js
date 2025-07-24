const express = require("express");
const matchService = require("../services/matchService");
const router = express.Router();

router.post("/matches", async (req, res) => {
  const { matchId, matchName, startTime, endTime } = req.body;
  if (!matchId || !matchName || !startTime || !endTime) {
    return res
      .status(400)
      .json({
        error: "Match ID, Name, Start Time, and End Time are required.",
      });
  }
  try {
    const newMatch = await matchService.createMatch(
      matchId,
      matchName,
      startTime,
      endTime
    );
    res.status(201).json(newMatch);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: `Match with ID '${matchId}' already exists.` });
    }
    console.error("Error creating match:", error);
    res.status(500).json({ error: "Failed to create match." });
  }
});

router.get("/matches/:matchId", async (req, res) => {
  try {
    const match = await matchService.getMatchById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }
    res.status(200).json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ error: "Failed to fetch match." });
  }
});

module.exports = router;
