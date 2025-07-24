const { query } = require("../db");

const createMatch = async (matchId, matchName, startTime, endTime) => {
  const res = await query(
    "INSERT INTO matches(match_id, match_name, start_time, end_time) VALUES($1, $2, $3, $4) RETURNING *",
    [matchId, matchName, startTime, endTime]
  );
  return res.rows[0];
};

const getMatchById = async (matchId) => {
  const res = await query("SELECT * FROM matches WHERE match_id = $1", [
    matchId,
  ]);
  return res.rows[0];
};

module.exports = {
  createMatch,
  getMatchById,
};
