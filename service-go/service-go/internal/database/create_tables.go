package database

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"

	dynamodbtypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func CreateContractsTable() {

	_, err := DynamoClient.CreateTable(
		context.TODO(),
		&dynamodb.CreateTableInput{
			TableName: awsString("contracts"),

			AttributeDefinitions: []dynamodbtypes.AttributeDefinition{
				{
					AttributeName: awsString("id"),
					AttributeType: dynamodbtypes.ScalarAttributeTypeS,
				},
			},

			KeySchema: []dynamodbtypes.KeySchemaElement{
				{
					AttributeName: awsString("id"),
					KeyType:       dynamodbtypes.KeyTypeHash,
				},
			},

			BillingMode: dynamodbtypes.BillingModePayPerRequest,
		},
	)

	if err != nil {
		log.Println(err)
		return
	}

	log.Println("contracts table created")
}

func awsString(s string) *string {
	return &s
}