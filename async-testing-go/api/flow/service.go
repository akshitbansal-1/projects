package flow_apis

import (
	"github.com/akshitbansal-1/async-testing/be/app"
)

type Service interface {
	AddFlow(flow *Flow) (*string, error)
	ValidateSteps(flow *Flow) error
	RunFlow(ch chan<- *StepResponse, flow *Flow) error
	GetFlows() ([]Flow, error)
}

type service struct {
	app app.App
}

func NewService(app app.App) Service {
	return &service{app}
}

func (s*service) GetFlows() ([]Flow, error) {
	return getFlows(s.app)
}

func (s *service) AddFlow(flow *Flow) (*string, error) {
	steps := flow.Steps
	if err := validateSteps(steps); err != nil {
		return nil, err
	}

	return addFlow(s.app, flow)
}

func (s *service) ValidateSteps(flow *Flow) error {
	steps := flow.Steps
	err := validateSteps(steps)
	return err
}

func (s *service) RunFlow(ch chan<- *StepResponse, flow *Flow) error {
	if err := validateSteps(flow.Steps); err != nil {
		ch <- &StepResponse{
			"",
			"",
			ERROR,
			&StepError{
				Error: "Invalid steps",
			},
		}
		return nil
	}

	return RunFlow(ch, s.app, flow)
}