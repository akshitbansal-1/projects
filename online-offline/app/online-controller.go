package app

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	svc := NewOnlineService()
	controller := controller{
		svc,
	}
	app.Get("/status/:id", controller.GetStatus)
	app.Post("status/:id", controller.SetUserOnlineStatus)

}

type controller struct {
	svc OnlineService
}

func (ct *controller) GetStatus(c *fiber.Ctx) error {
	userId := c.Params("id")
	result, err := ct.svc.GetUserOnlineStatus(userId)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(err.Error())
	}

	return c.JSON(result.isOnline)
}

func (ct *controller) SetUserOnlineStatus(c *fiber.Ctx) error {
	userId := c.Params("id")
	userStatus := UserStatus{}
	err := c.BodyParser(&userStatus)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(err.Error())
	}

	err = ct.svc.SetUserOnlineStatus(userId, userStatus.isOnline)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(err.Error())
	}

	return c.SendStatus(http.StatusOK)
}
