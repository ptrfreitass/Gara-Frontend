# GARA - Sistema Web

Angular Core

## 🚀 Stack Tecnológica

- **Frontend**: Angular (SPA)

## 📁 Estrutura do Projeto
gara_frontend/      # Angular (TailwindCSS, SPA)
├── public/         # 
├── src/            # 
├── angular.json/   # 
├── package*.json/  # 
└── Dockerfile      # Orquestração de containers


## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Docker 29.2.1
- Docker Compose 2.8.10
- Git

### Subir ambiente de desenvolvimento

```bash
# Subir todos os serviços com hot reload
./scripts/dev-up.sh

# Ou manualmente
docker-compose -f docker-compose.dev.yml up -d
Acessar serviços
Frontend: http://localhost:4200
Backend API: http://localhost:8000
Nginx (Proxy): http://localhost
Mailhog UI: http://localhost:8025
PostgreSQL: localhost:5432
Parar ambiente
bash
Copy
./scripts/dev-down.sh

# Ou manualmente
docker-compose -f docker-compose.dev.yml down