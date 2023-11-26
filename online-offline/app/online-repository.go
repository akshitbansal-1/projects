package app

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

const expiration int = 8

type OnlineRepository interface {
	SetOnline(userId string) error
	GetUserOnlineStatus(userId string) (*UserStatus, error)
}

type onlineRepository struct {
	redis *redis.Client
}

func NewOnlineRepository() OnlineRepository {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})
	return &onlineRepository{rdb}
}

func (or *onlineRepository) SetOnline(userId string) error {
	return or.redis.Set(context.Background(), userId, true, time.Duration(expiration*int(time.Second))).Err()
}

func (or *onlineRepository) GetUserOnlineStatus(userId string) (*UserStatus, error) {
	val, err := or.redis.Get(context.Background(), userId).Result()
	if err == redis.Nil {
		return &UserStatus{isOnline: false}, nil
	}

	if err != nil {
		return nil, errors.New("Unable to get status for the user")
	}

	if val == "" {
		return &UserStatus{isOnline: false}, nil
	} else {
		isOnline, _ := strconv.ParseBool(val)
		if isOnline {
			return &UserStatus{isOnline: true}, nil
		} else {
			return &UserStatus{isOnline: false}, nil
		}
	}
}
