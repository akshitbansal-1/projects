package main

import (
	"fmt"
	"time"

	flow_apis "github.com/akshitbansal-1/async-testing/be/api/flow"
	teams_apis "github.com/akshitbansal-1/async-testing/be/api/teams"
	"github.com/akshitbansal-1/async-testing/be/app"
	"github.com/akshitbansal-1/async-testing/be/config"
	"github.com/akshitbansal-1/async-testing/be/repository/cache"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func main() {
	config := config.NewConfig()
	app := app.NewApp(config)

	NewServer(app)
}

func NewServer(app app.App) {
	server := fiber.New()

	// add rate limiter
	addRateLimiter(server, app)
	server.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	registerApis(server, app)
	server.Listen(":3000")
}

func addRateLimiter(server *fiber.App, app app.App) {
	server.Use(limiter.New(limiter.Config{
		Max: 20,
		KeyGenerator: func(c *fiber.Ctx) string {
			return fmt.Sprintf("rl:%s", c.IP())
		},
		LimiterMiddleware: limiter.SlidingWindow{},
		Expiration:        1 * time.Minute,
		Storage:           cache.NewCustomRateLimiterStorage(app.GetCacheClient()),
	}))
}

func registerApis(server *fiber.App, app app.App) {

	v1Group := server.Group("/api/v1")
	teams_apis.RegisterRoutes(v1Group, app)
	flow_apis.RegisterRoutes(v1Group, app)
}
