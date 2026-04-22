COMPOSE = docker compose -f docker-compose.dev.yml
 
help:
	@echo ""
	@echo "  make up          -> Inicia o ambiente dev"
	@echo "  make down        -> Para os containers"
	@echo "  make build       -> Reconstroi as imagens"
	@echo "  make restart     -> Reinicia os containers"
	@echo "  make logs        -> Logs de todos os servicos"
	@echo "  make logs-back   -> Logs do backend"
	@echo "  make logs-front  -> Logs do frontend"
	@echo "  make shell-back  -> Shell no container backend"
	@echo "  make shell-db    -> psql no container da BD"
	@echo ""
 
up:
	$(COMPOSE) up -d --build

up-db:
	$(COMPOSE) db
 
down:
	$(COMPOSE) down
 
build:
	$(COMPOSE) build
 
restart:
	$(COMPOSE) restart
 
logs:
	$(COMPOSE) logs -f
 
logs-back:
	$(COMPOSE) logs -f app-backend
 
logs-front:
	$(COMPOSE) logs -f app-frontend
 
shell-back:
	$(COMPOSE) exec app-backend sh
 
shell-db:
	$(COMPOSE) exec db psql -U postgres plataforma

.PHONY: help up down build restart logs logs-back logs-front shell-back shell-db