#!/bin/bash

###############################################################################
# Script: 05-deploy-storage.sh
# Descrição: Deploy do Azure Blob Storage integrado com a infraestrutura
# - Cria Storage Account no Resource Group principal
# - Configura containers para produção
# - Integra com variáveis de ambiente dos Container Apps
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

# Banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Azure Blob Storage - Deploy de Produção              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."
CONFIG_FILE="$PROJECT_ROOT/azure-config.json"
INFRA_FILE="$PROJECT_ROOT/azure-infrastructure.env"

# Verifica arquivos de configuração
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

if [ ! -f "$INFRA_FILE" ]; then
    print_error "Infraestrutura não encontrada. Execute primeiro: ./01-deploy-infrastructure.sh"
    exit 1
fi

print_step "Carregando configurações..."
source "$INFRA_FILE"

# Extrai configurações do JSON
LOCATION=$(jq -r '.azure.location' "$CONFIG_FILE")

# Gera nome único para Storage Account (usando timestamp)
STORAGE_ACCOUNT="stpb$(date +%s | tail -c 8)"

# Configurações dos containers
declare -A CONTAINERS=(
    ["imagens"]="blob"
    ["documentos"]="off"
    ["avatars"]="blob"
    ["temp"]="blob"
    ["videos"]="blob"
)

echo -e "${YELLOW}Configurações:${NC}"
echo -e "  Resource Group: ${GREEN}$AZURE_RESOURCE_GROUP${NC}"
echo -e "  Location: ${GREEN}$LOCATION${NC}"
echo -e "  Storage Account: ${GREEN}$STORAGE_ACCOUNT${NC}"
echo ""

# Verifica login
print_step "Verificando login na Azure..."
if ! az account show > /dev/null 2>&1; then
    print_error "Você não está logado na Azure. Execute: az login"
    exit 1
fi

SUBSCRIPTION=$(az account show --query name -o tsv)
print_success "Logado na Azure - Subscription: $SUBSCRIPTION"
echo ""

# Confirmação
read -p "Deseja continuar com o deploy? [S/n]: " CONFIRM
CONFIRM=${CONFIRM:-S}

if [[ ! "$CONFIRM" =~ ^[SsYy]$ ]]; then
    print_warning "Deploy cancelado pelo usuário"
    exit 0
fi

echo ""

# 1. Criar Storage Account
print_step "1/4 - Criando Storage Account: $STORAGE_ACCOUNT"

# Verifica se nome está disponível
if az storage account check-name --name "$STORAGE_ACCOUNT" --query nameAvailable -o tsv | grep -q "false"; then
    print_error "Nome do Storage Account não está disponível: $STORAGE_ACCOUNT"
    exit 1
fi

if az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$AZURE_RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Storage Account já existe"
else
    az storage account create \
        --name "$STORAGE_ACCOUNT" \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku Standard_LRS \
        --kind StorageV2 \
        --access-tier Hot \
        --allow-blob-public-access true \
        --tags Environment=Production Project=PassaBola
    
    print_success "Storage Account criado"
    print_step "Aguardando Storage Account ficar disponível..."
    sleep 10
fi

# 2. Obter credenciais
print_step "2/4 - Obtendo credenciais..."
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --query connectionString \
    --output tsv)

STORAGE_KEY=$(az storage account keys list \
    --account-name "$STORAGE_ACCOUNT" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --query '[0].value' \
    --output tsv)

STORAGE_BLOB_ENDPOINT="https://${STORAGE_ACCOUNT}.blob.core.windows.net"

print_success "Credenciais obtidas"

# 3. Criar containers
print_step "3/4 - Criando containers..."

for CONTAINER_NAME in "${!CONTAINERS[@]}"; do
    PUBLIC_ACCESS="${CONTAINERS[$CONTAINER_NAME]}"
    
    echo -e "  ${BLUE}→${NC} Criando container: $CONTAINER_NAME (acesso: $PUBLIC_ACCESS)"
    
    if az storage container exists \
        --name "$CONTAINER_NAME" \
        --connection-string "$STORAGE_CONNECTION_STRING" \
        --query exists -o tsv | grep -q "true"; then
        print_warning "    Container '$CONTAINER_NAME' já existe"
    else
        az storage container create \
            --name "$CONTAINER_NAME" \
            --public-access "$PUBLIC_ACCESS" \
            --connection-string "$STORAGE_CONNECTION_STRING" \
            --output none
        
        print_success "    Container '$CONTAINER_NAME' criado"
    fi
done

# Configura CORS
print_step "Configurando CORS..."
az storage cors add \
    --services b \
    --methods GET POST PUT DELETE OPTIONS \
    --origins '*' \
    --allowed-headers '*' \
    --exposed-headers '*' \
    --max-age 3600 \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$STORAGE_KEY" \
    --output none 2>/dev/null || print_warning "CORS já configurado"

print_success "CORS configurado"

# 4. Salvar informações
print_step "4/4 - Salvando informações..."

cat > "$PROJECT_ROOT/azure-storage.env" << EOF
# Azure Blob Storage - Ambiente de Produção
# Gerado automaticamente em: $(date)

# ============================================================
# INFORMAÇÕES DO STORAGE ACCOUNT
# ============================================================
AZURE_STORAGE_ACCOUNT=$STORAGE_ACCOUNT
AZURE_STORAGE_KEY=$STORAGE_KEY
AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING"

# ============================================================
# ENDPOINTS
# ============================================================
AZURE_STORAGE_BLOB_ENDPOINT=$STORAGE_BLOB_ENDPOINT

# URLs dos containers
STORAGE_IMAGENS_URL=${STORAGE_BLOB_ENDPOINT}/imagens
STORAGE_DOCUMENTOS_URL=${STORAGE_BLOB_ENDPOINT}/documentos
STORAGE_AVATARS_URL=${STORAGE_BLOB_ENDPOINT}/avatars
STORAGE_TEMP_URL=${STORAGE_BLOB_ENDPOINT}/temp
STORAGE_VIDEOS_URL=${STORAGE_BLOB_ENDPOINT}/videos

# ============================================================
# VARIÁVEIS PARA CONTAINER APPS
# ============================================================
# Use estas variáveis no script 04-configure-env-vars.sh
AZURE_STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT
AZURE_STORAGE_ACCOUNT_KEY=$STORAGE_KEY
AZURE_STORAGE_BLOB_ENDPOINT=$STORAGE_BLOB_ENDPOINT
AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING"
EOF

# Adiciona ao arquivo de infraestrutura
cat >> "$INFRA_FILE" << EOF

# ============================================================
# AZURE BLOB STORAGE
# ============================================================
AZURE_STORAGE_ACCOUNT=$STORAGE_ACCOUNT
AZURE_STORAGE_KEY=$STORAGE_KEY
AZURE_STORAGE_BLOB_ENDPOINT=$STORAGE_BLOB_ENDPOINT
AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING"
EOF

print_success "Informações salvas em: azure-storage.env e azure-infrastructure.env"

# Upload de arquivo de teste
print_step "Enviando arquivo de teste..."

TEST_FILE="$PROJECT_ROOT/storage-test-production.txt"

cat > "$TEST_FILE" << EOF
╔════════════════════════════════════════════════════════════╗
║        Azure Blob Storage - Ambiente de Produção          ║
╚════════════════════════════════════════════════════════════╝

✅ Storage Account: $STORAGE_ACCOUNT
📅 Data de criação: $(date)
🌍 Região: $LOCATION
📦 Resource Group: $AZURE_RESOURCE_GROUP

Este é um arquivo de teste para verificar conectividade.
EOF

az storage blob upload \
    --container-name "imagens" \
    --file "$TEST_FILE" \
    --name "teste/conectividade-prod.txt" \
    --connection-string "$STORAGE_CONNECTION_STRING" \
    --overwrite \
    --output none

rm "$TEST_FILE"

TEST_BLOB_URL="${STORAGE_BLOB_ENDPOINT}/imagens/teste/conectividade-prod.txt"
print_success "Arquivo de teste enviado"

# Lista containers
print_step "Containers criados:"
echo ""
az storage container list \
    --connection-string "$STORAGE_CONNECTION_STRING" \
    --query '[].{Nome:name, AcessoPublico:properties.publicAccess}' \
    --output table

# Resumo final
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      🎉 BLOB STORAGE CRIADO COM SUCESSO! 🎉              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Storage Account:${NC} ${GREEN}$STORAGE_ACCOUNT${NC}"
echo -e "${BLUE}🌐 Blob Endpoint:${NC} ${GREEN}$STORAGE_BLOB_ENDPOINT${NC}"
echo -e "${BLUE}📍 Region:${NC} ${GREEN}$LOCATION${NC}"
echo -e "${BLUE}🏷️  Resource Group:${NC} ${GREEN}$AZURE_RESOURCE_GROUP${NC}"
echo ""
echo -e "${BLUE}📁 Containers disponíveis:${NC}"
for CONTAINER_NAME in "${!CONTAINERS[@]}"; do
    PUBLIC_ACCESS="${CONTAINERS[$CONTAINER_NAME]}"
    CONTAINER_URL="${STORAGE_BLOB_ENDPOINT}/${CONTAINER_NAME}"
    
    if [ "$PUBLIC_ACCESS" == "blob" ]; then
        echo -e "  ${GREEN}✓${NC} ${YELLOW}$CONTAINER_NAME${NC} ${GREEN}(público)${NC}  → $CONTAINER_URL"
    else
        echo -e "  ${GREEN}✓${NC} ${YELLOW}$CONTAINER_NAME${NC} ${RED}(privado)${NC} → $CONTAINER_URL"
    fi
done
echo ""
echo -e "${BLUE}🧪 Testar conectividade:${NC}"
echo -e "  ${GREEN}curl $TEST_BLOB_URL${NC}"
echo ""
echo -e "${BLUE}📝 Configurações salvas em:${NC}"
echo -e "  ${GREEN}azure-storage.env${NC}"
echo -e "  ${GREEN}azure-infrastructure.env${NC} (atualizado)"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "  1. Execute ${GREEN}./04-configure-env-vars.sh${NC} para configurar as variáveis"
echo -e "  2. As credenciais do Blob Storage serão automaticamente adicionadas"
echo -e "  3. Os Container Apps serão atualizados com as novas variáveis"
echo ""
echo -e "${BLUE}Portal Azure:${NC} ${GREEN}https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$AZURE_RESOURCE_GROUP${NC}"
echo ""
