package main

import (
	"log"

	"service-go/internal/database"
	"service-go/internal/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {

	database.ConnectDB()

	app := fiber.New()

	routes.SetupRoutes(app)

	log.Fatal(app.Listen(":3000"))
}