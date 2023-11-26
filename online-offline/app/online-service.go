package app

type OnlineService interface {
	GetUserOnlineStatus(userId string) (*UserStatus, error)
	SetUserOnlineStatus(userId string, status bool) error
}

type onlineService struct {
	repo OnlineRepository
}

func NewOnlineService() OnlineService {
	repo := NewOnlineRepository()
	return &onlineService{
		repo,
	}
}

func (o *onlineService) GetUserOnlineStatus(userId string) (*UserStatus, error) {
	return o.repo.GetUserOnlineStatus(userId)
}

func (o *onlineService) SetUserOnlineStatus(userId string, status bool) error {
	return o.repo.SetOnline(userId)
}
