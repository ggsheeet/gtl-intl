package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		logger.Error("Error loading .env file: %v", err)
		// Don't exit in production, just log the error
	}
	router := http.NewServeMux()

	router.HandleFunc("/", handleIndex)
	router.HandleFunc("/contact-request", handleContactRequest)

	// Use the embedded static file handler
	router.Handle("/public/", http.StripPrefix("/public/", serveStaticFiles()))

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Server starting on :%s", port)
	logger.Error("%v", http.ListenAndServe(":"+port, router))
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	logger.Info("Serving index page to %s", r.RemoteAddr)
	// Use the embedded filesystem to serve index.html
	indexFile, err := publicFS.Open("public/html/index.html")
	if err != nil {
		logger.Error("Error opening index.html: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer indexFile.Close()
	http.ServeContent(w, r, "index.html", time.Now(), indexFile.(io.ReadSeeker))
}

func handleContactRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		logger.Warning("Invalid method %s from %s", r.Method, r.RemoteAddr)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Company  string `json:"company"`
		Message  string `json:"message"`
		Industry string `json:"industry"`
		Interest string `json:"interest"`
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		logger.Error("Error reading request body from %s: %v", r.RemoteAddr, err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &req)
	if err != nil {
		logger.Error("Error unmarshaling request from %s: %v", r.RemoteAddr, err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = SendContactNotificationEmail(req.Name, req.Email, req.Company, req.Message, req.Industry, req.Interest)
	if err != nil {
		logger.Error("Failed to send notification email: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
	colorPurple = "\033[35m"
	colorCyan   = "\033[36m"
)

const (
	INFO    = "INFO"
	WARNING = "WARNING"
	ERROR   = "ERROR"
	DEBUG   = "DEBUG"
)

type ColoredLogger struct {
	*log.Logger
}

func NewColoredLogger(prefix string) *ColoredLogger {
	return &ColoredLogger{
		Logger: log.New(os.Stdout, prefix, log.Ltime),
	}
}

func (l *ColoredLogger) Info(format string, v ...interface{}) {
	l.Printf("%s[%s]%s %s", colorGreen, INFO, colorReset, fmt.Sprintf(format, v...))
}

func (l *ColoredLogger) Warning(format string, v ...interface{}) {
	l.Printf("%s[%s]%s %s", colorYellow, WARNING, colorReset, fmt.Sprintf(format, v...))
}

func (l *ColoredLogger) Error(format string, v ...interface{}) {
	l.Printf("%s[%s]%s %s", colorRed, ERROR, colorReset, fmt.Sprintf(format, v...))
}

func (l *ColoredLogger) Debug(format string, v ...interface{}) {
	l.Printf("%s[%s]%s %s", colorBlue, DEBUG, colorReset, fmt.Sprintf(format, v...))
}

var logger = NewColoredLogger("")
