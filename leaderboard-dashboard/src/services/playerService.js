const { query } = require("../db");

const createPlayer = async (playerId, playerName, teamName, role) => {
  const res = await query(
    "INSERT INTO players(player_id, player_name, team_name, role) VALUES($1, $2, $3, $4) RETURNING *",
    [playerId, playerName, teamName, role]
  );
  return res.rows[0];
};

const getPlayerById = async (playerId) => {
  const res = await query("SELECT * FROM players WHERE player_id = $1", [
    playerId,
  ]);
  return res.rows[0];
};

const getAllPlayers = async () => {
  const res = await query("SELECT * FROM players");
  return res.rows;
};

// Add update/delete functions if needed

module.exports = {
  createPlayer,
  getPlayerById,
  getAllPlayers,
};
