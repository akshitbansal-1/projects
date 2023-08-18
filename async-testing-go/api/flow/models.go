package flow_apis

type StepStatus string

const (
	SUCCESS StepStatus = "SUCCESS"
	ERROR   StepStatus = "ERROR"
)

type Flow struct {
	Name    string `json:"name"`
	Id      string `json:"id"`
	Creator string `json:"email"`
	Steps   []Step `json:"steps"`
}

type Step struct {
	Name     string      `json:"name"`
	Function string      `json:"function"`
	Type     string      `json:"type,omitempty"`
	Meta     interface{} `json:"meta"`
	Value    interface{} `json:"-" bson:"-"`
}

type StepError struct {
	Expected string `json:"expected,omitempty"`
	Actual   string `json:"actual,omitempty"`
	Error    string `json:"error,omitempty"`
}

type StepResponse struct {
	Name     string      `json:"name,omitempty"`
	Function string      `json:"function,omitempty"`
	Status   StepStatus  `json:"status"`
	Response interface{} `json:"response"`
}

type HTTPRequest struct {
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Body    interface{}       `json:"body"`
	Headers map[string]string `json:"headers"`
}

type HTTPResponse struct {
	Status   int    `json:"status"`
	Response string `json:"response"`
}

type PublishRequest struct {
	ProjectId string   `json:"projectId"`
	TopicName string   `json:"topicName"`
	Messages  []string `json:"messages"`
}

type PublishResponse struct {
	MessageIds []string `json:"messageIds"`
}

type SubscribeRequest struct {
	ProjectId        string `json:"projectId"`
	SubscriptionName string `json:"subscriptionName"`
}

type SubscribeResponse struct {
	Messagess []string `json:"messagess"`
}

type PurgeSubscriptionsRequest struct {
	ProjectId         string   `json:"projectId"`
	SubscriptionNames []string `json:"subscriptions"`
}
