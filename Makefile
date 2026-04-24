COMPOSE = docker compose -f docker-compose.dev.yml
DATA_DIR = /home/$(USER)/data
FRONT_DIR = ./app-frontend
BACK_DIR = ./app-backend
LOG_DIR = ./logs
BACK_PID_FILE = .backend.pid
FRONT_PID_FILE = .frontend.pid

all: help

help:
	@echo "Available commands:"
	@echo "  make dev        - Start database container, backend, and frontend"
	@echo "  make dev-status - Show backend/frontend process IDs"
	@echo "  make dev-stop   - Stop apps and run clean (down + prune)"
	@echo "  make migrate    - Run backend migrations"
	@echo "  make seed       - Run backend seeds"
	@echo "  make db-init    - Run migrations and seeds"
	@echo "  make up         - Start database container"
	@echo "  make down       - Stop database container"
	@echo "  make shell-db   - Open psql shell in postgres container"
	@echo "  make clean      - Stop containers and prune docker resources"
	@echo "  make fclean     - clean + remove volumes + data dir"
	@echo "  make re         - Full reset and start"

up:
	mkdir -p $(DATA_DIR)/postgresql
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

shell-db:
	$(COMPOSE) exec postgres psql -U postgres transcendence_db

migrate:
	@cd $(BACK_DIR) && { [ -d node_modules ] || npm install; }
	@cd $(BACK_DIR) && npm run migration:run

seed:
	@cd $(BACK_DIR) && { [ -d node_modules ] || npm install; }
	@cd $(BACK_DIR) && npm run seed:run

db-init: migrate seed
	@echo "Database initialized (migrations + seeds)."

dev: up
	@echo "Starting backend and frontend..."
	@mkdir -p $(LOG_DIR)
	@if [ -f $(BACK_PID_FILE) ]; then kill $$(cat $(BACK_PID_FILE)) 2>/dev/null || true; rm -f $(BACK_PID_FILE); fi
	@if [ -f $(FRONT_PID_FILE) ]; then kill $$(cat $(FRONT_PID_FILE)) 2>/dev/null || true; rm -f $(FRONT_PID_FILE); fi
	@cd $(BACK_DIR) && { [ -d node_modules ] || npm install; }
	@(cd $(BACK_DIR) && npm run start:dev > ../$(LOG_DIR)/backend.log 2>&1) & echo $$! > $(BACK_PID_FILE)
	@cd $(FRONT_DIR) && { [ -d node_modules ] || npm install; }
	@(cd $(FRONT_DIR) && npm run dev -- --port 5173 --strictPort > ../$(LOG_DIR)/frontend.log 2>&1) & echo $$! > $(FRONT_PID_FILE)
	@echo "Backend log: $(LOG_DIR)/backend.log"
	@echo "Frontend log: $(LOG_DIR)/frontend.log"
	@echo "Frontend running at: http://localhost:5173/"
	@echo "Backend API at: http://localhost:3000/examrank"
	@echo "Use 'make dev-status' to check processes and 'make dev-stop' to stop them"

dev-status:
	@echo "Backend PID: $$(cat $(BACK_PID_FILE) 2>/dev/null || echo not-running)"
	@echo "Frontend PID: $$(cat $(FRONT_PID_FILE) 2>/dev/null || echo not-running)"

dev-stop: clean
	@if [ -f $(BACK_PID_FILE) ]; then kill $$(cat $(BACK_PID_FILE)) 2>/dev/null || true; rm -f $(BACK_PID_FILE); fi
	@if [ -f $(FRONT_PID_FILE) ]; then kill $$(cat $(FRONT_PID_FILE)) 2>/dev/null || true; rm -f $(FRONT_PID_FILE); fi
	@echo "Backend and frontend stopped; clean completed"

clean: down
	docker system prune -af

fclean: dev-stop
	docker volume rm $(shell docker volume ls -q) 2>/dev/null || true
	sudo rm -rf $(DATA_DIR)

re: fclean dev

.PHONY: all help up down shell-db migrate seed db-init dev dev-status dev-stop clean fclean re