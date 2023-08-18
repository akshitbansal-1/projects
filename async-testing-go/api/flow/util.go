package flow_apis

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/akshitbansal-1/async-testing/be/app"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	FLOW_DB_NAME         = "test"
	FLOW_COLLECTION_NAME = "flow"
)

func addFlow(app app.App, flow *Flow) (*string, error) {
	dbClient := app.GetMongoClient()
	coll := dbClient.Database(FLOW_DB_NAME).Collection(FLOW_COLLECTION_NAME)

	data, err := bson.Marshal(*flow)
	if err != nil {
		fmt.Println(err.Error())
		return nil, errors.New("Unable to save data")
	}

	result, err := coll.InsertOne(context.Background(), data)
	if err != nil {
		fmt.Println(err.Error())
		return nil, errors.New("Unable to save flow data")
	}

	id := result.InsertedID.(primitive.ObjectID).Hex()
	return &id, nil
}

func getFlows(app app.App) ([]Flow, error) {
	dbClient := app.GetMongoClient()
	coll := dbClient.Database(FLOW_DB_NAME).Collection(FLOW_COLLECTION_NAME)

	ctx := context.Background()
	// get all the records
	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		fmt.Println(err.Error())
		return nil, errors.New("Unable to get flows from DB")
	}

	defer cursor.Close(ctx)
	flows := []Flow{}
	for cursor.Next(ctx) {
		var flow Flow
		err := cursor.Decode(&flow)
		if err != nil {
			log.Println("Decode error. Unable to decode data.", err)
			continue
		}

		for idx := range flow.Steps {
			// convert mongo format to required format
			step := &flow.Steps[idx]
			kv := step.Meta.(primitive.D)
			mp := make(map[string]interface{})
			for k, v := range kv.Map() {
				mp[k] = v
			}
			step.Meta = mp
		}
		flows = append(flows, flow)
	}

	if err := cursor.Err(); err != nil {
		fmt.Println("Unable to get flows", err.Error())
		return nil, errors.New("An unknown error occurred")
	}

	return flows, nil
}
