package repositories

import (
	"service-go/internal/database"
	"service-go/internal/models"
)

func CreateContract(contract models.Contract) error {

	query := `
	INSERT INTO contracts (id, title, document_hash)
	VALUES ($1, $2, $3)
	`

	_, err := database.DB.Exec(
		query,
		contract.ID,
		contract.Title,
		contract.DocumentHash,
	)

	return err
}

func GetContracts() ([]models.Contract, error){
	query :=  `
	SELECT id, title, document_hash
	FROM contracts
	`
	rows, err := database.DB.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var contracts []models.Contract

	for rows.Next(){
		var contract models.Contract

		err := rows.Scan(
			&contract.ID,
			&contract.Title,
			&contract.DocumentHash,
		)

		if err != nil {
			return nil,err
		}
		contracts = append(contracts, contract)
	}
	return contracts, nil
}