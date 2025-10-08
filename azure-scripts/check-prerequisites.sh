#!/bin/bash

###############################################################################
# Script: check-prerequisites.sh
# Descrição: Verifica se todos os pré-requisitos estão instalados
###############################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Verificação de Pré-requisitos - Deploy Azure         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

ALL_OK=true

# Função para verificar comando
check_command() {
    local cmd=$1
    local name=$2
    local install_hint=$3
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n 1)
        echo -e "${GREEN}✅ $name instalado${NC}"
        echo -e "   ${BLUE}Versão:${NC} $version"
    else
        echo -e "${RED}❌ $name NÃO instalado${NC}"
        echo -e "   ${YELLOW}Como instalar:${NC} $install_hint"
        ALL_OK=false
    fi
    echo ""
}

# Verifica Azure CLI
check_command "az" "Azure CLI" "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"

# Verifica Docker
check_command "docker" "Docker" "https://docs.docker.com/get-docker/"

# Verifica jq
check_command "jq" "jq (JSON processor)" "sudo apt-get install jq (Ubuntu) ou brew install jq (macOS)"

# Verifica Git
check_command "git" "Git" "sudo apt-get install git"

# Verifica login Azure
echo -e "${BLUE}Verificando login na Azure...${NC}"
if az account show &> /dev/null; then
    ACCOUNT=$(az account show --query name -o tsv)
    echo -e "${GREEN}✅ Logado na Azure${NC}"
    echo -e "   ${BLUE}Subscription:${NC} $ACCOUNT"
else
    echo -e "${RED}❌ Não está logado na Azure${NC}"
    echo -e "   ${YELLOW}Execute:${NC} az login"
    ALL_OK=false
fi
echo ""

# Verifica Docker daemon
echo -e "${BLUE}Verificando Docker daemon...${NC}"
if docker ps &> /dev/null; then
    echo -e "${GREEN}✅ Docker está rodando${NC}"
else
    echo -e "${RED}❌ Docker não está rodando${NC}"
    echo -e "   ${YELLOW}Execute:${NC} sudo systemctl start docker"
    ALL_OK=false
fi
echo ""

# Verifica arquivo de configuração
echo -e "${BLUE}Verificando arquivos de configuração...${NC}"
if [ -f ".env.azure" ]; then
    echo -e "${GREEN}✅ Arquivo .env.azure encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env.azure não encontrado${NC}"
    echo -e "   ${YELLOW}Execute:${NC} cp .env.azure.example .env.azure"
    echo -e "   ${YELLOW}E edite com suas credenciais${NC}"
    ALL_OK=false
fi
echo ""

if [ -f "azure-config.json" ]; then
    echo -e "${GREEN}✅ Arquivo azure-config.json encontrado${NC}"
else
    echo -e "${RED}❌ Arquivo azure-config.json não encontrado${NC}"
    ALL_OK=false
fi
echo ""

# Resumo final
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}║           ✅ TUDO PRONTO PARA O DEPLOY! 🚀                ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Você pode iniciar o deploy executando:${NC}"
    echo -e "  ${BLUE}./azure-deploy.sh${NC}"
    echo -e "  ${BLUE}ou${NC}"
    echo -e "  ${BLUE}cd azure-scripts && ./01-deploy-infrastructure.sh${NC}"
else
    echo -e "${RED}║        ⚠️  ALGUNS PRÉ-REQUISITOS FALTANDO ⚠️              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Por favor, instale os itens faltantes antes de continuar.${NC}"
fi
echo ""
