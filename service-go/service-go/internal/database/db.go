package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDB() {

	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host,
		port,
		user,
		password,
		dbname,
	)

	var err error

	for i := 0; i < 10; i++ {

		DB, err = sql.Open("postgres", connStr)

		if err == nil {

			err = DB.Ping()

			if err == nil {
				fmt.Println("PostgreSQL Connected")
				return
			}
		}

		log.Println("Waiting for PostgreSQL...")

		time.Sleep(3 * time.Second)
	}

	log.Fatal("Could not connect to PostgreSQL: ", err)
}