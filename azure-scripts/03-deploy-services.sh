#!/bin/bash

###############################################################################
# Script: 03-deploy-services.sh
# Descrição: Deploy dos serviços no Azure Container Apps
# - Deploy da API (Spring Boot)
# - Deploy do Frontend (Next.js)
# - Deploy do Chatbot (Flask)
###############################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções auxiliares
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERRO: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  AVISO: $1${NC}"
}

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."
CONFIG_FILE="$PROJECT_ROOT/azure-config.json"
INFRA_FILE="$PROJECT_ROOT/azure-infrastructure.env"

# Carrega configurações
if [ ! -f "$CONFIG_FILE" ] || [ ! -f "$INFRA_FILE" ]; then
    print_error "Arquivos de configuração não encontrados"
    exit 1
fi

print_step "Carregando configurações..."
source "$INFRA_FILE"

# Extrai configurações do JSON
API_NAME=$(jq -r '.containerApps.api.name' "$CONFIG_FILE")
API_IMAGE=$(jq -r '.containerApps.api.image' "$CONFIG_FILE")
API_PORT=$(jq -r '.containerApps.api.targetPort' "$CONFIG_FILE")
API_CPU=$(jq -r '.containerApps.api.cpu' "$CONFIG_FILE")
API_MEMORY=$(jq -r '.containerApps.api.memory' "$CONFIG_FILE")
API_MIN_REPLICAS=$(jq -r '.containerApps.api.minReplicas' "$CONFIG_FILE")
API_MAX_REPLICAS=$(jq -r '.containerApps.api.maxReplicas' "$CONFIG_FILE")

FRONT_NAME=$(jq -r '.containerApps.frontend.name' "$CONFIG_FILE")
FRONT_IMAGE=$(jq -r '.containerApps.frontend.image' "$CONFIG_FILE")
FRONT_PORT=$(jq -r '.containerApps.frontend.targetPort' "$CONFIG_FILE")
FRONT_CPU=$(jq -r '.containerApps.frontend.cpu' "$CONFIG_FILE")
FRONT_MEMORY=$(jq -r '.containerApps.frontend.memory' "$CONFIG_FILE")
FRONT_MIN_REPLICAS=$(jq -r '.containerApps.frontend.minReplicas' "$CONFIG_FILE")
FRONT_MAX_REPLICAS=$(jq -r '.containerApps.frontend.maxReplicas' "$CONFIG_FILE")

CHATBOT_NAME=$(jq -r '.containerApps.chatbot.name' "$CONFIG_FILE")
CHATBOT_IMAGE=$(jq -r '.containerApps.chatbot.image' "$CONFIG_FILE")
CHATBOT_PORT=$(jq -r '.containerApps.chatbot.targetPort' "$CONFIG_FILE")
CHATBOT_CPU=$(jq -r '.containerApps.chatbot.cpu' "$CONFIG_FILE")
CHATBOT_MEMORY=$(jq -r '.containerApps.chatbot.memory' "$CONFIG_FILE")
CHATBOT_MIN_REPLICAS=$(jq -r '.containerApps.chatbot.minReplicas' "$CONFIG_FILE")
CHATBOT_MAX_REPLICAS=$(jq -r '.containerApps.chatbot.maxReplicas' "$CONFIG_FILE")

# Verifica login
print_step "Verificando login na Azure..."
if ! az account show > /dev/null 2>&1; then
    print_error "Você não está logado na Azure"
    exit 1
fi

print_success "Conectado à Azure"

# 1. Deploy da API
print_step "1/3 - Fazendo deploy da API (Spring Boot)..."

if az containerapp show --name "$API_NAME" --resource-group "$AZURE_RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Container App da API já existe. Atualizando..."
    
    az containerapp update \
        --name "$API_NAME" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --image "${ACR_LOGIN_SERVER}/${API_IMAGE}:latest" \
        --set-env-vars \
            SPRING_DATASOURCE_URL="$MYSQL_CONNECTION_STRING" \
            SPRING_DATASOURCE_USERNAME="$MYSQL_USERNAME" \
            SPRING_DATASOURCE_PASSWORD="$MYSQL_PASSWORD" \
            JWT_SECRET="$JWT_SECRET" \
            JWT_EXPIRATION="$JWT_EXPIRATION" \
            APPLICATIONINSIGHTS_CONNECTION_STRING="$APPLICATIONINSIGHTS_CONNECTION_STRING"
    
    print_success "API atualizada"
else
    az containerapp create \
        --name "$API_NAME" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --environment "$CONTAINER_APPS_ENVIRONMENT" \
        --image "${ACR_LOGIN_SERVER}/${API_IMAGE}:latest" \
        --registry-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --target-port "$API_PORT" \
        --ingress external \
        --cpu "$API_CPU" \
        --memory "$API_MEMORY" \
        --min-replicas "$API_MIN_REPLICAS" \
        --max-replicas "$API_MAX_REPLICAS" \
        --env-vars \
            SPRING_DATASOURCE_URL="$MYSQL_CONNECTION_STRING" \
            SPRING_DATASOURCE_USERNAME="$MYSQL_USERNAME" \
            SPRING_DATASOURCE_PASSWORD="$MYSQL_PASSWORD" \
            JWT_SECRET="$JWT_SECRET" \
            JWT_EXPIRATION="$JWT_EXPIRATION" \
            APPLICATIONINSIGHTS_CONNECTION_STRING="$APPLICATIONINSIGHTS_CONNECTION_STRING"
    
    print_success "API criada e deployada"
fi

# Obtém URL da API
API_URL=$(az containerapp show \
    --name "$API_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --query properties.configuration.ingress.fqdn -o tsv)

API_URL="https://${API_URL}"
print_success "API disponível em: $API_URL"

# 2. Deploy do Chatbot
print_step "2/3 - Fazendo deploy do Chatbot (Flask)..."

if az containerapp show --name "$CHATBOT_NAME" --resource-group "$AZURE_RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Container App do Chatbot já existe. Atualizando..."
    
    az containerapp update \
        --name "$CHATBOT_NAME" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --image "${ACR_LOGIN_SERVER}/${CHATBOT_IMAGE}:latest"
    
    print_success "Chatbot atualizado"
else
    az containerapp create \
        --name "$CHATBOT_NAME" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --environment "$CONTAINER_APPS_ENVIRONMENT" \
        --image "${ACR_LOGIN_SERVER}/${CHATBOT_IMAGE}:latest" \
        --registry-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --target-port "$CHATBOT_PORT" \
        --ingress external \
        --cpu "$CHATBOT_CPU" \
        --memory "$CHATBOT_MEMORY" \
        --min-replicas "$CHATBOT_MIN_REPLICAS" \
        --max-replicas "$CHATBOT_MAX_REPLICAS"
    
    print_success "Chatbot criado e deployado"
fi

# Obtém URL do Chatbot
CHATBOT_URL=$(az containerapp show \
    --name "$CHATBOT_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --query properties.configuration.ingress.fqdn -o tsv)

CHATBOT_URL="https://${CHATBOT_URL}"
print_success "Chatbot disponível em: $CHATBOT_URL"

# 3. Deploy do Frontend
print_step "3/3 - Fazendo deploy do Frontend (Next.js)..."

if az containerapp show --name "$FRONT_NAME" --resource-group "$AZURE_RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Container App do Frontend já existe. Atualizando..."
    
    az containerapp update \
        --name "$FRONT_NAME" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --image "${ACR_LOGIN_SERVER}/${FRONT_IMAGE}:latest" \
        --set-env-vars \
            NEXT_PUBLIC_API_URL="$API_URL" \
            NEXT_PUBLIC_CHATBOT_URL="$CHATBOT_URL"
    
    print_success "Frontend atualizado"
else
    az containerapp create \
        --name "$FRONT_NAME" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --environment "$CONTAINER_APPS_ENVIRONMENT" \
        --image "${ACR_LOGIN_SERVER}/${FRONT_IMAGE}:latest" \
        --registry-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --target-port "$FRONT_PORT" \
        --ingress external \
        --cpu "$FRONT_CPU" \
        --memory "$FRONT_MEMORY" \
        --min-replicas "$FRONT_MIN_REPLICAS" \
        --max-replicas "$FRONT_MAX_REPLICAS" \
        --env-vars \
            NEXT_PUBLIC_API_URL="$API_URL" \
            NEXT_PUBLIC_CHATBOT_URL="$CHATBOT_URL"
    
    print_success "Frontend criado e deployado"
fi

# Obtém URL do Frontend
FRONT_URL=$(az containerapp show \
    --name "$FRONT_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --query properties.configuration.ingress.fqdn -o tsv)

FRONT_URL="https://${FRONT_URL}"
print_success "Frontend disponível em: $FRONT_URL"

# Salva URLs
cat > "$PROJECT_ROOT/azure-urls.txt" << EOF
# URLs dos Serviços Deployados - Gerado em $(date)

Frontend:  $FRONT_URL
API:       $API_URL
Chatbot:   $CHATBOT_URL

# Endpoints úteis:
API Health:      $API_URL/actuator/health
API Metrics:     $API_URL/actuator/metrics
Frontend Health: $FRONT_URL/api/health
Chatbot Health:  $CHATBOT_URL/health
EOF

# Resumo final
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           DEPLOY REALIZADO COM SUCESSO! 🚀                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 URLs dos Serviços:${NC}"
echo ""
echo -e "  ${YELLOW}Frontend:${NC}  $FRONT_URL"
echo -e "  ${YELLOW}API:${NC}       $API_URL"
echo -e "  ${YELLOW}Chatbot:${NC}   $CHATBOT_URL"
echo ""
echo -e "${BLUE}🔍 Monitoramento:${NC}"
echo -e "  Application Insights: https://portal.azure.com/#resource$APPLICATIONINSIGHTS_CONNECTION_STRING"
echo ""
echo -e "${GREEN}As URLs foram salvas em: azure-urls.txt${NC}"
echo ""
