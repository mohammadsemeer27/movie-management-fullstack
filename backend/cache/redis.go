package cache

import (
	"context"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

var Ctx = context.Background()

func ConnectRedis() error {
	redisURL := os.Getenv("REDIS_URL")

	if redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			return err
		}

		RedisClient = redis.NewClient(opt)
	} else {
		RedisClient = redis.NewClient(&redis.Options{
			Addr: os.Getenv("REDIS_ADDR"),
		})
	}

	_, err := RedisClient.Ping(Ctx).Result()

	return err
}

func Set(key string, value string, expiration time.Duration) error {
	return RedisClient.Set(Ctx, key, value, expiration).Err()
}

func Get(key string) (string, error) {
	return RedisClient.Get(Ctx, key).Result()
}

func Delete(key string) error {
	return RedisClient.Del(Ctx, key).Err()
}
