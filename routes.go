package main

import (
	"log"
	"net/http"
	"time"

	"github.com/cagnosolutions/web"
)

var home = web.Route{"GET", "/", func(w http.ResponseWriter, r *http.Request) {
	tmpl.Render(w, r, "calendar.tmpl", nil)
}}

var events = web.Route{"GET", "/event", func(w http.ResponseWriter, r *http.Request) {
	var events []Event
	start, end := r.FormValue("start"), r.FormValue("end")

	if start != "" && end != "" {

		t, err := time.Parse("2006-01-02", start)
		if err != nil {
			log.Printf("\nroutes.go >> events >> time.Parse(start) >> %v\n", err)
			goto defaultEvents
		}
		startTS := t.UnixNano()

		t, err = time.Parse("2006-01-02", end)
		if err != nil {
			log.Printf("\nroutes.go >> events >> time.Parse(end) >> %v\n", err)
			goto defaultEvents
		}
		endTS := t.UnixNano()

		// db.TestQuery("event", &events, adb.Gt("startTS", strconv.Itoa(int(startTS-1))), adb.Lt("startTS", strconv.Itoa(int(endTS+1))))
		var events2 []Event
		db.All("event", &events)

		for _, event := range events {
			if event.StartTS > startTS-1 || event.EndTS < endTS+1 {
				events2 = append(events2, event)
			}
		}

		AjaxResponse(w, events2)
		return
	}

defaultEvents:
	db.All("event", &events)
	AjaxResponse(w, events)
	return
}}

var saveEvent = web.Route{"POST", "/event", func(w http.ResponseWriter, r *http.Request) {
	var event Event
	r.ParseForm()
	web.FormToStruct(&event, r.Form, "")
	t, err := time.Parse("2006-01-02T15:04:05", event.Start)
	if err != nil {
		log.Printf("\nroutes.go >> saveEvent >> time.Parse(event.Start) >> %v\n", err)
		AjaxResponse(w, map[string]interface{}{"error": false, "msg": "Error saving event"})
		return
	}
	event.StartTS = t.UnixNano()
	t, err = time.Parse("2006-01-02T15:04:05", event.End)
	if err != nil {
		log.Printf("\nroutes.go >> saveEvent >> time.Parse(event.End) >> %v\n", err)
		AjaxResponse(w, map[string]interface{}{"error": false, "msg": "Error saving event"})
		return
	}
	event.EndTS = t.UnixNano()

	if event.Id == "" {
		event.Id = genId()
	}
	db.Set("event", event.Id, event)
	AjaxResponse(w, map[string]interface{}{"error": false, "msg": "Successfully saved event"})
	return
}}

var getEvent = web.Route{"GET", "/event/:id", func(w http.ResponseWriter, r *http.Request) {
	var event Event
	ok := db.Get("event", r.FormValue(":id"), &event)
	AjaxResponse(w, map[string]interface{}{"error": !ok, "data": event})
	return
}}

var delEvent = web.Route{"DELETE", "/event/:id", func(w http.ResponseWriter, r *http.Request) {
	db.Del("event", r.FormValue(":id"))
	AjaxResponse(w, map[string]interface{}{"error": false, "msg": "Successfully deleted event"})
}}
