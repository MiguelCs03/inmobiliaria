package handlers

import (
	"service-go/internal/services"

	"github.com/gofiber/fiber/v2"
)

type CreateContractRequest struct {
	Title string `json:"title"`
}

func CreateContract(c *fiber.Ctx) error {

	var body CreateContractRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request",
		})
	}

	err := services.CreateContract(body.Title)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Contract created",
	})
}

func GetContracts(c *fiber.Ctx) error {
	contracts, err := services.GetContracts()

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(contracts)
}

func GetContract(c *fiber.Ctx) error {

	id := c.Params("id")

	contract, err := services.GetContractByID(id)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if contract == nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "contract not found",
		})
	}

	return c.JSON(contract)
}