# ⚡ Guia Rápido de Deploy Azure - Passa-Bola

## 🚀 Deploy em 3 Passos

```bash
# 1. Configure
cp .env.azure.example .env.azure && nano .env.azure

# 2. Execute o menu
./azure-deploy.sh

# 3. Escolha a opção 4 (Deploy completo)
```

## 📋 Comandos Essenciais

### Deploy Completo

```bash
cd azure-scripts
./01-deploy-infrastructure.sh && ./02-deploy-images.sh && ./03-deploy-services.sh
```

### Verificar Status

```bash
source azure-infrastructure.env
az containerapp list --resource-group $AZURE_RESOURCE_GROUP --output table
```

### Ver URLs

```bash
cat azure-urls.txt
```

### Ver Logs

```bash
# API
az containerapp logs show --name ca-passa-bola-api --resource-group rg-passa-bola --follow

# Frontend
az containerapp logs show --name ca-passa-bola-front --resource-group rg-passa-bola --follow

# Chatbot
az containerapp logs show --name ca-passa-bola-chatbot --resource-group rg-passa-bola --follow
```

### Atualizar Apenas um Serviço

```bash
# Exemplo: Atualizar API
cd api
docker build -f Dockerfile.azure -t crpassabola.azurecr.io/api-passa-bola:latest .
docker push crpassabola.azurecr.io/api-passa-bola:latest

az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --image crpassabola.azurecr.io/api-passa-bola:latest
```

### Escalar Serviço

```bash
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --min-replicas 2 \
  --max-replicas 5
```

### Reiniciar Serviço

```bash
az containerapp revision restart \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola
```

### Cleanup (Remover Tudo)

```bash
cd azure-scripts
./cleanup-azure.sh
```

## 🔧 Troubleshooting Rápido

### Container não inicia

```bash
# Ver logs detalhados
az containerapp logs show --name ca-passa-bola-api --resource-group rg-passa-bola --follow

# Ver revisões
az containerapp revision list --name ca-passa-bola-api --resource-group rg-passa-bola --output table
```

### Erro de build Docker

```bash
# Limpar cache
docker system prune -a

# Build com verbose
docker build -f Dockerfile.azure --progress=plain --no-cache .
```

### Erro de conexão MySQL

```bash
# Verificar firewall
az mysql flexible-server firewall-rule list \
  --name mysql-passa-bola \
  --resource-group rg-passa-bola

# Testar conexão
mysql -h mysql-passa-bola.mysql.database.azure.com -u passabolaadmin -p
```

### Azure CLI não funciona

```bash
# Re-login
az logout
az login

# Verificar subscription
az account list --output table
az account set --subscription "SUA_SUBSCRIPTION"
```

## 📊 Monitoramento

### Portal Azure

```
https://portal.azure.com
→ Resource Groups
→ rg-passa-bola
```

### Application Insights

```
https://portal.azure.com
→ Application Insights
→ ai-passa-bola
```

### Métricas via CLI

```bash
# CPU
az monitor metrics list \
  --resource $(az containerapp show --name ca-passa-bola-api --resource-group rg-passa-bola --query id -o tsv) \
  --metric "CpuUsageNanocores"

# Memória
az monitor metrics list \
  --resource $(az containerapp show --name ca-passa-bola-api --resource-group rg-passa-bola --query id -o tsv) \
  --metric "WorkingSetBytes"
```

## 💰 Custos

### Ver custos atuais

```
https://portal.azure.com
→ Cost Management + Billing
→ Cost Analysis
```

### Custos estimados (configuração padrão)

- Container Apps: ~$15-30/mês
- MySQL: ~$15-20/mês
- ACR: ~$5/mês
- Application Insights: ~$0-10/mês
- **Total: ~$35-65/mês**

## 🔐 Segurança

### Rotacionar senha do MySQL

```bash
az mysql flexible-server update \
  --resource-group rg-passa-bola \
  --name mysql-passa-bola \
  --admin-password "NovaSenhaSegura123!@#"

# Atualizar no Container App
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --set-env-vars SPRING_DATASOURCE_PASSWORD="NovaSenhaSegura123!@#"
```

### Ver credenciais do ACR

```bash
az acr credential show --name crpassabola --resource-group rg-passa-bola
```

## 📱 URLs Úteis

```bash
# Obter URLs programaticamente
API_URL=$(az containerapp show --name ca-passa-bola-api --resource-group rg-passa-bola --query properties.configuration.ingress.fqdn -o tsv)
echo "https://${API_URL}"

FRONT_URL=$(az containerapp show --name ca-passa-bola-front --resource-group rg-passa-bola --query properties.configuration.ingress.fqdn -o tsv)
echo "https://${FRONT_URL}"

CHATBOT_URL=$(az containerapp show --name ca-passa-bola-chatbot --resource-group rg-passa-bola --query properties.configuration.ingress.fqdn -o tsv)
echo "https://${CHATBOT_URL}"
```

## 🎯 Checklist de Deploy

- [ ] Azure CLI instalado
- [ ] Docker instalado e rodando
- [ ] jq instalado
- [ ] Logado na Azure (`az login`)
- [ ] Arquivo `.env.azure` configurado
- [ ] Executou `check-prerequisites.sh`
- [ ] Executou script 01 (infraestrutura)
- [ ] Executou script 02 (imagens)
- [ ] Executou script 03 (serviços)
- [ ] Testou as URLs
- [ ] Verificou logs
- [ ] Configurou monitoramento

## 📚 Arquivos de Referência

- **DEPLOY-AZURE.md** - Documentação completa
- **AZURE-STRUCTURE.md** - Estrutura de arquivos
- **azure-scripts/README.md** - Docs dos scripts
- Este arquivo - Referência rápida

## 🆘 Suporte

1. Veja troubleshooting em `DEPLOY-AZURE.md`
2. Execute `./azure-scripts/check-prerequisites.sh`
3. Consulte logs: `./azure-deploy.sh` → opções 7, 8, 9
4. Portal Azure: https://portal.azure.com

---

**Passa-Bola na Azure - Deploy simplificado! ⚽☁️**
