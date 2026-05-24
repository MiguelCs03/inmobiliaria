package handlers

import (
	"service-go/internal/services"

	"github.com/gofiber/fiber/v2"
)

type VerifyRequest struct {
	DocumentHash string `json:"document_hash"`
	Signature    string `json:"signature"`
}

func VerifyContract(c *fiber.Ctx) error {

	var body VerifyRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err := services.VerifyContract(
		body.DocumentHash,
		body.Signature,
	)

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"valid": false,
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"valid": true,
		"message": "contract verified",
	})
}