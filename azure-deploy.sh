#!/bin/bash

###############################################################################
# Script auxiliar de deploy na Azure
# Use este script para executar os passos de deploy de forma interativa
###############################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              🚀 DEPLOY PASSA-BOLA NA AZURE 🚀             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}Escolha uma opção:${NC}"
echo ""
echo -e "${GREEN}1)${NC} 🏗️  Criar infraestrutura (Resource Group, ACR, MySQL, etc.)"
echo -e "${GREEN}2)${NC} 🐳 Build e push das imagens Docker"
echo -e "${GREEN}3)${NC} 🚀 Deploy dos serviços (API, Frontend, Chatbot)"
echo -e "${GREEN}4)${NC} � Configurar variáveis de ambiente e secrets"
echo -e "${GREEN}5)${NC} �📦 Deploy completo (passos 1, 2, 3 e 4)"
echo ""
echo -e "${YELLOW}6)${NC} 📊 Ver status dos serviços"
echo -e "${YELLOW}7)${NC} 📋 Ver URLs dos serviços"
echo -e "${YELLOW}8)${NC} � Ver análise de custos"
echo -e "${YELLOW}9)${NC} �📜 Ver logs da API"
echo -e "${YELLOW}10)${NC} 📜 Ver logs do Frontend"
echo -e "${YELLOW}11)${NC} 📜 Ver logs do Chatbot"
echo ""
echo -e "${RED}12)${NC} 🗑️  Remover todos os recursos (cleanup)"
echo ""
echo -e "${CYAN}0)${NC} ❌ Sair"
echo ""

read -p "Digite sua opção: " OPTION

case $OPTION in
    1)
        echo ""
        echo -e "${BLUE}Executando: Criar infraestrutura${NC}"
        cd azure-scripts
        ./01-deploy-infrastructure.sh
        ;;
    2)
        echo ""
        echo -e "${BLUE}Executando: Build e push das imagens${NC}"
        cd azure-scripts
        ./02-deploy-images.sh
        ;;
    3)
        echo ""
        echo -e "${BLUE}Executando: Deploy dos serviços${NC}"
        cd azure-scripts
        ./03-deploy-services.sh
        ;;
    4)
        echo ""
        echo -e "${BLUE}Executando: Configurar variáveis de ambiente${NC}"
        cd azure-scripts
        ./04-configure-env-vars.sh
        ;;
    5)
        echo ""
        echo -e "${BLUE}Executando: Deploy completo${NC}"
        echo ""
        cd azure-scripts
        ./01-deploy-infrastructure.sh && \
        ./02-deploy-images.sh && \
        ./03-deploy-services.sh && \
        ./04-configure-env-vars.sh
        ;;
    6)
        echo ""
        echo -e "${BLUE}Status dos serviços:${NC}"
        echo ""
        if [ -f azure-infrastructure.env ]; then
            source azure-infrastructure.env
            az containerapp list \
                --resource-group "$AZURE_RESOURCE_GROUP" \
                --output table
        else
            echo -e "${RED}Infraestrutura não encontrada. Execute primeiro a opção 1.${NC}"
        fi
        ;;
    7)
        echo ""
        if [ -f azure-urls.txt ]; then
            cat azure-urls.txt
        else
            echo -e "${RED}URLs não encontradas. Execute primeiro o deploy (opção 3 ou 5).${NC}"
        fi
        ;;
    8)
        echo ""
        echo -e "${BLUE}Executando: Análise de custos${NC}"
        cd azure-scripts
        ./check-costs.sh
        ;;
    9)
        echo ""
        echo -e "${BLUE}Logs da API (Ctrl+C para sair):${NC}"
        echo ""
        if [ -f azure-infrastructure.env ]; then
            source azure-infrastructure.env
            az containerapp logs show \
                --name ca-passa-bola-api \
                --resource-group "$AZURE_RESOURCE_GROUP" \
                --follow
        else
            echo -e "${RED}Infraestrutura não encontrada.${NC}"
        fi
        ;;
    10)
        echo ""
        echo -e "${BLUE}Logs do Frontend (Ctrl+C para sair):${NC}"
        echo ""
        if [ -f azure-infrastructure.env ]; then
            source azure-infrastructure.env
            az containerapp logs show \
                --name ca-passa-bola-front \
                --resource-group "$AZURE_RESOURCE_GROUP" \
                --follow
        else
            echo -e "${RED}Infraestrutura não encontrada.${NC}"
        fi
        ;;
    11)
        echo ""
        echo -e "${BLUE}Logs do Chatbot (Ctrl+C para sair):${NC}"
        echo ""
        if [ -f azure-infrastructure.env ]; then
            source azure-infrastructure.env
            az containerapp logs show \
                --name ca-passa-bola-chatbot \
                --resource-group "$AZURE_RESOURCE_GROUP" \
                --follow
        else
            echo -e "${RED}Infraestrutura não encontrada.${NC}"
        fi
        ;;
    12)
        echo ""
        echo -e "${RED}Atenção: Esta operação remove TODOS os recursos!${NC}"
        cd azure-scripts
        ./cleanup-azure.sh
        ;;
    0)
        echo ""
        echo -e "${GREEN}Até logo! 👋${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Operação concluída!${NC}"
echo ""
