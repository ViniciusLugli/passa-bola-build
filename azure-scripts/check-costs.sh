#!/bin/bash

###############################################################################
# Script para verificar custos do projeto Passa-Bola no Azure
# Pode ser executado a qualquer momento, inclusive durante o deploy
###############################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Função para imprimir com cor
print_header() { echo -e "${CYAN}$1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         💰 ANÁLISE DE CUSTOS - PASSA-BOLA 💰              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Carregar configuração
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/azure-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

RESOURCE_GROUP=$(jq -r '.azure.resourceGroup' "$CONFIG_FILE")
LOCATION=$(jq -r '.azure.location' "$CONFIG_FILE")

# Verificar login
print_info "Verificando login no Azure..."
if ! az account show > /dev/null 2>&1; then
    print_error "Você não está logado na Azure. Execute: az login"
    exit 1
fi

SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
print_success "Logado: $SUBSCRIPTION_NAME"
echo ""

# Verificar se o Resource Group existe
print_info "Verificando Resource Group: $RESOURCE_GROUP"
if ! az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1; then
    print_warning "Resource Group '$RESOURCE_GROUP' não encontrado."
    print_info "Execute o deploy primeiro: ./azure-deploy.sh"
    exit 0
fi
print_success "Resource Group encontrado"
echo ""

# ============================================================================
# LISTAR RECURSOS E ESTIMATIVA DE CUSTOS
# ============================================================================

print_header "📊 RECURSOS IMPLANTADOS:"
echo ""

az resource list --resource-group "$RESOURCE_GROUP" --output table

echo ""
echo ""

# ============================================================================
# ESTIMATIVA DE CUSTOS POR RECURSO
# ============================================================================

print_header "💵 ESTIMATIVA DE CUSTOS MENSAIS (Região: $LOCATION):"
echo ""

TOTAL_MIN=0
TOTAL_MAX=0

# MySQL
print_info "Analisando Azure Database for MySQL..."
MYSQL_COUNT=$(az mysql flexible-server list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv 2>/dev/null || echo "0")
if [ "$MYSQL_COUNT" -gt 0 ]; then
    MYSQL_NAME=$(az mysql flexible-server list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    MYSQL_SKU=$(az mysql flexible-server show --resource-group "$RESOURCE_GROUP" --name "$MYSQL_NAME" --query "sku.name" -o tsv)
    MYSQL_STORAGE=$(az mysql flexible-server show --resource-group "$RESOURCE_GROUP" --name "$MYSQL_NAME" --query "storage.storageSizeGb" -o tsv)
    
    echo "  • MySQL Flexible Server: $MYSQL_NAME"
    echo "    - SKU: $MYSQL_SKU"
    echo "    - Storage: ${MYSQL_STORAGE}GB"
    
    if [ "$MYSQL_SKU" == "Standard_B1s" ]; then
        echo "    - Custo estimado: \$12-15/mês"
        TOTAL_MIN=$((TOTAL_MIN + 12))
        TOTAL_MAX=$((TOTAL_MAX + 15))
    elif [ "$MYSQL_SKU" == "Standard_B1ms" ]; then
        echo "    - Custo estimado: \$18-20/mês"
        TOTAL_MIN=$((TOTAL_MIN + 18))
        TOTAL_MAX=$((TOTAL_MAX + 20))
    else
        echo "    - Custo estimado: consulte https://azure.microsoft.com/pricing/details/mysql/"
    fi
else
    echo "  • MySQL: Não encontrado"
fi
echo ""

# Container Registry
print_info "Analisando Azure Container Registry..."
ACR_COUNT=$(az acr list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv 2>/dev/null || echo "0")
if [ "$ACR_COUNT" -gt 0 ]; then
    ACR_NAME=$(az acr list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    ACR_SKU=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "sku.name" -o tsv)
    
    echo "  • Container Registry: $ACR_NAME"
    echo "    - SKU: $ACR_SKU"
    
    if [ "$ACR_SKU" == "Basic" ]; then
        echo "    - Custo estimado: \$5/mês"
        TOTAL_MIN=$((TOTAL_MIN + 5))
        TOTAL_MAX=$((TOTAL_MAX + 5))
    else
        echo "    - Custo estimado: consulte https://azure.microsoft.com/pricing/details/container-registry/"
    fi
else
    echo "  • Container Registry: Não encontrado"
fi
echo ""

# Container Apps
print_info "Analisando Container Apps..."
CA_COUNT=$(az containerapp list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv 2>/dev/null || echo "0")
if [ "$CA_COUNT" -gt 0 ]; then
    echo "  • Container Apps Environment: (Consumption tier)"
    echo "    - Custo base: \$0/mês"
    echo ""
    
    CA_COST_MIN=0
    CA_COST_MAX=0
    
    for ca_name in $(az containerapp list --resource-group "$RESOURCE_GROUP" --query "[].name" -o tsv); do
        CA_CPU=$(az containerapp show --name "$ca_name" --resource-group "$RESOURCE_GROUP" --query "template.containers[0].resources.cpu" -o tsv)
        CA_MEMORY=$(az containerapp show --name "$ca_name" --resource-group "$RESOURCE_GROUP" --query "template.containers[0].resources.memory" -o tsv)
        CA_MIN_REP=$(az containerapp show --name "$ca_name" --resource-group "$RESOURCE_GROUP" --query "template.scale.minReplicas" -o tsv)
        CA_MAX_REP=$(az containerapp show --name "$ca_name" --resource-group "$RESOURCE_GROUP" --query "template.scale.maxReplicas" -o tsv)
        
        echo "    • $ca_name"
        echo "      - CPU: $CA_CPU | Memory: $CA_MEMORY"
        echo "      - Min Replicas: $CA_MIN_REP | Max Replicas: $CA_MAX_REP"
        
        if [ "$CA_MIN_REP" == "0" ]; then
            echo "      - Scale-to-zero ativado: \$0 quando inativo"
            echo "      - Custo estimado (uso moderado): \$3-10/mês"
            CA_COST_MIN=$((CA_COST_MIN + 3))
            CA_COST_MAX=$((CA_COST_MAX + 10))
        else
            echo "      - Sempre rodando: 730 horas/mês"
            echo "      - Custo estimado: \$8-15/mês"
            CA_COST_MIN=$((CA_COST_MIN + 8))
            CA_COST_MAX=$((CA_COST_MAX + 15))
        fi
        echo ""
    done
    
    TOTAL_MIN=$((TOTAL_MIN + CA_COST_MIN))
    TOTAL_MAX=$((TOTAL_MAX + CA_COST_MAX))
else
    echo "  • Container Apps: Não encontrado"
    echo ""
fi

# Application Insights
print_info "Analisando Application Insights..."
AI_COUNT=$(az monitor app-insights component list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv 2>/dev/null || echo "0")
if [ "$AI_COUNT" -gt 0 ]; then
    AI_NAME=$(az monitor app-insights component list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    echo "  • Application Insights: $AI_NAME"
    echo "    - Primeiros 5GB/mês: Grátis"
    echo "    - Após 5GB: \$2.30/GB"
    echo "    - Custo estimado: \$0-2/mês (dentro do free tier)"
    TOTAL_MAX=$((TOTAL_MAX + 2))
else
    echo "  • Application Insights: Não encontrado"
fi
echo ""

# Log Analytics
print_info "Analisando Log Analytics..."
LOG_COUNT=$(az monitor log-analytics workspace list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv 2>/dev/null || echo "0")
if [ "$LOG_COUNT" -gt 0 ]; then
    LOG_NAME=$(az monitor log-analytics workspace list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    echo "  • Log Analytics Workspace: $LOG_NAME"
    echo "    - Primeiros 5GB/mês: Grátis"
    echo "    - Após 5GB: \$2.30/GB"
    echo "    - Custo estimado: \$0-2/mês (dentro do free tier)"
    TOTAL_MAX=$((TOTAL_MAX + 2))
else
    echo "  • Log Analytics: Não encontrado"
fi
echo ""

# ============================================================================
# RESUMO FINAL
# ============================================================================

echo ""
print_header "════════════════════════════════════════════════════════════"
print_header "💰 CUSTO TOTAL ESTIMADO (USD):"
echo ""
echo -e "  ${GREEN}Mínimo (scale-to-zero ativo, dentro do free tier):${NC} ~\$${TOTAL_MIN}/mês"
echo -e "  ${YELLOW}Máximo (uso moderado, saindo do free tier):${NC} ~\$${TOTAL_MAX}/mês"
echo ""
print_header "════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# DICAS DE ECONOMIA
# ============================================================================

print_header "💡 DICAS PARA ECONOMIZAR:"
echo ""
echo "  1. ✅ Container Apps com minReplicas=0 já economizam automaticamente"
echo "  2. 💾 MySQL é o maior custo (~\$12-15/mês) - considera backup+delete se não usar"
echo "  3. 📊 Fique dentro dos 5GB grátis de logs/telemetria"
echo "  4. 🗑️  Delete recursos não usados: ./azure-deploy.sh → Opção 11"
echo "  5. 📉 Monitore uso: az consumption usage list"
echo ""

# ============================================================================
# CUSTOS DETALHADOS (se disponível)
# ============================================================================

print_header "📈 CUSTOS REAIS (últimos 30 dias):"
echo ""
print_info "Consultando Azure Cost Management..."
echo ""

# Datas
END_DATE=$(date +%Y-%m-%d)
START_DATE=$(date -d '30 days ago' +%Y-%m-%d)

# Tentar obter custos reais
COST_DATA=$(az consumption usage list \
    --start-date "$START_DATE" \
    --end-date "$END_DATE" \
    --query "[?contains(instanceId, '$RESOURCE_GROUP')]" \
    --output json 2>/dev/null)

if [ "$COST_DATA" != "[]" ] && [ -n "$COST_DATA" ]; then
    echo "$COST_DATA" | jq -r '.[] | "  • \(.instanceName): $\(.pretaxCost) (\(.usageStart) - \(.usageEnd))"' 2>/dev/null || {
        print_warning "Dados de custo disponíveis mas não puderam ser formatados"
        print_info "Execute: az consumption usage list --start-date $START_DATE --end-date $END_DATE"
    }
else
    print_warning "Dados de custo não disponíveis ainda (recursos muito novos)"
    print_info "Custos começam a aparecer após 24-48 horas de uso"
    print_info "Consulte o portal: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/costanalysis"
fi

echo ""
print_success "Análise de custos concluída!"
echo ""
