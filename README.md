# Transcendence

vite - version 8.0.9
react - 19.2.5
npm - version 9.2.0
nestjs - vresion 11.0.21

rodar o front no modo desenvolvimento:
cd app-frontend
npm install
npm run dev

rodar o back no modo desenvolvimento:
cd app-backend
npm install
npm run start:dev


# 1. Correr a migration
npm run migration:run

# 2. Popular a tabela
npm run seed:run

NOTA: Qualquer alteracao da estrutura da bd deve ser definida 
atraves da migration; E qualquer valor que seja parte da regra
de negocio, deve ser definida atraves de seeds
