package models


type Contract struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	DocumentHash string `json:"document_hash"`
}