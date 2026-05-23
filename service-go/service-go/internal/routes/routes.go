package routes

import (
	"service-go/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	app.Get("/service-go", handlers.RootHandler)
	app.Post("/contracts", handlers.CreateContract)
	app.Get("/contracts", handlers.GetContracts)
}