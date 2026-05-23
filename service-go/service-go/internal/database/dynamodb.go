package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var DynamoClient *dynamodb.Client

func ConnectDynamoDB() {

	region := os.Getenv("AWS_REGION")
	endpoint := os.Getenv("DYNAMODB_ENDPOINT")

	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithRegion(region),
	)

	if err != nil {
		log.Fatal(err)
	}

	DynamoClient = dynamodb.NewFromConfig(
		cfg,
		func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String(endpoint)
		},
	)

	for i := 0; i < 10; i++ {

		_, err := DynamoClient.ListTables(
			context.TODO(),
			&dynamodb.ListTablesInput{},
		)

		if err == nil {
			log.Println("DynamoDB Connected")
			return
		}

		log.Println("Waiting for DynamoDB...")

		time.Sleep(3 * time.Second)
	}

	log.Fatal("Could not connect to DynamoDB")
}