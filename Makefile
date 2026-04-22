COMPOSE = docker compose -f docker-compose.dev.yml
DATA_DIR = /home/$(USER)/data
FRONT_DIR = ./app-frontend
BACK_DIR = ./app-backend

all: up

up:
	mkdir -p $(DATA_DIR)/postgresql
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

shell-db:
	$(COMPOSE) exec db psql -U postgres plataforma

clean: down
	docker system prune -af

fclean: clean
	docker volume rm $(shell docker volume ls -q) 2>/dev/null || true
	sudo rm -rf $(DATA_DIR)

re: fclean all

.PHONY: all up down shell-db clean fclean re