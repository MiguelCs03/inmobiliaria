package handlers

import (
	"service-go/internal/audit"

	"github.com/gofiber/fiber/v2"
)

func GetAuditLogs(c *fiber.Ctx) error {

	audits, err := audit.GetAuditLogs()

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(audits)
}