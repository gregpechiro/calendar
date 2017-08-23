package main

type Event struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Start       string `json:"start"`
	StartTS     int64  `json:"startTS"`
	End         string `json:"end"`
	EndTS       int64  `json:"endTS"`
}
