#!/bin/bash
set -euo pipefail

# Menu simples para orquestrar deploys (corrigido)
# Salve como azure-deploy.sh e rode: ./azure-deploy.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
  echo -e "${CYAN}"
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║              🚀 DEPLOY PASSA-BOLA NA AZURE 🚀           ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

check_az() {
  if ! command -v az &>/dev/null; then
    echo -e "${RED}Azure CLI não encontrada. Instale: https://aka.ms/install-azure-cli${NC}"
    exit 1
  fi
}

# Default scripts folder (se você tiver)
SCRIPTS_DIR="./azure-scripts"

show_menu() {
  print_header
  echo -e "${BLUE}Escolha uma opção:${NC}"
  echo ""
  echo -e "${GREEN}1)${NC} 🏗️  Criar infraestrutura"
  echo -e "${GREEN}2)${NC} 🐳 Build e push das imagens Docker"
  echo -e "${GREEN}3)${NC} 🚀 Deploy dos serviços"
  echo -e "${GREEN}4)${NC} ⚙️  Configurar variáveis e secrets"
  echo -e "${GREEN}5)${NC} 🗄️  Deploy do Blob Storage integrado"
  echo -e "${GREEN}6)${NC} 🧪 Deploy do Blob Storage standalone"
  echo -e "${GREEN}7)${NC} 📦 Deploy completo (1->5)"
  echo ""
  echo -e "${YELLOW}8)${NC}  📊 Ver status dos serviços"
  echo -e "${YELLOW}9)${NC}  📋 Ver URLs dos serviços"
  echo -e "${YELLOW}10)${NC} 💰 Ver análise de custos"
  echo -e "${YELLOW}11)${NC} 📜 Ver logs da API"
  echo -e "${YELLOW}12)${NC} 📜 Ver logs do Frontend"
  echo -e "${YELLOW}13)${NC} 📜 Ver logs do Chatbot"
  echo ""
  echo -e "${RED}14)${NC} 🗑️  Remover recursos (cleanup)"
  echo ""
  echo -e "${CYAN}0)${NC} ❌ Sair"
  echo ""
}

read_option() {
  read -p "Opção: " OPTION
  OPTION=${OPTION:-0}
}

run_if_exists() {
  local script_path="$1"
  if [ -x "$script_path" ]; then
    echo -e "${BLUE}Executando: $script_path${NC}"
    "$script_path"
  elif [ -f "$script_path" ]; then
    echo -e "${BLUE}Executando (bash): $script_path${NC}"
    bash "$script_path"
  else
    echo -e "${YELLOW}Aviso:${NC} $script_path não encontrado. Pulei."
  fi
}

show_service_status() {
  echo -e "${BLUE}Status dos serviços:${NC}"
  echo ""
  if [ -f azure-infrastructure.env ]; then
    source azure-infrastructure.env
    echo -e "${YELLOW}Container Apps:${NC}"
    az containerapp list --resource-group "$AZURE_RESOURCE_GROUP" --output table
    echo ""
    echo -e "${YELLOW}Storage Accounts:${NC}"
    az storage account list --resource-group "$AZURE_RESOURCE_GROUP" \
      --query '[].{Name:name, Location:location, Sku:sku.name, Status:statusOfPrimary}' \
      --output table 2>/dev/null || echo "  Nenhuma Storage Account encontrada"
  else
    echo -e "${RED}Infraestrutura não encontrada. Execute primeiro a opção 1.${NC}"
  fi
}

show_service_urls() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}             URLs DOS SERVIÇOS                 ${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
  echo ""
  
  if [ -f azure-urls.txt ]; then
    echo -e "${YELLOW}📱 Container Apps:${NC}"
    cat azure-urls.txt
  else
    echo -e "${YELLOW}Container Apps:${NC} ${RED}Não deployados ainda${NC}"
  fi
  
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
  echo ""
  
  if [ -f azure-storage.env ]; then
    source azure-storage.env
    echo -e "${YELLOW}🗄️  Blob Storage (Produção):${NC}"
    echo -e "  ${GREEN}Storage Account:${NC} $AZURE_STORAGE_ACCOUNT"
    echo -e "  ${GREEN}Blob Endpoint:${NC} $AZURE_STORAGE_BLOB_ENDPOINT"
    echo ""
    echo -e "  ${CYAN}Containers:${NC}"
    echo -e "    • Imagens:    $STORAGE_IMAGENS_URL"
    echo -e "    • Documentos: $STORAGE_DOCUMENTOS_URL"
    echo -e "    • Avatars:    $STORAGE_AVATARS_URL"
  elif [ -f azure-storage-dev.env ]; then
    source azure-storage-dev.env
    echo -e "${YELLOW}🧪 Blob Storage (Desenvolvimento):${NC}"
    echo -e "  ${GREEN}Storage Account:${NC} $AZURE_STORAGE_ACCOUNT"
    echo -e "  ${GREEN}Blob Endpoint:${NC} $AZURE_STORAGE_BLOB_ENDPOINT"
    echo ""
    echo -e "  ${CYAN}Containers:${NC}"
    echo -e "    • Imagens:    $STORAGE_IMAGENS_URL"
    echo -e "    • Documentos: $STORAGE_DOCUMENTOS_URL"
    echo -e "    • Avatars:    $STORAGE_AVATARS_URL"
    echo -e "    • Temp:       $STORAGE_TEMP_URL"
  else
    echo -e "${YELLOW}Blob Storage:${NC} ${RED}Não configurado. Execute a opção 5 ou 6${NC}"
  fi
}

main() {
  check_az
  show_menu
  read_option

  case "$OPTION" in
    1)
      run_if_exists "$SCRIPTS_DIR/01-deploy-infrastructure.sh"
      ;;
    2)
      run_if_exists "$SCRIPTS_DIR/02-deploy-images.sh"
      ;;
    3)
      run_if_exists "$SCRIPTS_DIR/03-deploy-services.sh"
      ;;
    4)
      run_if_exists "$SCRIPTS_DIR/04-configure-env-vars.sh"
      ;;
    5)
      run_if_exists "$SCRIPTS_DIR/05-deploy-storage.sh"
      ;;
    6)
      echo -e "${BLUE}Deploy do Blob Storage (Desenvolvimento/Teste)${NC}"
      echo ""
      echo -e "${YELLOW}Este deploy é standalone e não afeta a infraestrutura principal${NC}"
      echo ""
      run_if_exists "$SCRIPTS_DIR/deploy-storage-dev.sh"
      ;;
    7)
      echo -e "${BLUE}Deploy completo com Storage${NC}"
      echo ""
      run_if_exists "$SCRIPTS_DIR/01-deploy-infrastructure.sh"
      run_if_exists "$SCRIPTS_DIR/02-deploy-images.sh"
      run_if_exists "$SCRIPTS_DIR/03-deploy-services.sh"
      run_if_exists "$SCRIPTS_DIR/04-configure-env-vars.sh"
      # Removido o script 05-deploy-storage.sh do deploy completo
      ;;
    8)
      show_service_status
      ;;
    9)
      show_service_urls
      ;;
    10)
      echo -e "${BLUE}Análise de custos${NC}"
      run_if_exists "$SCRIPTS_DIR/check-costs.sh"
      ;;
    11)
      echo -e "${BLUE}Logs da API (Ctrl+C para sair):${NC}"
      if [ -f azure-infrastructure.env ]; then
        source azure-infrastructure.env
        az containerapp logs show --name ca-passa-bola-api --resource-group "$AZURE_RESOURCE_GROUP" --follow
      else
        echo -e "${RED}Infraestrutura não encontrada.${NC}"
      fi
      ;;
    12)
      echo -e "${BLUE}Logs do Frontend (Ctrl+C para sair):${NC}"
      if [ -f azure-infrastructure.env ]; then
        source azure-infrastructure.env
        az containerapp logs show --name ca-passa-bola-front --resource-group "$AZURE_RESOURCE_GROUP" --follow
      else
        echo -e "${RED}Infraestrutura não encontrada.${NC}"
      fi
      ;;
    13)
      echo -e "${BLUE}Logs do Chatbot (Ctrl+C para sair):${NC}"
      if [ -f azure-infrastructure.env ]; then
        source azure-infrastructure.env
        az containerapp logs show --name ca-passa-bola-chatbot --resource-group "$AZURE_RESOURCE_GROUP" --follow
      else
        echo -e "${RED}Infraestrutura não encontrada.${NC}"
      fi
      ;;
    14)
      echo -e "${RED}⚠️  OPÇÕES DE LIMPEZA ⚠️${NC}"
      echo ""
      echo -e "${RED}1)${NC} Remover tudo (Resource Group completo)"
      echo -e "${YELLOW}2)${NC} Remover apenas Storage Accounts"
      echo -e "${GREEN}3)${NC} Cancelar"
      echo ""
      read -p "Escolha [3]: " CLEANUP_OPTION
      CLEANUP_OPTION=${CLEANUP_OPTION:-3}
      
      case $CLEANUP_OPTION in
        1)
          run_if_exists "$SCRIPTS_DIR/cleanup-azure.sh"
          ;;
        2)
          if [ -x "$SCRIPTS_DIR/cleanup-azure.sh" ]; then
            "$SCRIPTS_DIR/cleanup-azure.sh" --storage-only
          else
            echo -e "${YELLOW}Script cleanup-azure.sh não encontrado${NC}"
          fi
          ;;
        3)
          echo -e "${GREEN}Limpeza cancelada.${NC}"
          ;;
        *)
          echo -e "${RED}Opção inválida!${NC}"
          ;;
      esac
      ;;
    0)
      echo -e "${GREEN}Até logo! 👋${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Opção inválida!${NC}"
      exit 1
      ;;
  esac

  echo ""
  echo -e "${GREEN}Operação concluída!${NC}"
}

main "$@"
