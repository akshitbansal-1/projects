const express = require("express");
const userService = require("../services/userService");
const router = express.Router();

router.post("/users", async (req, res) => {
  const { userId, username } = req.body;
  if (!userId || !username) {
    return res
      .status(400)
      .json({ error: "User ID and username are required." });
  }
  try {
    const newUser = await userService.createUser(userId, username);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique violation error code
      return res
        .status(409)
        .json({
          error: `User with ID '${userId}' or username '${username}' already exists.`,
        });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
});

router.get("/users/:userId", async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

module.exports = router;
