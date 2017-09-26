package main

const (
	CLOCK = iota
	WORK
)

var ActivityStates = map[string]int{
	"CLOCK": CLOCK,
	"WORK":  WORK,
}

type Event struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Start       string `json:"start"`
	StartTS     int64  `json:"startTS"`
	End         string `json:"end"`
	EndTS       int64  `json:"endTS"`
}

type Activity struct {
	Id      string `json:"id"`
	UserId  string `json:"userId"`
	GroupId string `json:"groupId"`
	EventId string `json:"eventId"`
	Type    int    `json:"type"`
	Start   int64  `json:"start"`
	End     int64  `json:"end"`
	Notes   string `json:"notes"`
}
