package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

func genId() string {
	return strconv.Itoa(int(time.Now().UnixNano()))
}

func AjaxResponse(w http.ResponseWriter, resp interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	b, err := json.Marshal(resp)
	msg := string(b)
	if err != nil {
		msg = `{"error":true,"msg":"Server error. Please try again."}`
	}
	fmt.Fprint(w, msg)
}
