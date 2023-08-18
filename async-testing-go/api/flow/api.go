package flow_apis

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/akshitbansal-1/async-testing/be/app"
	"github.com/akshitbansal-1/async-testing/be/common_structs"
	"github.com/akshitbansal-1/async-testing/be/utils"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type resource struct {
	app     app.App
	service Service
}

// RegisterRoutes implements Service.
func RegisterRoutes(c fiber.Router, app app.App) {
	resource := &resource{app, NewService(app)}
	c.Post("/flow", resource.addFlow)
	c.Get("/flow", resource.getFlows)
	c.Post("/flow/validate", resource.validateSteps)
	c.Get("/flow/run", websocket.New(resource.runFlow))
}

func (r *resource) getFlows(c *fiber.Ctx) error {
	flows, err := r.service.GetFlows()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(&common_structs.HttpError{
			Msg: "Unable to get flows",
		})
	}

	return c.JSON(flows)
}

func (r *resource) addFlow(c *fiber.Ctx) error {
	var flow *Flow
	var err error
	if flow, err = getFlowObject(c); err != nil {
		return c.Status(http.StatusBadRequest).JSON(&common_structs.HttpError{
			Msg: "Unable to parse the request body",
		})
	}

	uid, err := r.service.AddFlow(flow)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(err.Error())
	}

	return c.Status(http.StatusCreated).
		JSON(uid)
}

func (r *resource) validateSteps(c *fiber.Ctx) error {
	var flow *Flow
	var err error
	if flow, err = getFlowObject(c); err != nil {
		return c.Status(http.StatusBadRequest).JSON(&common_structs.HttpError{
			Msg: "Unable to parse the request body",
		})
	}

	if err := r.service.ValidateSteps(flow); err != nil {
		return c.Status(http.StatusBadRequest).JSON(&common_structs.HttpError{
			Msg: err.Error(),
		})
	}

	return c.SendStatus(http.StatusOK)
}

func (r *resource) runFlow(conn *websocket.Conn) {
	_, msg, err := conn.ReadMessage()
	if err != nil {
		data, _ := utils.ToBytes[StepResponse](StepResponse{
			"",
			"",
			ERROR,
			&StepError{
				Error: "Unable to parse request body",
			},
		})
		conn.WriteMessage(websocket.TextMessage, data)
		return
	}
	var flow *Flow = &Flow{}
	if err := json.Unmarshal(msg, flow); err != nil {
		data, _ := utils.ToBytes[StepResponse](StepResponse{
			"",
			"",
			ERROR,
			&StepError{
				Error: "Unable to get request body",
			},
		})
		conn.WriteMessage(websocket.TextMessage, data)
		return
	}
	ch := make(chan *StepResponse)
	go r.service.RunFlow(ch, flow)

	for resp := range ch {
		data, _ := utils.ToBytes[StepResponse](*resp)
		conn.WriteMessage(websocket.TextMessage, data)
	}

	conn.Close()
}

func getFlowObject(c *fiber.Ctx) (*Flow, error) {
	var flow Flow
	if err := c.BodyParser(&flow); err != nil {
		return nil, errors.New("")
	}

	return &flow, nil
}
