package repositories

import (
	"context"

	"service-go/internal/database"
	"service-go/internal/models"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func CreateContract(contract models.Contract) error {

	item, err := attributevalue.MarshalMap(contract)

	if err != nil {
		return err
	}

	_, err = database.DynamoClient.PutItem(
		context.TODO(),
		&dynamodb.PutItemInput{
			TableName: awsString("contracts"),
			Item:      item,
		},
	)

	return err
}

func GetContracts() ([]models.Contract, error) {

	result, err := database.DynamoClient.Scan(
		context.TODO(),
		&dynamodb.ScanInput{
			TableName: awsString("contracts"),
		},
	)

	if err != nil {
		return nil, err
	}

	var contracts []models.Contract

	err = attributevalue.UnmarshalListOfMaps(
		result.Items,
		&contracts,
	)

	if err != nil {
		return nil, err
	}

	return contracts, nil
}

func awsString(s string) *string {
	return &s
}