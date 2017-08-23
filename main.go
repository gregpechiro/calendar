package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/cagnosolutions/adb"
	"github.com/cagnosolutions/web"
)

var tmpl *web.TmplCache
var mux *web.Mux
var db *adb.DB = adb.NewDB()

func init() {
	mux = web.NewMux()
	tmpl = web.NewTmplCache()

	mux.AddRoutes(home, events, saveEvent, getEvent, delEvent)
	db.AddStore("event")
}

func main() {
	fmt.Println(">>> DID YOU REGISTER ANY NEW ROUTES <<<")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
