package main

import (
	application "github.com/akshitbansal-1/online-offline-tracker/app"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()
	application.RegisterRoutes(app)
	app.Listen(":3000")
}
