package services

import (
	"crypto/sha256"
	"fmt"

	"service-go/internal/models"
	"service-go/internal/repositories"

	"github.com/google/uuid"
)

func CreateContract(title string) error {

	hash := sha256.Sum256([]byte(title))

	contract := models.Contract{
		ID:           uuid.New().String(),
		Title:        title,
		DocumentHash: fmt.Sprintf("%x", hash),
	}

	return repositories.CreateContract(contract)
}

func GetContracts() ([]models.Contract, error){
	return repositories.GetContracts()
}