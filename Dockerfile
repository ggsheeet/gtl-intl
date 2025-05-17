# Build stage
FROM golang:1.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -tags !dev -ldflags="-w -s" -o gtl-intl .

# Final stage
FROM scratch AS production
COPY --from=builder /app/gtl-intl /gtl-intl
ENV PORT=8080
EXPOSE 8080
CMD ["/gtl-intl"]