#!/bin/bash

###############################################################################
# Script: 02-deploy-images.sh
# Descrição: Faz build e push das imagens Docker para Azure Container Registry
# - Build das imagens da API, Frontend e Chatbot
# - Tag das imagens
# - Push para ACR
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

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Carrega informações da infraestrutura
INFRA_FILE="$PROJECT_ROOT/azure-infrastructure.env"

if [ ! -f "$INFRA_FILE" ]; then
    print_error "Arquivo de infraestrutura não encontrado: $INFRA_FILE"
    echo "Execute primeiro: ./01-deploy-infrastructure.sh"
    exit 1
fi

print_step "Carregando informações da infraestrutura..."
source "$INFRA_FILE"

# Verifica se está logado no Azure
print_step "Verificando login na Azure..."
if ! az account show > /dev/null 2>&1; then
    print_error "Você não está logado na Azure. Execute: az login"
    exit 1
fi

# Login no ACR
print_step "Fazendo login no Azure Container Registry..."
echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_SERVER" -u "$ACR_USERNAME" --password-stdin
print_success "Login no ACR realizado"

# Define as imagens
API_IMAGE="api-passa-bola"
FRONT_IMAGE="front-passa-bola"
CHATBOT_IMAGE="chatbot-passa-bola"

# 1. Build e Push da API
print_step "1/3 - Construindo imagem da API..."
cd "$PROJECT_ROOT/api"

docker build -f Dockerfile.azure -t "${ACR_LOGIN_SERVER}/${API_IMAGE}:latest" .
print_success "Imagem da API construída"

print_step "Enviando imagem da API para ACR..."
docker push "${ACR_LOGIN_SERVER}/${API_IMAGE}:latest"
print_success "Imagem da API enviada"

# 2. Build e Push do Frontend
print_step "2/3 - Construindo imagem do Frontend..."
cd "$PROJECT_ROOT/front"

docker build -f Dockerfile.azure -t "${ACR_LOGIN_SERVER}/${FRONT_IMAGE}:latest" .
print_success "Imagem do Frontend construída"

print_step "Enviando imagem do Frontend para ACR..."
docker push "${ACR_LOGIN_SERVER}/${FRONT_IMAGE}:latest"
print_success "Imagem do Frontend enviada"

# 3. Build e Push do Chatbot
print_step "3/3 - Construindo imagem do Chatbot..."
cd "$PROJECT_ROOT/chatbot"

docker build -f Dockerfile.azure -t "${ACR_LOGIN_SERVER}/${CHATBOT_IMAGE}:latest" .
print_success "Imagem do Chatbot construída"

print_step "Enviando imagem do Chatbot para ACR..."
docker push "${ACR_LOGIN_SERVER}/${CHATBOT_IMAGE}:latest"
print_success "Imagem do Chatbot enviada"

# Lista as imagens no ACR
print_step "Verificando imagens no ACR..."
echo ""
echo -e "${BLUE}Imagens disponíveis no ACR:${NC}"
az acr repository list --name "$ACR_NAME" --output table

echo ""
print_success "Todas as imagens foram construídas e enviadas com sucesso!"
echo ""
echo -e "${YELLOW}Próximo passo:${NC} Execute ${GREEN}./03-deploy-services.sh${NC} para fazer o deploy dos serviços"
echo ""
