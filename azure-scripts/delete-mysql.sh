#!/bin/bash

###############################################################################
# Script: delete-mysql.sh
# Descrição: Script para deletar o banco de dados MySQL no Azure.
# Uso: ./delete-mysql.sh
###############################################################################

set -e

# Cores para mensagens
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções auxiliares
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Variáveis
RESOURCE_GROUP="rg-passa-bola"
MYSQL_SERVER_NAME="mysql-passa-bola"

# Confirmação do usuário
log_warning "Este script irá deletar o banco de dados MySQL no Azure."
read -p "Digite 'CONFIRMAR' para continuar: " CONFIRMATION

if [ "$CONFIRMATION" != "CONFIRMAR" ]; then
    log_error "Operação cancelada pelo usuário."
    exit 1
fi

# Verifica se o banco de dados existe
log_info "Verificando se o servidor MySQL existe..."
if ! az mysql flexible-server show --name "$MYSQL_SERVER_NAME" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    log_error "Servidor MySQL '$MYSQL_SERVER_NAME' não encontrado no Resource Group '$RESOURCE_GROUP'."
    exit 1
fi

# Deleta o banco de dados
log_info "Deletando o servidor MySQL: $MYSQL_SERVER_NAME..."
az mysql flexible-server delete \
  --name "$MYSQL_SERVER_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --yes

log_success "Servidor MySQL '$MYSQL_SERVER_NAME' deletado com sucesso."