const express = require("express");
const { publishEvent } = require("../kafka");
const router = express.Router();

router.post("/event", async (req, res) => {
  const event = req.body;

  if (
    !event ||
    !event.playerId ||
    !event.matchId ||
    !event.type ||
    !event.score
  ) {
    return res.status(400).json({ error: "Invalid event payload" });
  }

  try {
    await publishEvent(event);
    res.status(200).json({ status: "Event published" });
  } catch (err) {
    res.status(500).json({ error: "Failed to publish event" });
  }
});

module.exports = router;
