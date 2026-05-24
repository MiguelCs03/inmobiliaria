package services

import (
	"service-go/internal/blockchain"
	"service-go/internal/crypto"
	"service-go/internal/models"
	"service-go/internal/repositories"

	"service-go/internal/audit"

	"github.com/google/uuid"
)

func CreateContract(title string) error {

	hash := blockchain.GenerateSHA256(title)

	privateKey, err := crypto.LoadPrivateKey()

	if err != nil {
		return err
	}

	signature, err := crypto.SignData(
		privateKey,
		hash,
	)

	if err != nil {
		return err
	}

	encodedSignature := blockchain.EncodeBase64(signature)

	contract := models.Contract{
		ID:               uuid.New().String(),
		Title:            title,
		DocumentHash:     hash,
		DigitalSignature: encodedSignature,
	}

	err = audit.CreateAuditLog(
	"CREATE_CONTRACT",
	"contract",
	contract.ID,
	contract.DocumentHash,
	contract.DigitalSignature,
	)

	if err != nil {
		return err
	}

	return repositories.CreateContract(contract)
}

func GetContracts() ([]models.Contract, error) {
	return repositories.GetContracts()
}