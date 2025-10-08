# 🚀 Deploy do Passa-Bola na Azure

Este guia completo irá te ajudar a fazer o deploy da aplicação **Passa-Bola** na Microsoft Azure usando Azure CLI e Azure Container Apps.

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Arquitetura na Azure](#-arquitetura-na-azure)
- [Custos Estimados](#-custos-estimados)
- [Passo a Passo](#-passo-a-passo)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)
- [Limpeza de Recursos](#-limpeza-de-recursos)

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### 1. Azure CLI

```bash
# Verificar instalação
az --version

# Se não estiver instalado:
# Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# macOS
brew install azure-cli

# Windows
# Baixe o instalador: https://aka.ms/installazurecliwindows
```

### 2. Docker

```bash
# Verificar instalação
docker --version

# O Docker é necessário para fazer build das imagens
# Instalação: https://docs.docker.com/get-docker/
```

### 3. jq (para parsing de JSON)

```bash
# Verificar instalação
jq --version

# Se não estiver instalado:
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Windows (via Chocolatey)
choco install jq
```

### 4. Conta Azure

- Crie uma conta gratuita em: https://azure.microsoft.com/free/
- A conta gratuita inclui $200 de créditos para os primeiros 30 dias
- Alguns serviços têm tier gratuito permanente

---

## 🏗️ Arquitetura na Azure

A aplicação será deployada com a seguinte arquitetura:

```
┌─────────────────────────────────────────────────────┐
│            Azure Container Apps Environment          │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Frontend   │  │     API      │  │  Chatbot  │ │
│  │  (Next.js)   │  │ (Spring Boot)│  │  (Flask)  │ │
│  │    Port:3000 │  │   Port:8080  │  │ Port:5000 │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                  │       │
│         └─────────────────┴──────────────────┘       │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Azure Database for   │
                │  MySQL Flexible Server│
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Application Insights │
                │    (Monitoramento)    │
                └───────────────────────┘
```

### Componentes:

- **Azure Container Registry (ACR):** Armazena as imagens Docker
- **Azure Container Apps:** Hospeda os containers (API, Frontend, Chatbot)
- **Azure Database for MySQL:** Banco de dados gerenciado
- **Application Insights:** Monitoramento e logs
- **Log Analytics Workspace:** Coleta de métricas e logs

---

## 💰 Custos Estimados

Com a configuração padrão (Burstable tier para banco, Basic SKU para ACR):

| Serviço               | Configuração         | Custo Mensal Estimado (USD) |
| --------------------- | -------------------- | --------------------------- |
| Container Apps        | 3 apps (Consumption) | ~$15-30                     |
| MySQL Flexible Server | Standard_B1ms        | ~$15-20                     |
| Container Registry    | Basic                | ~$5                         |
| Application Insights  | 5GB inclusos         | ~$0-10                      |
| **TOTAL**             |                      | **~$35-65/mês**             |

> 💡 **Dica:** Use os créditos gratuitos da Azure ($200) para testar sem custo inicial!

---

## 🚀 Passo a Passo

### Passo 0: Preparação

#### 1. Faça login na Azure:

```bash
az login
```

Isso abrirá seu navegador para autenticação. Após o login, você verá suas subscriptions.

#### 2. Configure a subscription (se tiver múltiplas):

```bash
# Liste as subscriptions disponíveis
az account list --output table

# Defina a subscription desejada
az account set --subscription "Nome ou ID da Subscription"
```

#### 3. Clone o projeto e navegue até a pasta:

```bash
cd /caminho/para/passa-bola-build
```

#### 4. Obtenha as API Keys necessárias:

Antes de iniciar o deploy, você precisará obter as seguintes chaves:

**a) Google AI (Gemini) API Key** (para o Chatbot):

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada (formato: `AIzaSy...`)

**b) SerpAPI Key** (para buscas no Google pelo Chatbot):

1. Acesse: https://serpapi.com/manage-api-key
2. Crie uma conta gratuita (100 buscas/mês grátis)
3. Copie sua API key

**c) Senha do MySQL** (você define):

- Deve ter pelo menos 8 caracteres
- Incluir letras maiúsculas, minúsculas, números e símbolos
- Exemplo: `P@ssaBola2025!`

**d) JWT Secret** (gerado automaticamente):

- Será gerado pelo script de configuração
- Ou gere manualmente: `openssl rand -base64 32`

#### 5. Teste os pré-requisitos:

```bash
# Verificar Azure CLI
az --version

# Verificar Docker
docker --version

# Verificar jq
jq --version

# Se algum estiver faltando, instale conforme a seção de pré-requisitos
```

### Passo 1: Criar a Infraestrutura

Este script cria todos os recursos base na Azure:

- Resource Group
- Container Registry
- MySQL Database
- Application Insights
- Container Apps Environment

```bash
cd azure-scripts
chmod +x *.sh
./01-deploy-infrastructure.sh
```

**O que acontece:**

- ✅ Cria o Resource Group na região Brazil South (São Paulo)
- ✅ Cria o Azure Container Registry para armazenar imagens Docker
- ✅ Cria o Azure Database for MySQL Flexible Server
- ✅ Configura Application Insights para monitoramento
- ✅ Cria o ambiente do Container Apps
- ✅ Salva as informações em `azure-infrastructure.env`

**Tempo estimado:** 5-10 minutos

### Passo 2: Build e Push das Imagens Docker

Este script faz o build das imagens Docker e envia para o ACR:

```bash
./02-deploy-images.sh
```

**O que acontece:**

- ✅ Faz login no Azure Container Registry
- ✅ Faz build da imagem da API (Spring Boot)
- ✅ Faz build da imagem do Frontend (Next.js)
- ✅ Faz build da imagem do Chatbot (Flask)
- ✅ Faz push de todas as imagens para o ACR

**Tempo estimado:** 10-20 minutos (dependendo da conexão)

### Passo 3: Deploy dos Serviços

Este script faz o deploy dos Container Apps:

```bash
./03-deploy-services.sh
```

**O que acontece:**

- ✅ Deploy da API (sem variáveis de ambiente ainda)
- ✅ Deploy do Chatbot (sem API keys ainda)
- ✅ Deploy do Frontend (sem URLs de backend ainda)
- ✅ Configura ingress (acesso externo) para todos os serviços
- ✅ Salva as URLs em `azure-urls.txt`

**Tempo estimado:** 5-10 minutos

> ⚠️ **IMPORTANTE:** Os serviços foram deployados mas ainda NÃO estão funcionais! Você precisa configurar as variáveis de ambiente no próximo passo.

### Passo 4: Configurar Variáveis de Ambiente e Secrets

**ESTE É O PASSO MAIS IMPORTANTE!** Sem as variáveis de ambiente, os serviços não funcionarão.

#### Opção A: Script Automatizado (RECOMENDADO) 🚀

Execute o script que configura tudo automaticamente:

```bash
./04-configure-env-vars.sh
```

**O script irá:**

1. **Pedir as informações necessárias:**

   - Senha do MySQL (que você definiu no Passo 0)
   - Google AI API Key (obtida no Passo 0)
   - SerpAPI Key (obtida no Passo 0)
   - Gerar JWT secret automaticamente

2. **Configurar automaticamente:**

   - ✅ **API:** Database URL, credenciais MySQL, JWT secret, CORS
   - ✅ **Chatbot:** Google API Key, SerpAPI Key, configurações de produção
   - ✅ **Frontend:** URLs da API e Chatbot

3. **Criar secrets no Azure:**

   - Senhas e API keys são armazenadas de forma segura
   - Não aparecem em logs nem na interface

4. **Verificar configurações:**

   - Lista todas as variáveis configuradas
   - Salva informações em `azure-env-info.txt`

5. **Reiniciar containers** (se você aceitar):
   - Aplica as mudanças imediatamente

**Tempo estimado:** 2-3 minutos

**Exemplo de execução:**

```bash
$ ./04-configure-env-vars.sh

==============================================
  🔐 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
==============================================

ℹ Vamos coletar as informações necessárias...

Digite a senha do Azure Database for MySQL: ********
ℹ Gerando JWT secret seguro...
✓ JWT secret gerado: 7Xk9mP2n... (256 bits)

Digite sua Google AI (Gemini) API Key: AIzaSy...
Digite sua SerpAPI Key: abc123...

⚠ Confirme os dados:
  Resource Group: rg-passa-bola
  Database Server: mysql-passa-bola
  API App: ca-passa-bola-api
  Frontend App: ca-passa-bola-front
  Chatbot App: ca-passa-bola-chatbot

Continuar? (s/N): s

ℹ Criando secrets da API...
✓ Secrets da API criados
✓ Variáveis de ambiente da API configuradas

ℹ Criando secrets do Chatbot...
✓ Secrets do Chatbot criados
✓ Variáveis de ambiente do Chatbot configuradas

✓ Variáveis de ambiente do Frontend configuradas

Deseja reiniciar os containers? (s/N): s

==============================================
✓ CONFIGURAÇÃO CONCLUÍDA!
==============================================
```

#### Opção B: Configuração Manual via Azure CLI 💻

Se preferir configurar manualmente, siga estes comandos:

**1. Configure a API:**

```bash
# Defina suas variáveis
DB_PASSWORD="SuaSenhaMySQL123!"
JWT_SECRET=$(openssl rand -base64 32)

# Crie os secrets
az containerapp secret set \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --secrets \
    db-password="$DB_PASSWORD" \
    jwt-secret="$JWT_SECRET"

# Configure as variáveis de ambiente
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "SPRING_DATASOURCE_URL=jdbc:mysql://mysql-passa-bola.mysql.database.azure.com:3306/api_passa_bola?useSSL=true&requireSSL=true" \
    "SPRING_DATASOURCE_USERNAME=passabolaadmin@mysql-passa-bola" \
    "SPRING_DATASOURCE_PASSWORD=secretref:db-password" \
    "JWT_SECRET=secretref:jwt-secret" \
    "JWT_EXPIRATION=3600000"
```

**2. Configure o Chatbot:**

```bash
# Defina suas API keys
GOOGLE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXX"
SERPAPI_KEY="abc123def456ghi789"

# Crie os secrets
az containerapp secret set \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --secrets \
    google-api-key="$GOOGLE_API_KEY" \
    serpapi-key="$SERPAPI_KEY"

# Configure as variáveis
az containerapp update \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "GOOGLE_API_KEY=secretref:google-api-key" \
    "SERPAPI_API_KEY=secretref:serpapi-key" \
    "ENVIRONMENT=production" \
    "FLASK_DEBUG=False"
```

**3. Configure o Frontend:**

```bash
# Obter URLs dos outros serviços
API_URL=$(az containerapp show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

CHATBOT_URL=$(az containerapp show \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Configure as variáveis
az containerapp update \
  --name ca-passa-bola-front \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "NEXT_PUBLIC_API_URL=https://${API_URL}" \
    "NEXT_PUBLIC_CHATBOT_URL=https://${CHATBOT_URL}" \
    "NODE_ENV=production"
```

#### Opção C: Configuração via Azure Portal 🖱️

Se preferir usar a interface gráfica:

1. **Acesse:** https://portal.azure.com
2. **Navegue:** Menu lateral → "Container Apps"
3. **Selecione:** `ca-passa-bola-chatbot` (exemplo)
4. **Configure:**
   - Menu lateral → "Containers" → "Edit and deploy"
   - Aba "Secrets" → "+ Add":
     - Key: `google-api-key`, Value: sua chave
     - Key: `serpapi-key`, Value: sua chave
   - Aba "Environment variables" → "+ Add":
     - Name: `GOOGLE_API_KEY`, Source: Reference a secret, Value: `google-api-key`
     - Name: `SERPAPI_API_KEY`, Source: Reference a secret, Value: `serpapi-key`
     - Name: `ENVIRONMENT`, Source: Manual entry, Value: `production`
     - Name: `FLASK_DEBUG`, Source: Manual entry, Value: `False`
5. **Salvar:** Clique em "Create"

Repita para API e Frontend com suas respectivas variáveis.

> 📚 **Documentação detalhada:** Consulte o arquivo `AZURE-ENV-VARS.md` para guia completo com todas as variáveis, troubleshooting e melhores práticas.

### Passo 5: Verificar o Deploy

Após configurar as variáveis de ambiente, verifique se tudo está funcionando:

#### 1. Ver as URLs dos serviços:

```bash
cat ../azure-urls.txt
```

Ou obtenha diretamente:

```bash
# API URL
az containerapp show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# Frontend URL
az containerapp show \
  --name ca-passa-bola-front \
  --resource-group rg-passa-bola \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# Chatbot URL
az containerapp show \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

#### 2. Testar Health Endpoints:

```bash
# Definir URLs (use as URLs reais obtidas acima)
API_URL="https://ca-passa-bola-api.XXX.brazilsouth.azurecontainerapps.io"
FRONT_URL="https://ca-passa-bola-front.XXX.brazilsouth.azurecontainerapps.io"
CHATBOT_URL="https://ca-passa-bola-chatbot.XXX.brazilsouth.azurecontainerapps.io"

# Testar API
curl $API_URL/actuator/health
# Resposta esperada: {"status":"UP"}

# Testar Frontend
curl $FRONT_URL/api/health
# Resposta esperada: {"status":"UP","timestamp":"...","service":"passa-bola-frontend"}

# Testar Chatbot
curl $CHATBOT_URL/health
# Resposta esperada: {"status":"UP","timestamp":"...","service":"passa-bola-chatbot"}
```

#### 3. Testar funcionalidades:

**a) Testar Chatbot:**

```bash
curl -X POST $CHATBOT_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "O que é o Passabola?"}'
```

**Resposta esperada:**

```json
{
  "reply": "O Passabola é uma plataforma dedicada ao futebol feminino..."
}
```

**b) Testar API (criar usuário):**

```bash
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "email": "teste@exemplo.com",
    "password": "Senha123!"
  }'
```

**c) Acessar Frontend:**

Abra o navegador e acesse a URL do frontend:

```
https://ca-passa-bola-front.XXX.brazilsouth.azurecontainerapps.io
```

#### 4. Verificar logs em tempo real:

```bash
# API
az containerapp logs show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --follow

# Chatbot
az containerapp logs show \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --follow

# Frontend
az containerapp logs show \
  --name ca-passa-bola-front \
  --resource-group rg-passa-bola \
  --follow
```

**O que procurar nos logs:**

- ✅ "Started Application in X seconds" (API)
- ✅ "Ready in X ms" (Frontend)
- ✅ "Booting worker" (Chatbot)
- ❌ "Error" ou "Exception" indicam problemas

#### 5. Verificar status dos containers:

```bash
az containerapp list \
  --resource-group rg-passa-bola \
  --output table
```

**Status esperado:**

```
Name                   Location      ResourceGroup    Status
---------------------  ------------  ---------------  --------
ca-passa-bola-api      brazilsouth   rg-passa-bola    Running
ca-passa-bola-front    brazilsouth   rg-passa-bola    Running
ca-passa-bola-chatbot  brazilsouth   rg-passa-bola    Running
```

#### 6. Verificar variáveis de ambiente configuradas:

```bash
# Ver variáveis da API
az containerapp show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --query "properties.template.containers[0].env[].{Name:name, Value:value}" \
  --output table

# Ver secrets configurados (valores não aparecem por segurança)
az containerapp secret list \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --output table
```

---

## 🛠️ Comandos Úteis

### Ver logs dos Container Apps

```bash
# API
az containerapp logs show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --follow

# Frontend
az containerapp logs show \
  --name ca-passa-bola-front \
  --resource-group rg-passa-bola \
  --follow

# Chatbot
az containerapp logs show \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --follow
```

### Ver status dos serviços

```bash
az containerapp list \
  --resource-group rg-passa-bola \
  --output table
```

### Atualizar um serviço específico

Se você fez alterações apenas na API, por exemplo:

```bash
# Rebuild e push da imagem
cd ../api
docker build -f Dockerfile.azure -t crpassabola.azurecr.io/api-passa-bola:latest .
docker push crpassabola.azurecr.io/api-passa-bola:latest

# Atualizar o Container App
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --image crpassabola.azurecr.io/api-passa-bola:latest
```

### Escalar um serviço

```bash
# Aumentar réplicas da API
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --min-replicas 2 \
  --max-replicas 5
```

### Conectar ao MySQL

```bash
# Obter o host do MySQL
mysql -h mysql-passa-bola.mysql.database.azure.com \
      -u passabolaadmin \
      -p \
      api_passa_bola
```

---

## 🔧 Troubleshooting

### Problema: "Az command not found"

**Causa:** Azure CLI não instalado.

**Solução:**

```bash
# Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# macOS
brew install azure-cli

# Verificar
az --version
```

### Problema: "Docker daemon is not running"

**Causa:** Docker não está rodando.

**Solução:**

```bash
# Linux
sudo systemctl start docker
sudo systemctl enable docker  # Iniciar automaticamente

# Verificar
docker ps
```

### Problema: Container App não inicia ou fica em "Provisioning"

**Causa:** Erro na imagem Docker ou falta de variáveis de ambiente.

**Diagnóstico:**

```bash
# Ver logs detalhados
az containerapp logs show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --follow

# Ver revisões
az containerapp revision list \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --output table

# Ver status da última revisão
az containerapp revision show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --revision <revision-name>
```

**Solução comum:** Configure as variáveis de ambiente (Passo 4).

### Problema: "GOOGLE_API_KEY not found" ou "SERPAPI_API_KEY not found"

**Causa:** Variáveis de ambiente do Chatbot não configuradas.

**Solução:**

```bash
# Verificar se secrets existem
az containerapp secret list \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola

# Se não existirem, configure:
./04-configure-env-vars.sh

# Ou manualmente:
az containerapp secret set \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --secrets \
    google-api-key="AIzaSyXXXXXXXXXXXXXX" \
    serpapi-key="abc123def456"

az containerapp update \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "GOOGLE_API_KEY=secretref:google-api-key" \
    "SERPAPI_API_KEY=secretref:serpapi-key"
```

### Problema: Erro de conexão com MySQL ("Connection refused")

**Causa:** Variáveis de ambiente da API não configuradas ou firewall bloqueando.

**Diagnóstico:**

```bash
# 1. Verificar variáveis de ambiente
az containerapp show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --query "properties.template.containers[0].env[].{Name:name, Value:value}" \
  --output table

# 2. Verificar firewall do MySQL
az mysql flexible-server firewall-rule list \
  --name mysql-passa-bola \
  --resource-group rg-passa-bola

# 3. Verificar se MySQL está rodando
az mysql flexible-server show \
  --name mysql-passa-bola \
  --resource-group rg-passa-bola \
  --query state
```

**Solução:**

```bash
# Garantir que Azure Services pode acessar
az mysql flexible-server firewall-rule create \
  --resource-group rg-passa-bola \
  --name mysql-passa-bola \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Configurar variáveis de ambiente
./04-configure-env-vars.sh
```

### Problema: "Invalid JWT token" ou "JWT secret not configured"

**Causa:** JWT_SECRET não configurado na API.

**Solução:**

```bash
# Gerar novo JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Configurar
az containerapp secret set \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --secrets jwt-secret="$JWT_SECRET"

az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --set-env-vars "JWT_SECRET=secretref:jwt-secret"
```

### Problema: CORS error no Frontend

**Causa:** API não permite requisições do frontend.

**Solução:**

```bash
# Obter URL do frontend
FRONT_URL=$(az containerapp show \
  --name ca-passa-bola-front \
  --resource-group rg-passa-bola \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Atualizar CORS na API
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --set-env-vars "CORS_ALLOWED_ORIGINS=https://${FRONT_URL}"

# Reiniciar API
az containerapp revision restart \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola
```

### Problema: Build das imagens falha ("No space left on device")

**Causa:** Disco cheio ou cache Docker muito grande.

**Solução:**

```bash
# Limpar cache do Docker
docker system prune -a --volumes

# Ver espaço em disco
df -h

# Tentar build novamente com verbose
docker build -f Dockerfile.azure --progress=plain --no-cache .
```

### Problema: "Quota exceeded" ou "Limit exceeded"

**Causa:** Subscription atingiu limites de recursos.

**Solução:**

1. Verificar quotas:

```bash
az vm list-usage --location brazilsouth --output table
```

2. Solicitar aumento de quota no portal Azure
3. Ou usar outra região:

```bash
# Editar azure-config.json e trocar "brazilsouth" por "eastus2"
```

### Problema: Health check falha continuamente

**Causa:** Aplicação não está iniciando ou endpoint incorreto.

**Diagnóstico:**

```bash
# Ver logs
az containerapp logs show \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --follow

# Testar health manualmente dentro do container
az containerapp exec \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --command "curl localhost:8080/actuator/health"
```

**Solução:**

- Verificar se todas as variáveis de ambiente estão configuradas
- Verificar logs para erros de inicialização
- Aumentar `start-period` do healthcheck se aplicação demora para iniciar

### Problema: "Image pull failed" ou "ImagePullBackOff"

**Causa:** Container Registry não acessível ou imagem não existe.

**Diagnóstico:**

```bash
# Verificar se imagem existe no ACR
az acr repository list \
  --name crpassabola \
  --output table

# Verificar tags da imagem
az acr repository show-tags \
  --name crpassabola \
  --repository api-passa-bola \
  --output table
```

**Solução:**

```bash
# Fazer login no ACR
az acr login --name crpassabola

# Rebuild e push da imagem
cd api
docker build -f Dockerfile.azure -t crpassabola.azurecr.io/api-passa-bola:latest .
docker push crpassabola.azurecr.io/api-passa-bola:latest
```

---

## 🗑️ Limpeza de Recursos

### Opção 1: Remover tudo (Recomendado para testes)

```bash
cd azure-scripts
./cleanup-azure.sh
```

Este script remove:

- ✅ Todos os Container Apps
- ✅ Container Apps Environment
- ✅ Azure Container Registry
- ✅ Azure Database for MySQL
- ✅ Application Insights
- ✅ Log Analytics Workspace
- ✅ Resource Group completo

### Opção 2: Remover apenas os Container Apps (manter infraestrutura)

```bash
# Deletar apenas os apps
az containerapp delete --name ca-passa-bola-api --resource-group rg-passa-bola --yes
az containerapp delete --name ca-passa-bola-front --resource-group rg-passa-bola --yes
az containerapp delete --name ca-passa-bola-chatbot --resource-group rg-passa-bola --yes
```

### Opção 3: Remover Resource Group completo (via CLI)

```bash
az group delete --name rg-passa-bola --yes --no-wait
```

> ⚠️ **ATENÇÃO:** Deletar o Resource Group remove TODOS os recursos dentro dele permanentemente!

---

## 📊 Monitoramento

### Application Insights

Acesse o portal Azure e navegue até Application Insights para ver:

- ✅ Tempo de resposta das requisições
- ✅ Taxas de erro
- ✅ Dependências (MySQL, etc.)
- ✅ Logs de aplicação
- ✅ Métricas personalizadas

**URL:** https://portal.azure.com → Resource Group → Application Insights

### Container Apps Metrics

```bash
# Ver métricas de CPU
az monitor metrics list \
  --resource /subscriptions/{sub-id}/resourceGroups/rg-passa-bola/providers/Microsoft.App/containerApps/ca-passa-bola-api \
  --metric "CpuUsageNanocores"

# Ver métricas de memória
az monitor metrics list \
  --resource /subscriptions/{sub-id}/resourceGroups/rg-passa-bola/providers/Microsoft.App/containerApps/ca-passa-bola-api \
  --metric "WorkingSetBytes"
```

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido, considere:

1. **Custom Domain:** Configure um domínio personalizado
2. **SSL/TLS:** Configure certificados (Let's Encrypt via Azure)
3. **CI/CD:** Configure GitHub Actions para deploy automático
4. **Backup:** Configure backups automáticos do MySQL
5. **Scaling:** Ajuste as regras de auto-scaling conforme necessário
6. **Monitoring Alerts:** Configure alertas no Application Insights

---

## � Checklist Completo de Deploy

Use este checklist para garantir que todos os passos foram executados:

### Antes do Deploy:

- [ ] Azure CLI instalado e configurado (`az --version`)
- [ ] Docker instalado e rodando (`docker ps`)
- [ ] jq instalado (`jq --version`)
- [ ] Login na Azure realizado (`az login`)
- [ ] Subscription correta selecionada
- [ ] **Google AI API Key obtida** (https://makersuite.google.com/app/apikey)
- [ ] **SerpAPI Key obtida** (https://serpapi.com/manage-api-key)
- [ ] **Senha do MySQL definida** (forte, com 8+ caracteres)

### Durante o Deploy:

- [ ] **Passo 1:** Infraestrutura criada (`./01-deploy-infrastructure.sh`)
  - [ ] Resource Group criado
  - [ ] Container Registry criado
  - [ ] MySQL Database criado
  - [ ] Application Insights criado
  - [ ] Container Apps Environment criado
- [ ] **Passo 2:** Imagens construídas e enviadas (`./02-deploy-images.sh`)
  - [ ] Imagem da API no ACR
  - [ ] Imagem do Frontend no ACR
  - [ ] Imagem do Chatbot no ACR
- [ ] **Passo 3:** Serviços deployados (`./03-deploy-services.sh`)
  - [ ] API deployada
  - [ ] Frontend deployado
  - [ ] Chatbot deployado
- [ ] **Passo 4:** Variáveis de ambiente configuradas (`./04-configure-env-vars.sh`)
  - [ ] **API:** Database, JWT secret configurados
  - [ ] **Chatbot:** Google API Key, SerpAPI Key configurados
  - [ ] **Frontend:** URLs da API e Chatbot configurados
  - [ ] Containers reiniciados

### Após o Deploy:

- [ ] **Passo 5:** Verificações realizadas
  - [ ] URLs dos serviços obtidas
  - [ ] Health checks testados (API, Frontend, Chatbot)
  - [ ] Chatbot testado (enviar mensagem)
  - [ ] API testada (criar usuário)
  - [ ] Frontend acessado no navegador
  - [ ] Logs verificados (sem erros críticos)
  - [ ] Status dos containers: Running

### Configuração Adicional (Opcional):

- [ ] Custom domain configurado
- [ ] SSL/TLS certificate configurado
- [ ] CI/CD pipeline configurado (GitHub Actions)
- [ ] Backups automáticos do MySQL configurados
- [ ] Alertas no Application Insights configurados
- [ ] Auto-scaling configurado

---

## �📚 Referências

### Documentação Oficial Azure:

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Database for MySQL Documentation](https://learn.microsoft.com/azure/mysql/)
- [Azure CLI Reference](https://learn.microsoft.com/cli/azure/)
- [Application Insights Documentation](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Azure Container Registry Documentation](https://learn.microsoft.com/azure/container-registry/)

### Documentação do Projeto:

- **AZURE-ENV-VARS.md** - Guia completo de variáveis de ambiente
- **AZURE-STRUCTURE.md** - Estrutura detalhada do projeto Azure
- **QUICK-REFERENCE.md** - Referência rápida de comandos
- **azure-scripts/README.md** - Documentação dos scripts

### APIs Externas:

- [Google AI Studio (Gemini)](https://makersuite.google.com/app/apikey)
- [SerpAPI Documentation](https://serpapi.com/search-api)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Suporte

Se encontrar problemas durante o deploy:

### 1. Consulte a documentação:

- Seção **Troubleshooting** acima
- Arquivo **AZURE-ENV-VARS.md** (variáveis de ambiente)
- Logs dos containers (`az containerapp logs show`)

### 2. Comandos úteis para diagnóstico:

```bash
# Status geral
az containerapp list --resource-group rg-passa-bola --output table

# Logs em tempo real
az containerapp logs show --name ca-passa-bola-api --resource-group rg-passa-bola --follow

# Verificar variáveis configuradas
az containerapp show --name ca-passa-bola-api --resource-group rg-passa-bola \
  --query "properties.template.containers[0].env"

# Verificar secrets
az containerapp secret list --name ca-passa-bola-api --resource-group rg-passa-bola
```

### 3. Problemas comuns e soluções rápidas:

| Problema                   | Solução Rápida                               |
| -------------------------- | -------------------------------------------- |
| Container não inicia       | Verificar logs e variáveis de ambiente       |
| "GOOGLE_API_KEY not found" | Executar `./04-configure-env-vars.sh`        |
| Erro de conexão MySQL      | Verificar firewall e credenciais             |
| CORS error                 | Configurar `CORS_ALLOWED_ORIGINS` na API     |
| Health check falha         | Verificar se aplicação iniciou completamente |

### 4. Recursos adicionais:

- [Azure Support](https://azure.microsoft.com/support/)
- [Stack Overflow - Azure](https://stackoverflow.com/questions/tagged/azure)
- [Azure Community](https://techcommunity.microsoft.com/t5/azure/ct-p/Azure)

---

## 🎯 Próximos Passos Após Deploy

Após o deploy bem-sucedido, você pode:

### Configurações de Produção:

1. **Custom Domain e SSL:**

```bash
# Adicionar domínio customizado
az containerapp hostname add \
  --hostname www.passabola.com \
  --resource-group rg-passa-bola \
  --name ca-passa-bola-front

# Certificado SSL gerenciado
az containerapp hostname bind \
  --hostname www.passabola.com \
  --resource-group rg-passa-bola \
  --name ca-passa-bola-front \
  --environment cae-passa-bola \
  --validation-method CNAME
```

2. **Configurar CI/CD com GitHub Actions:**

- Automatizar build e deploy em cada commit
- Template disponível em `.github/workflows/` (a ser criado)

3. **Configurar Backups do MySQL:**

```bash
az mysql flexible-server backup show \
  --resource-group rg-passa-bola \
  --server-name mysql-passa-bola
```

4. **Monitoring e Alertas:**

- Configure alertas no Application Insights para:
  - Taxa de erro > 5%
  - Tempo de resposta > 2s
  - CPU ou memória > 80%

5. **Segurança:**

- Revisar CORS (não usar `*` em produção)
- Configurar Azure Key Vault para secrets
- Habilitar Azure AD authentication
- Configurar WAF (Web Application Firewall)

6. **Performance:**

- Ajustar regras de auto-scaling
- Configurar CDN para assets estáticos
- Habilitar cache de API

---

## 💡 Dicas Importantes

### 💰 Economia de Custos:

- Use tier "Burstable" para MySQL em desenvolvimento
- Configure auto-scaling adequadamente (evite over-provisioning)
- Deletar recursos quando não estiver usando (desenvolvimento)
- Use os $200 de créditos gratuitos da Azure

### 🔐 Segurança:

- **NUNCA** commite `.env`, `.env.azure` ou arquivos com secrets no Git
- Use secrets do Azure Container Apps para valores sensíveis
- Rotacione passwords e API keys regularmente
- Configure CORS com URLs específicas em produção

### 📊 Monitoramento:

- Acesse Application Insights regularmente
- Configure alertas para problemas críticos
- Monitore custos no Azure Cost Management
- Revise logs de segurança periodicamente

### 🚀 Performance:

- Frontend: Use CDN para assets estáticos
- API: Configure cache de queries frequentes
- Database: Monitore slow queries e otimize índices
- Containers: Ajuste recursos (CPU/memória) conforme uso real

---

**Bom deploy! ⚽🚀**

**Última atualização:** 07/10/2025
