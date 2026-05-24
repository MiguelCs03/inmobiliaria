package routes

import (
	"service-go/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	app.Get("/", handlers.RootHandler)
	
	app.Post("/contracts", handlers.CreateContract)
	app.Get("/contracts", handlers.GetContracts)

	app.Post("/contracts/verify", handlers.VerifyContract)

	app.Get("/audit-logs", handlers.GetAuditLogs)
}