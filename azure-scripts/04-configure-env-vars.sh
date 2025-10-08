#!/bin/bash
# ===================================================================
# Script: Configurar Variáveis de Ambiente no Azure
# Descrição: Configura todas as variáveis de ambiente e secrets nos
#            Azure Container Apps (API, Frontend, Chatbot)
# ===================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Carregar configuração
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/azure-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    log_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

# Extrair valores do config
RESOURCE_GROUP=$(jq -r '.azure.resourceGroup' "$CONFIG_FILE")
DB_SERVER=$(jq -r '.database.serverName' "$CONFIG_FILE")
DB_NAME=$(jq -r '.database.databaseName' "$CONFIG_FILE")
DB_ADMIN_USER=$(jq -r '.database.adminUsername' "$CONFIG_FILE")
API_APP=$(jq -r '.containerApps.api.name' "$CONFIG_FILE")
FRONT_APP=$(jq -r '.containerApps.frontend.name' "$CONFIG_FILE")
CHATBOT_APP=$(jq -r '.containerApps.chatbot.name' "$CONFIG_FILE")

echo ""
echo "=============================================="
echo "  🔐 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE"
echo "=============================================="
echo ""

# ===================================================================
# 1. COLETAR INFORMAÇÕES SENSÍVEIS
# ===================================================================

log_info "Vamos coletar as informações necessárias..."
echo ""

# Database Password
echo -n "Digite a senha do Azure Database for MySQL: "
read -s DB_PASSWORD
echo ""

# JWT Secret
log_info "Gerando JWT secret seguro..."
JWT_SECRET=$(openssl rand -base64 32)
log_success "JWT secret gerado: ${JWT_SECRET:0:10}... (256 bits)"
echo ""

# Google API Key
echo -n "Digite sua Google AI (Gemini) API Key: "
read GOOGLE_API_KEY
echo ""

# SerpAPI Key
echo -n "Digite sua SerpAPI Key: "
read SERPAPI_API_KEY
echo ""

# Confirmação
log_warning "Confirme os dados:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Database Server: $DB_SERVER"
echo "  Database Name: $DB_NAME"
echo "  API App: $API_APP"
echo "  Frontend App: $FRONT_APP"
echo "  Chatbot App: $CHATBOT_APP"
echo ""
read -p "Continuar? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_error "Operação cancelada pelo usuário."
    exit 1
fi

# ===================================================================
# 2. CONFIGURAR API (Spring Boot)
# ===================================================================

log_info "Configurando variáveis de ambiente da API..."

# Criar secrets
log_info "Criando secrets da API..."
az containerapp secret set \
  --name "$API_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --secrets \
    db-password="$DB_PASSWORD" \
    jwt-secret="$JWT_SECRET" \
  --output none

log_success "Secrets da API criados"

# Configurar variáveis de ambiente
log_info "Configurando variáveis de ambiente da API..."

# Obter URL do frontend para CORS
FRONT_FQDN=$(az containerapp show \
  --name "$FRONT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv 2>/dev/null || echo "")

if [ -z "$FRONT_FQDN" ]; then
    log_warning "Frontend ainda não deployado. CORS será configurado como '*'"
    CORS_ORIGINS="*"
else
    CORS_ORIGINS="https://$FRONT_FQDN"
    log_success "CORS configurado para: $CORS_ORIGINS"
fi

az containerapp update \
  --name "$API_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars \
    "SPRING_DATASOURCE_URL=jdbc:mysql://${DB_SERVER}.mysql.database.azure.com:3306/${DB_NAME}?useSSL=true&requireSSL=true&serverTimezone=America/Sao_Paulo" \
    "SPRING_DATASOURCE_USERNAME=${DB_ADMIN_USER}@${DB_SERVER}" \
    "SPRING_DATASOURCE_PASSWORD=secretref:db-password" \
    "JWT_SECRET=secretref:jwt-secret" \
    "JWT_EXPIRATION=3600000" \
    "CORS_ALLOWED_ORIGINS=${CORS_ORIGINS}" \
    "SPRING_PROFILES_ACTIVE=prod" \
  --output none

log_success "Variáveis de ambiente da API configuradas"

# ===================================================================
# 3. CONFIGURAR CHATBOT (Flask + Gemini)
# ===================================================================

log_info "Configurando variáveis de ambiente do Chatbot..."

# Criar secrets
log_info "Criando secrets do Chatbot..."
az containerapp secret set \
  --name "$CHATBOT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --secrets \
    google-api-key="$GOOGLE_API_KEY" \
    serpapi-key="$SERPAPI_API_KEY" \
  --output none

log_success "Secrets do Chatbot criados"

# Configurar variáveis de ambiente
log_info "Configurando variáveis de ambiente do Chatbot..."
az containerapp update \
  --name "$CHATBOT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars \
    "GOOGLE_API_KEY=secretref:google-api-key" \
    "SERPAPI_API_KEY=secretref:serpapi-key" \
    "ENVIRONMENT=production" \
    "FLASK_DEBUG=False" \
  --output none

log_success "Variáveis de ambiente do Chatbot configuradas"

# ===================================================================
# 4. CONFIGURAR FRONTEND (Next.js)
# ===================================================================

log_info "Configurando variáveis de ambiente do Frontend..."

# Obter URLs dos outros serviços
API_FQDN=$(az containerapp show \
  --name "$API_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

CHATBOT_FQDN=$(az containerapp show \
  --name "$CHATBOT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

log_info "Configurando variáveis de ambiente do Frontend..."
az containerapp update \
  --name "$FRONT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars \
    "NEXT_PUBLIC_API_URL=https://${API_FQDN}" \
    "NEXT_PUBLIC_CHATBOT_URL=https://${CHATBOT_FQDN}" \
    "NODE_ENV=production" \
  --output none

log_success "Variáveis de ambiente do Frontend configuradas"

# ===================================================================
# 5. VERIFICAR CONFIGURAÇÕES
# ===================================================================

echo ""
log_info "Verificando configurações..."
echo ""

# API
log_info "API Environment Variables:"
az containerapp show \
  --name "$API_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.template.containers[0].env[].{Name:name, Value:value}" \
  --output table

echo ""

# Chatbot
log_info "Chatbot Environment Variables:"
az containerapp show \
  --name "$CHATBOT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.template.containers[0].env[].{Name:name, Value:value}" \
  --output table

echo ""

# Frontend
log_info "Frontend Environment Variables:"
az containerapp show \
  --name "$FRONT_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.template.containers[0].env[].{Name:name, Value:value}" \
  --output table

echo ""

# ===================================================================
# 6. ATUALIZAR CORS DA API (SE NECESSÁRIO)
# ===================================================================

if [ "$CORS_ORIGINS" = "*" ]; then
    log_warning "ATENÇÃO: CORS está configurado como '*' (aceita todas as origens)"
    log_info "Após o deploy do frontend, execute este comando para restringir:"
    echo ""
    echo "  az containerapp update \\"
    echo "    --name $API_APP \\"
    echo "    --resource-group $RESOURCE_GROUP \\"
    echo "    --set-env-vars \"CORS_ALLOWED_ORIGINS=https://$FRONT_APP.azurecontainerapps.io\""
    echo ""
fi

# ===================================================================
# 7. SALVAR INFORMAÇÕES (SEM SECRETS)
# ===================================================================

log_info "Salvando informações de configuração..."

ENV_INFO_FILE="$PROJECT_ROOT/azure-env-info.txt"

cat > "$ENV_INFO_FILE" << EOF
# ===================================================================
# INFORMAÇÕES DE CONFIGURAÇÃO - PASSA BOLA
# Gerado em: $(date)
# ===================================================================

RESOURCE_GROUP=$RESOURCE_GROUP

# Database
DB_SERVER=$DB_SERVER.mysql.database.azure.com
DB_NAME=$DB_NAME
DB_USERNAME=$DB_ADMIN_USER@$DB_SERVER

# Container Apps URLs
API_URL=https://$API_FQDN
FRONTEND_URL=https://$FRONT_FQDN
CHATBOT_URL=https://$CHATBOT_FQDN

# CORS
CORS_ORIGINS=$CORS_ORIGINS

# JWT
JWT_EXPIRATION=3600000 (1 hora)

# Secrets Configurados:
# - db-password (API)
# - jwt-secret (API)
# - google-api-key (Chatbot)
# - serpapi-key (Chatbot)

# ===================================================================
# IMPORTANTE: Este arquivo NÃO contém valores sensíveis.
# Os secrets estão armazenados de forma segura no Azure.
# ===================================================================
EOF

log_success "Informações salvas em: $ENV_INFO_FILE"

# ===================================================================
# 8. REINICIAR CONTAINERS (OPCIONAL)
# ===================================================================

echo ""
read -p "Deseja reiniciar os containers para aplicar as mudanças? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    log_info "Reiniciando API..."
    az containerapp revision restart \
      --name "$API_APP" \
      --resource-group "$RESOURCE_GROUP" \
      --output none
    
    log_info "Reiniciando Chatbot..."
    az containerapp revision restart \
      --name "$CHATBOT_APP" \
      --resource-group "$RESOURCE_GROUP" \
      --output none
    
    log_info "Reiniciando Frontend..."
    az containerapp revision restart \
      --name "$FRONT_APP" \
      --resource-group "$RESOURCE_GROUP" \
      --output none
    
    log_success "Containers reiniciados"
fi

# ===================================================================
# RESUMO FINAL
# ===================================================================

echo ""
echo "=============================================="
log_success "CONFIGURAÇÃO CONCLUÍDA!"
echo "=============================================="
echo ""
log_info "URLs dos Serviços:"
echo "  • API:      https://$API_FQDN"
echo "  • Frontend: https://$FRONT_FQDN"
echo "  • Chatbot:  https://$CHATBOT_FQDN"
echo ""
log_info "Health Endpoints:"
echo "  • API:      https://$API_FQDN/actuator/health"
echo "  • Frontend: https://$FRONT_FQDN/api/health"
echo "  • Chatbot:  https://$CHATBOT_FQDN/health"
echo ""
log_info "Próximos passos:"
echo "  1. Teste os health endpoints acima"
echo "  2. Verifique os logs se houver problemas:"
echo "     az containerapp logs show --name $API_APP --resource-group $RESOURCE_GROUP --follow"
echo "  3. Acesse o frontend e teste a aplicação"
echo ""
log_warning "Lembre-se:"
echo "  • Os secrets estão seguros no Azure (não aparecem nos logs)"
echo "  • Nunca commite o arquivo .env.azure no Git"
echo "  • Para atualizar um secret, use: az containerapp secret set"
echo ""
log_success "Deploy concluído com sucesso! 🚀"
echo ""
