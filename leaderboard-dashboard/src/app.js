const express = require("express");
const bodyParser = require("body-parser");

const eventRoutes = require("./routes/eventRoutes");
const teamRoutes = require("./routes/teamRoutes");
const playerRoutes = require("./routes/playerRoutes");
const userRoutes = require("./routes/userRoutes");
const matchRoutes = require("./routes/matchRoutes"); // Ensure this is here
const leaderboardRoutes = require("./routes/leaderboardRoutes"); // NEW: Import leaderboard routes

const app = express();

app.use(bodyParser.json());

app.use("/api", eventRoutes);
app.use("/api", teamRoutes);
app.use("/api", playerRoutes);
app.use("/api", userRoutes);
app.use("/api", matchRoutes); // Ensure this is here
app.use("/api", leaderboardRoutes); // NEW: Register leaderboard routes

module.exports = app;
