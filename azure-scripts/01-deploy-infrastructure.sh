#!/bin/bash

###############################################################################
# Script: 01-deploy-infrastructure.sh
# Descrição: Cria a infraestrutura base na Azure para o projeto Passa-Bola
# - Resource Group
# - Container Registry (ACR)
# - Azure Database for MySQL Flexible Server
# - Log Analytics Workspace
# - Application Insights
# - Container Apps Environment
###############################################################################

set -e  # Para a execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERRO: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  AVISO: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Carrega configurações do arquivo JSON
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../azure-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

print_step "Carregando configurações do arquivo: $CONFIG_FILE"

# Extrai configurações usando jq
LOCATION=$(jq -r '.azure.location' "$CONFIG_FILE")
RESOURCE_GROUP=$(jq -r '.azure.resourceGroup' "$CONFIG_FILE")
ACR_NAME=$(jq -r '.containerRegistry.name' "$CONFIG_FILE")
ACR_SKU=$(jq -r '.containerRegistry.sku' "$CONFIG_FILE")
MYSQL_SERVER=$(jq -r '.database.serverName' "$CONFIG_FILE")
MYSQL_DB_NAME=$(jq -r '.database.databaseName' "$CONFIG_FILE")
MYSQL_ADMIN_USER=$(jq -r '.database.adminUsername' "$CONFIG_FILE")
MYSQL_SKU=$(jq -r '.database.sku.name' "$CONFIG_FILE")
MYSQL_VERSION=$(jq -r '.database.version' "$CONFIG_FILE")
MYSQL_STORAGE=$(jq -r '.database.storageSize' "$CONFIG_FILE")
LOG_WORKSPACE=$(jq -r '.monitoring.logAnalyticsWorkspace' "$CONFIG_FILE")
APP_INSIGHTS=$(jq -r '.monitoring.appInsightsName' "$CONFIG_FILE")
CAE_NAME=$(jq -r '.containerApps.environment' "$CONFIG_FILE")

# Carrega senha do banco de dados do arquivo .env.azure ou solicita
if [ -f "$SCRIPT_DIR/../.env.azure" ]; then
    source "$SCRIPT_DIR/../.env.azure"
fi

if [ -z "$MYSQL_ADMIN_PASSWORD" ]; then
    print_warning "Senha do banco de dados não encontrada no .env.azure"
    read -sp "Digite a senha para o administrador do MySQL: " MYSQL_ADMIN_PASSWORD
    echo
    
    if [ -z "$MYSQL_ADMIN_PASSWORD" ]; then
        print_error "Senha não pode ser vazia"
        exit 1
    fi
fi

# Carrega JWT_SECRET do arquivo .env.azure ou solicita
if [ -z "$JWT_SECRET" ]; then
    print_warning "JWT_SECRET não encontrado no .env.azure"
    read -sp "Digite o JWT_SECRET para a aplicação: " JWT_SECRET
    echo
    
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET="mySecretKeyForFootballSocialNetworkApplication2024"
        print_warning "Usando JWT_SECRET padrão. Recomendado alterar para produção!"
    fi
fi

print_step "Verificando login na Azure..."
if ! az account show > /dev/null 2>&1; then
    print_error "Você não está logado na Azure. Execute: az login"
    exit 1
fi

SUBSCRIPTION=$(az account show --query name -o tsv)
print_success "Logado na Azure - Subscription: $SUBSCRIPTION"

# 1. Criar Resource Group
print_step "1/7 - Criando Resource Group: $RESOURCE_GROUP"
if az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Resource Group já existe"
else
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --tags Environment=Production Project=PassaBola ManagedBy=AzureCLI
    print_success "Resource Group criado"
fi

# 2. Criar Azure Container Registry
print_step "2/7 - Criando Azure Container Registry: $ACR_NAME"
if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Container Registry já existe"
else
    az acr create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$ACR_NAME" \
        --sku "$ACR_SKU" \
        --location "$LOCATION" \
        --admin-enabled true
    print_success "Container Registry criado"
fi

# 3. Criar Log Analytics Workspace
print_step "3/7 - Criando Log Analytics Workspace: $LOG_WORKSPACE"
if az monitor log-analytics workspace show --resource-group "$RESOURCE_GROUP" --workspace-name "$LOG_WORKSPACE" > /dev/null 2>&1; then
    print_warning "Log Analytics Workspace já existe"
else
    az monitor log-analytics workspace create \
        --resource-group "$RESOURCE_GROUP" \
        --workspace-name "$LOG_WORKSPACE" \
        --location "$LOCATION"
    print_success "Log Analytics Workspace criado"
fi

# Obter ID do Workspace (Resource ID completo, não customerId)
LOG_WORKSPACE_ID=$(az monitor log-analytics workspace show \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$LOG_WORKSPACE" \
    --query id -o tsv)

LOG_WORKSPACE_CUSTOMER_ID=$(az monitor log-analytics workspace show \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$LOG_WORKSPACE" \
    --query customerId -o tsv)

LOG_WORKSPACE_KEY=$(az monitor log-analytics workspace get-shared-keys \
    --resource-group "$RESOURCE_GROUP" \
    --workspace-name "$LOG_WORKSPACE" \
    --query primarySharedKey -o tsv)

# 4. Criar Application Insights
print_step "4/7 - Criando Application Insights: $APP_INSIGHTS"
if az monitor app-insights component show --app "$APP_INSIGHTS" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Application Insights já existe"
else
    az monitor app-insights component create \
        --app "$APP_INSIGHTS" \
        --location "$LOCATION" \
        --resource-group "$RESOURCE_GROUP" \
        --workspace "$LOG_WORKSPACE_ID"
    print_success "Application Insights criado"
fi

# Obter Instrumentation Key
APP_INSIGHTS_KEY=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RESOURCE_GROUP" \
    --query instrumentationKey -o tsv)

APP_INSIGHTS_CONN=$(az monitor app-insights component show \
    --app "$APP_INSIGHTS" \
    --resource-group "$RESOURCE_GROUP" \
    --query connectionString -o tsv)

# 5. Criar Azure Database for MySQL Flexible Server
print_step "5/7 - Criando Azure Database for MySQL: $MYSQL_SERVER"
if az mysql flexible-server show --resource-group "$RESOURCE_GROUP" --name "$MYSQL_SERVER" > /dev/null 2>&1; then
    print_warning "MySQL Server já existe"
else
    az mysql flexible-server create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$MYSQL_SERVER" \
        --location "$LOCATION" \
        --admin-user "$MYSQL_ADMIN_USER" \
        --admin-password "$MYSQL_ADMIN_PASSWORD" \
        --sku-name "$MYSQL_SKU" \
        --tier Burstable \
        --version "$MYSQL_VERSION" \
        --storage-size "$MYSQL_STORAGE" \
        --backup-retention 7 \
        --public-access 0.0.0.0-255.255.255.255
    print_success "MySQL Server criado"
fi

# Aguarda o servidor estar pronto
print_step "Aguardando MySQL Server ficar disponível..."
sleep 30

# 6. Criar banco de dados
print_step "6/7 - Criando banco de dados: $MYSQL_DB_NAME"
if az mysql flexible-server db show --resource-group "$RESOURCE_GROUP" --server-name "$MYSQL_SERVER" --database-name "$MYSQL_DB_NAME" > /dev/null 2>&1; then
    print_warning "Banco de dados já existe"
else
    az mysql flexible-server db create \
        --resource-group "$RESOURCE_GROUP" \
        --server-name "$MYSQL_SERVER" \
        --database-name "$MYSQL_DB_NAME"
    print_success "Banco de dados criado"
fi

# Configurar firewall para permitir acesso de serviços Azure
print_step "Configurando regras de firewall do MySQL..."
az mysql flexible-server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$MYSQL_SERVER" \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 \
    > /dev/null 2>&1 || print_warning "Regra de firewall já existe"

# 7. Criar Container Apps Environment
print_step "7/7 - Criando Container Apps Environment: $CAE_NAME"
if az containerapp env show --name "$CAE_NAME" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Container Apps Environment já existe"
else
    az containerapp env create \
        --name "$CAE_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --logs-workspace-id "$LOG_WORKSPACE_CUSTOMER_ID" \
        --logs-workspace-key "$LOG_WORKSPACE_KEY"
    print_success "Container Apps Environment criado"
fi

# Obter informações do ACR
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query passwords[0].value -o tsv)

# Obter connection string do MySQL
MYSQL_HOST="${MYSQL_SERVER}.mysql.database.azure.com"
MYSQL_CONNECTION_STRING="jdbc:mysql://${MYSQL_HOST}:3306/${MYSQL_DB_NAME}?createDatabaseIfNotExist=true&serverTimezone=UTC&useSSL=true&requireSSL=false"

# Salvar informações importantes em arquivo
print_step "Salvando informações da infraestrutura..."
cat > "$SCRIPT_DIR/../azure-infrastructure.env" << EOF
# Informações da Infraestrutura Azure - Gerado automaticamente
# Data: $(date)

# Resource Group
AZURE_RESOURCE_GROUP=$RESOURCE_GROUP
AZURE_LOCATION=$LOCATION

# Container Registry
ACR_NAME=$ACR_NAME
ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER
ACR_USERNAME=$ACR_USERNAME
ACR_PASSWORD=$ACR_PASSWORD

# MySQL Database
MYSQL_HOST=$MYSQL_HOST
MYSQL_DATABASE=$MYSQL_DB_NAME
MYSQL_USERNAME=$MYSQL_ADMIN_USER
MYSQL_PASSWORD=$MYSQL_ADMIN_PASSWORD
MYSQL_CONNECTION_STRING=$MYSQL_CONNECTION_STRING

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=$APP_INSIGHTS_CONN
APPINSIGHTS_INSTRUMENTATIONKEY=$APP_INSIGHTS_KEY

# Container Apps Environment
CONTAINER_APPS_ENVIRONMENT=$CAE_NAME

# Application Secrets
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=86400000
EOF

print_success "Informações salvas em: azure-infrastructure.env"

# Resumo
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        INFRAESTRUTURA CRIADA COM SUCESSO! 🎉              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Resource Group:${NC} $RESOURCE_GROUP"
echo -e "${BLUE}🐳 Container Registry:${NC} $ACR_LOGIN_SERVER"
echo -e "${BLUE}🗄️  MySQL Server:${NC} $MYSQL_HOST"
echo -e "${BLUE}📊 Application Insights:${NC} $APP_INSIGHTS"
echo -e "${BLUE}🚀 Container Apps Environment:${NC} $CAE_NAME"
echo ""
echo -e "${YELLOW}Próximo passo:${NC} Execute ${GREEN}./02-deploy-images.sh${NC} para fazer build e push das imagens Docker"
echo ""