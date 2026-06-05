# Makefile for Hazjak Project

.PHONY: help install start dev build test lint load-test clean docker-build docker-run docker-stop deploy

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

start: ## Start development server
	npm start

dev: ## Start development server with auto-open
	npm run dev

build: ## Build for production
	npm run build

test: ## Run tests
	npm test

lint: ## Run linting
	npm run lint

load-test: ## Run load testing
	npm run load-test

clean: ## Clean build artifacts
	rm -rf node_modules
	rm -rf dist
	rm -rf .cache

docker-build: ## Build Docker image
	docker-compose build

docker-run: ## Run with Docker
	docker-compose up -d

docker-stop: ## Stop Docker containers
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

deploy: ## Deploy to production (placeholder)
	@echo "Deploy command not implemented yet"
	@echo "Add your deployment script here"

# Development helpers
format: ## Format code
	@echo "Formatting code..."
	# Add prettier or other formatters here

validate: ## Validate code
	@echo "Validating code..."
	npm run lint
	npm test

# Database helpers (for future backend)
db-migrate: ## Run database migrations
	@echo "Database migration not implemented yet"

db-seed: ## Seed database
	@echo "Database seeding not implemented yet"

# Monitoring
monitor: ## Start monitoring (placeholder)
	@echo "Monitoring not implemented yet"

# Backup
backup: ## Create backup
	@echo "Backup not implemented yet"