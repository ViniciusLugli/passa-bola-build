#!/bin/bash

###############################################################################
# Script: cleanup-azure.sh
# Descrição: Remove todos os recursos Azure criados para o projeto Passa-Bola
# ATENÇÃO: Este script remove TUDO! Use com cuidado!
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

# Carrega configurações
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

RESOURCE_GROUP=$(jq -r '.azure.resourceGroup' "$CONFIG_FILE")

# Verifica login
if ! az account show > /dev/null 2>&1; then
    print_error "Você não está logado na Azure. Execute: az login"
    exit 1
fi

# Banner de aviso
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    ⚠️  ATENÇÃO! ⚠️                        ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Este script irá DELETAR os seguintes recursos:${NC}"
echo ""
echo -e "  ${RED}❌ Resource Group:${NC} $RESOURCE_GROUP"
echo -e "  ${RED}❌ Todos os Container Apps${NC}"
echo -e "  ${RED}❌ Container Apps Environment${NC}"
echo -e "  ${RED}❌ Azure Container Registry${NC}"
echo -e "  ${RED}❌ Azure Database for MySQL (incluindo dados!)${NC}"
echo -e "  ${RED}❌ Application Insights${NC}"
echo -e "  ${RED}❌ Log Analytics Workspace${NC}"
echo ""
echo -e "${RED}Esta ação é IRREVERSÍVEL!${NC}"
echo ""

# Confirmação dupla
read -p "Tem certeza que deseja continuar? Digite 'SIM' (em maiúsculas): " CONFIRM1

if [ "$CONFIRM1" != "SIM" ]; then
    echo ""
    print_success "Operação cancelada. Nenhum recurso foi removido."
    exit 0
fi

echo ""
read -p "Digite novamente o nome do Resource Group para confirmar: " CONFIRM2

if [ "$CONFIRM2" != "$RESOURCE_GROUP" ]; then
    echo ""
    print_error "Nome do Resource Group não corresponde. Operação cancelada."
    exit 1
fi

echo ""
print_warning "Iniciando remoção de recursos em 5 segundos... (Ctrl+C para cancelar)"
sleep 5

# Remove o Resource Group (isso remove todos os recursos dentro dele)
print_step "Removendo Resource Group: $RESOURCE_GROUP"
echo ""
print_warning "Isso pode levar alguns minutos..."

az group delete \
    --name "$RESOURCE_GROUP" \
    --yes \
    --no-wait

print_success "Comando de remoção executado. O processo está rodando em background."

echo ""
echo -e "${BLUE}Para acompanhar o progresso, use:${NC}"
echo -e "  ${GREEN}az group show --name $RESOURCE_GROUP${NC}"
echo ""
echo -e "${BLUE}Quando o Resource Group não for mais encontrado, a remoção estará completa.${NC}"
echo ""

# Remove arquivos locais de configuração
print_step "Removendo arquivos locais de configuração..."

if [ -f "$PROJECT_ROOT/azure-infrastructure.env" ]; then
    rm "$PROJECT_ROOT/azure-infrastructure.env"
    print_success "Arquivo azure-infrastructure.env removido"
fi

if [ -f "$PROJECT_ROOT/azure-urls.txt" ]; then
    rm "$PROJECT_ROOT/azure-urls.txt"
    print_success "Arquivo azure-urls.txt removido"
fi

if [ -f "$PROJECT_ROOT/.env.azure" ]; then
    print_warning "Arquivo .env.azure mantido (contém suas credenciais)"
    echo "    Se desejar removê-lo: rm $PROJECT_ROOT/.env.azure"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         LIMPEZA INICIADA COM SUCESSO! 🗑️                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Observações:${NC}"
echo -e "  • A remoção está rodando em background"
echo -e "  • Pode levar de 5 a 15 minutos para completar"
echo -e "  • Você pode fechar este terminal"
echo -e "  • Verifique o portal Azure para confirmar a remoção"
echo ""
echo -e "${BLUE}Portal Azure:${NC} https://portal.azure.com"
echo ""
