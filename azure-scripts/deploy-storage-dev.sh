#!/bin/bash

###############################################################################
# Script: deploy-storage-dev.sh
# Descrição: Deploy STANDALONE do Azure Blob Storage para desenvolvimento/testes
# - Cria Resource Group de desenvolvimento
# - Cria Storage Account para testes
# - Configura containers básicos
# - Pode ser usado independentemente da infraestrutura principal
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
echo -e "${BLUE}║     Azure Blob Storage - Deploy para Desenvolvimento      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configurações básicas (pode ser customizado via parâmetros)
RESOURCE_GROUP="${AZURE_DEV_RG:-rg-passa-bola-dev}"
LOCATION="${AZURE_DEV_LOCATION:-eastus}"
STORAGE_ACCOUNT="stdev$(date +%s | tail -c 8)"  # Gera nome único
ENVIRONMENT="Development"

# Permite customização via argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --rg)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        --location)
            LOCATION="$2"
            shift 2
            ;;
        --storage-name)
            STORAGE_ACCOUNT=$(echo "$2" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
            shift 2
            ;;
        --help)
            echo "Uso: $0 [opções]"
            echo ""
            echo "Opções:"
            echo "  --rg NOME              Nome do Resource Group (padrão: rg-passa-bola-dev)"
            echo "  --location REGIÃO      Região Azure (padrão: eastus)"
            echo "  --storage-name NOME    Nome do Storage Account (padrão: gerado automaticamente)"
            echo "  --help                 Mostra esta ajuda"
            echo ""
            echo "Exemplos:"
            echo "  $0"
            echo "  $0 --rg meu-rg-teste --location westus"
            echo "  $0 --storage-name meuteststorage"
            exit 0
            ;;
        *)
            print_error "Opção desconhecida: $1"
            echo "Use --help para ver as opções disponíveis"
            exit 1
            ;;
    esac
done

# Configurações dos containers
declare -A CONTAINERS=(
    ["imagens"]="blob"
    ["documentos"]="off"
    ["avatars"]="blob"
    ["temp"]="blob"
)

echo -e "${YELLOW}Configurações:${NC}"
echo -e "  Resource Group: ${GREEN}$RESOURCE_GROUP${NC}"
echo -e "  Location: ${GREEN}$LOCATION${NC}"
echo -e "  Storage Account: ${GREEN}$STORAGE_ACCOUNT${NC}"
echo -e "  Environment: ${GREEN}$ENVIRONMENT${NC}"
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

# 1. Criar Resource Group
print_step "1/4 - Criando Resource Group: $RESOURCE_GROUP"
if az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Resource Group já existe"
else
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --tags Environment=$ENVIRONMENT Project=PassaBola-Dev ManagedBy=AzureCLI CreatedBy=dev-script
    print_success "Resource Group criado"
fi

# 2. Criar Storage Account
print_step "2/4 - Criando Storage Account: $STORAGE_ACCOUNT"

# Verifica se nome está disponível
if az storage account check-name --name "$STORAGE_ACCOUNT" --query nameAvailable -o tsv | grep -q "false"; then
    print_error "Nome do Storage Account não está disponível: $STORAGE_ACCOUNT"
    print_warning "Tente outro nome com: --storage-name NOME"
    exit 1
fi

if az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Storage Account já existe"
else
    az storage account create \
        --name "$STORAGE_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku Standard_LRS \
        --kind StorageV2 \
        --access-tier Hot \
        --allow-blob-public-access true \
        --tags Environment=$ENVIRONMENT Project=PassaBola-Dev
    
    print_success "Storage Account criado"
    print_step "Aguardando Storage Account ficar disponível..."
    sleep 10
fi

# 3. Obter connection string
print_step "3/4 - Obtendo credenciais..."
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query connectionString \
    --output tsv)

STORAGE_KEY=$(az storage account keys list \
    --account-name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query '[0].value' \
    --output tsv)

print_success "Credenciais obtidas"

# 4. Criar containers
print_step "4/4 - Criando containers..."

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

# Upload de arquivo de teste
print_step "Enviando arquivo de teste..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_FILE="$SCRIPT_DIR/../storage-test-dev.txt"

cat > "$TEST_FILE" << EOF
╔════════════════════════════════════════════════════════════╗
║        Azure Blob Storage - Ambiente de Desenvolvimento   ║
╚════════════════════════════════════════════════════════════╝

✅ Storage Account: $STORAGE_ACCOUNT
📅 Data de criação: $(date)
🌍 Região: $LOCATION
📦 Resource Group: $RESOURCE_GROUP

Este é um arquivo de teste para verificar conectividade.
EOF

az storage blob upload \
    --container-name "imagens" \
    --file "$TEST_FILE" \
    --name "teste/conectividade-dev.txt" \
    --connection-string "$STORAGE_CONNECTION_STRING" \
    --overwrite \
    --output none

rm "$TEST_FILE"

TEST_BLOB_URL="https://${STORAGE_ACCOUNT}.blob.core.windows.net/imagens/teste/conectividade-dev.txt"
print_success "Arquivo de teste enviado"

# Salva informações
print_step "Salvando informações..."

cat > "$SCRIPT_DIR/../azure-storage-dev.env" << EOF
# Azure Blob Storage - Ambiente de Desenvolvimento
# Gerado automaticamente em: $(date)

# ============================================================
# INFORMAÇÕES DO RESOURCE GROUP
# ============================================================
AZURE_DEV_RG=$RESOURCE_GROUP
AZURE_DEV_LOCATION=$LOCATION

# ============================================================
# CREDENCIAIS DO STORAGE ACCOUNT
# ============================================================
AZURE_STORAGE_ACCOUNT=$STORAGE_ACCOUNT
AZURE_STORAGE_KEY=$STORAGE_KEY
AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING"

# ============================================================
# ENDPOINTS
# ============================================================
AZURE_STORAGE_BLOB_ENDPOINT=https://${STORAGE_ACCOUNT}.blob.core.windows.net

# URLs dos containers
STORAGE_IMAGENS_URL=https://${STORAGE_ACCOUNT}.blob.core.windows.net/imagens
STORAGE_DOCUMENTOS_URL=https://${STORAGE_ACCOUNT}.blob.core.windows.net/documentos
STORAGE_AVATARS_URL=https://${STORAGE_ACCOUNT}.blob.core.windows.net/avatars
STORAGE_TEMP_URL=https://${STORAGE_ACCOUNT}.blob.core.windows.net/temp

# ============================================================
# EXEMPLO DE USO EM CÓDIGO
# ============================================================
# Spring Boot (application.properties):
# azure.storage.account-name=$STORAGE_ACCOUNT
# azure.storage.account-key=$STORAGE_KEY
# azure.storage.blob-endpoint=https://${STORAGE_ACCOUNT}.blob.core.windows.net

# Node.js / JavaScript:
# const { BlobServiceClient } = require('@azure/storage-blob');
# const blobServiceClient = BlobServiceClient.fromConnectionString('$STORAGE_CONNECTION_STRING');

# Python:
# from azure.storage.blob import BlobServiceClient
# blob_service_client = BlobServiceClient.from_connection_string('$STORAGE_CONNECTION_STRING')

# ============================================================
# COMANDOS ÚTEIS
# ============================================================
# Listar blobs:
# az storage blob list --container-name imagens --connection-string "$STORAGE_CONNECTION_STRING" --output table

# Upload de arquivo:
# az storage blob upload --container-name imagens --file caminho/arquivo.jpg --name pasta/arquivo.jpg --connection-string "$STORAGE_CONNECTION_STRING"

# Download de arquivo:
# az storage blob download --container-name imagens --name pasta/arquivo.jpg --file destino.jpg --connection-string "$STORAGE_CONNECTION_STRING"

# Deletar blob:
# az storage blob delete --container-name imagens --name pasta/arquivo.jpg --connection-string "$STORAGE_CONNECTION_STRING"

# ============================================================
# LIMPEZA (DELETAR TUDO)
# ============================================================
# Para deletar este ambiente de desenvolvimento:
# az group delete --name $RESOURCE_GROUP --yes --no-wait
EOF

print_success "Informações salvas em: azure-storage-dev.env"

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
echo -e "${GREEN}║      🎉 STORAGE DE DESENVOLVIMENTO CRIADO! 🎉             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Storage Account:${NC} ${GREEN}$STORAGE_ACCOUNT${NC}"
echo -e "${BLUE}🌐 Blob Endpoint:${NC} ${GREEN}https://${STORAGE_ACCOUNT}.blob.core.windows.net${NC}"
echo -e "${BLUE}📍 Region:${NC} ${GREEN}$LOCATION${NC}"
echo -e "${BLUE}🏷️  Resource Group:${NC} ${GREEN}$RESOURCE_GROUP${NC}"
echo ""
echo -e "${BLUE}📁 Containers disponíveis:${NC}"
for CONTAINER_NAME in "${!CONTAINERS[@]}"; do
    PUBLIC_ACCESS="${CONTAINERS[$CONTAINER_NAME]}"
    CONTAINER_URL="https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}"
    
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
echo -e "  ${GREEN}azure-storage-dev.env${NC}"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "  1. ${GREEN}source azure-storage-dev.env${NC} (carregar variáveis)"
echo -e "  2. Configure sua aplicação com as variáveis de ambiente"
echo -e "  3. Teste upload/download de arquivos"
echo ""
echo -e "${YELLOW}📊 Monitorar custos:${NC}"
echo -e "  ${GREEN}az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query '[primaryEndpoints, tags]'${NC}"
echo ""
echo -e "${RED}🗑️  Para deletar este ambiente:${NC}"
echo -e "  ${RED}az group delete --name $RESOURCE_GROUP --yes --no-wait${NC}"
echo ""
echo -e "${BLUE}Portal Azure:${NC} ${GREEN}https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP${NC}"
echo ""
