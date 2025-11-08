# Azure Deployment Scripts - Passa Bola

Scripts automatizados para deploy completo da aplicação Passa Bola no Azure Container Apps.

## 🚀 Quick Start

### Pré-requisitos

1. **Azure CLI instalado e autenticado:**
```bash
az login
```

2. **Docker rodando:**
```bash
docker info
```

3. **Arquivo .env.azure configurado** na raiz do projeto com:
```bash
MYSQL_ADMIN_PASSWORD="suasenha"
JWT_SECRET="seu-jwt-secret"
AZURE_STORAGE_ACCOUNT_NAME="stdev2495531"
AZURE_STORAGE_ACCOUNT_KEY="sua-key"
AZURE_STORAGE_CONNECTION_STRING="sua-connection-string"
AZURE_STORAGE_BLOB_ENDPOINT="https://stdev2495531.blob.core.windows.net"
GOOGLE_API_KEY="sua-google-api-key"
SERPAPI_API_KEY="sua-serpapi-key"
```

### Deploy Completo (Recomendado)

```bash
cd azure-scripts
chmod +x *.sh
./deploy-all.sh
```

Isso executará todo o processo automaticamente:
1. Criar infraestrutura (MySQL, ACR, Container Apps Environment)
2. Build e push de imagens (API e Chatbot)
3. Deploy de serviços (API → Chatbot → Frontend)
4. Configurar CORS

**Tempo estimado:** 15-25 minutos

### Deploy Manual (Passo a Passo)

Se preferir executar cada etapa separadamente:

```bash
# 1. Infraestrutura
./01-deploy-infrastructure.sh

# 2. Build e Push de Imagens
./02-deploy-images.sh

# 3. Deploy de Serviços
./03-deploy-services.sh

# 4. Configurar CORS
./04-configure-cors.sh
```

## 📁 Estrutura dos Scripts

```
azure-scripts/
├── deploy-all.sh                   # Script master (orquestra tudo)
├── 01-deploy-infrastructure.sh     # Cria RG, ACR, MySQL, etc
├── 02-deploy-images.sh             # Build e push API + Chatbot
├── 03-deploy-services.sh           # Deploy API, Chatbot, Frontend
└── 04-configure-cors.sh            # Ajusta CORS
```

## 🔧 Detalhes dos Scripts

### 01-deploy-infrastructure.sh
**O que faz:**
- Cria Resource Group
- Cria Azure Container Registry (ACR)
- Cria Log Analytics Workspace
- Cria Application Insights
- Cria MySQL Flexible Server com banco de dados
- Configura firewall do MySQL (AllowAzureServices)
- Cria Container Apps Environment

**Saída:** `azure-infrastructure.env`

### 02-deploy-images.sh
**O que faz:**
- Build da imagem da API (Spring Boot)
- Push da imagem da API para ACR
- Build da imagem do Chatbot (Flask)
- Push da imagem do Chatbot para ACR

**Nota:** Frontend é buildado no próximo script (precisa das URLs)

**Saída:** `azure-images-build.log`

### 03-deploy-services.sh
**O que faz:**
1. Deploy da API com todas as variáveis (MySQL, Storage, JWT)
2. Deploy do Chatbot com API Keys
3. Obtém URLs da API e Chatbot
4. **Build do Frontend com URLs corretas (build args)**
5. Push da imagem do Frontend para ACR
6. Deploy do Frontend
7. Health checks

**Saída:** `azure-urls.txt`

### 04-configure-cors.sh
**O que faz:**
- Configura CORS na API para aceitar apenas o Frontend
- Habilita WebSocket

## ⚙️ Opções do deploy-all.sh

```bash
# Deploy completo com confirmação
./deploy-all.sh

# Deploy completo sem confirmação
./deploy-all.sh --yes

# Deploy pulando infraestrutura (se já existe)
./deploy-all.sh --skip-infra

# Ajuda
./deploy-all.sh --help
```

## 📊 Monitoramento

### Ver logs em tempo real

**API:**
```bash
az containerapp logs show \
    --name ca-passa-bola-api \
    --resource-group rg-passa-bola \
    --follow
```

**Frontend:**
```bash
az containerapp logs show \
    --name ca-passa-bola-front \
    --resource-group rg-passa-bola \
    --follow
```

**Chatbot:**
```bash
az containerapp logs show \
    --name ca-passa-bola-chatbot \
    --resource-group rg-passa-bola \
    --follow
```

### Verificar status dos serviços

```bash
az containerapp list \
    --resource-group rg-passa-bola \
    --query "[].{Name:name, Status:properties.runningStatus, URL:properties.configuration.ingress.fqdn}" \
    --output table
```

### Health Checks

Após o deploy, verifique:

- **API:** https://ca-passa-bola-api.{region}.azurecontainerapps.io/actuator/health
- **Chatbot:** https://ca-passa-bola-chatbot.{region}.azurecontainerapps.io/health
- **Frontend:** https://ca-passa-bola-front.{region}.azurecontainerapps.io

## 🔍 Troubleshooting

### API não conecta ao MySQL

```bash
# Verificar firewall do MySQL
az mysql flexible-server firewall-rule list \
    --resource-group rg-passa-bola \
    --name mysql-passa-bola \
    --output table

# Deve ter: AllowAzureServices (0.0.0.0 - 0.0.0.0)
```

### Frontend não mostra dados

```bash
# Verificar variáveis de ambiente do Frontend
az containerapp show \
    --name ca-passa-bola-front \
    --resource-group rg-passa-bola \
    --query "properties.template.containers[0].env[].{Name:name, Value:value}" \
    --output table

# Deve ter NEXT_PUBLIC_API_URL e NEXT_PUBLIC_CHATBOT_URL
```

### Rebuild de um serviço específico

Se precisar fazer rebuild apenas do Frontend (após mudança de código):

```bash
cd ../front

# Obter URLs (substituir com suas URLs reais)
API_URL="https://ca-passa-bola-api.icyfield-c8812466.westus3.azurecontainerapps.io"
CHATBOT_URL="https://ca-passa-bola-chatbot.icyfield-c8812466.westus3.azurecontainerapps.io"

# Build com build args
docker build \
    --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
    --build-arg NEXT_PUBLIC_CHATBOT_URL="$CHATBOT_URL" \
    --build-arg NEXT_PUBLIC_CHAT_WS_URL="$API_URL/ws-chat-sockjs" \
    --build-arg NEXT_PUBLIC_NOTIFICATION_WS_URL="$API_URL/ws-sockjs" \
    -t crpassabola.azurecr.io/front-passa-bola:latest .

# Push
docker push crpassabola.azurecr.io/front-passa-bola:latest

# Update container app
az containerapp update \
    --name ca-passa-bola-front \
    --resource-group rg-passa-bola \
    --image crpassabola.azurecr.io/front-passa-bola:latest
```

## 🧹 Limpeza (Deletar Tudo)

**⚠️ CUIDADO:** Isso deletará TODOS os recursos!

```bash
# Deletar resource group inteiro
az group delete --name rg-passa-bola --yes --no-wait

# Verificar se foi deletado
az group show --name rg-passa-bola
# Deve retornar erro "ResourceGroupNotFound"
```

## 📝 Arquivos Gerados

Após o deploy, você terá:

- **azure-infrastructure.env** - Credenciais e IDs da infraestrutura
- **azure-urls.txt** - URLs dos serviços deployados
- **azure-images-build.log** - Log do build de imagens

**⚠️ NUNCA commite esses arquivos no Git!** (já estão no .gitignore)

## 🔐 Segurança

- Senhas e secrets são passados via variáveis de ambiente
- MySQL usa TLS (useSSL=true)
- CORS configurado para aceitar apenas o frontend
- Firewall do MySQL restringe acesso
- Container Apps usa managed identities quando possível

## 📚 Documentação Adicional

- **AZURE_DEPLOY_FIXES.md** - Relatório detalhado de problemas corrigidos
- **azure-config.json** - Configuração base do projeto

## 🆘 Suporte

Se encontrar problemas:

1. Leia o arquivo `AZURE_DEPLOY_FIXES.md` para entender as correções aplicadas
2. Verifique os logs dos containers
3. Verifique o status dos recursos no Azure Portal
4. Execute health checks manualmente

## ✅ Checklist Pré-Deploy

- [ ] Azure CLI instalado e autenticado (`az login`)
- [ ] Docker rodando (`docker info`)
- [ ] Arquivo `.env.azure` criado com todas as variáveis
- [ ] Arquivo `azure-config.json` existe
- [ ] Tem permissões de Contributor na subscription
- [ ] Storage account `stdev2495531` existe e tem acesso

## 🎉 Sucesso!

Se tudo correu bem, você verá:

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🎉 DEPLOY COMPLETO COM SUCESSO! 🎉                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🌐 URLs dos Serviços:

  🌍 Frontend:  https://ca-passa-bola-front...
  🔧 API:       https://ca-passa-bola-api...
  🤖 Chatbot:   https://ca-passa-bola-chatbot...
```

Acesse o Frontend e teste a aplicação!

---

**Desenvolvido com ❤️ para o projeto Passa Bola**
