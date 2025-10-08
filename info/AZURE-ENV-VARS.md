# 🔐 Guia de Configuração de Variáveis de Ambiente no Azure

## 📋 Índice

1. [Variáveis Necessárias](#variáveis-necessárias)
2. [Como Configurar no Azure Container Apps](#como-configurar-no-azure-container-apps)
3. [Métodos de Configuração](#métodos-de-configuração)
4. [Segurança e Best Practices](#segurança-e-best-practices)

---

## 🗂️ Variáveis Necessárias

### **API (Spring Boot)**

| Variável                                | Descrição                                     | Exemplo                                                                                  | Obrigatória |
| --------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| `SPRING_DATASOURCE_URL`                 | URL do Azure Database for MySQL               | `jdbc:mysql://mysql-passa-bola.mysql.database.azure.com:3306/api_passa_bola?useSSL=true` | ✅          |
| `SPRING_DATASOURCE_USERNAME`            | Usuário do banco (formato: `user@server`)     | `passabolaadmin@mysql-passa-bola`                                                        | ✅          |
| `SPRING_DATASOURCE_PASSWORD`            | Senha do banco de dados                       | `SuaSenhaSegura123!`                                                                     | ✅          |
| `JWT_SECRET`                            | Secret para assinar tokens JWT (min 256 bits) | `sua-chave-jwt-super-segura-256-bits-ou-mais`                                            | ✅          |
| `JWT_EXPIRATION`                        | Tempo de expiração do token em ms             | `3600000` (1 hora)                                                                       | ❌          |
| `CORS_ALLOWED_ORIGINS`                  | Origens permitidas para CORS                  | `https://ca-passa-bola-front.azurecontainerapps.io`                                      | ❌          |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights (auto-configurado)       | Auto                                                                                     | ❌          |

### **Frontend (Next.js)**

| Variável                  | Descrição            | Exemplo                                               | Obrigatória |
| ------------------------- | -------------------- | ----------------------------------------------------- | ----------- |
| `NEXT_PUBLIC_API_URL`     | URL da API backend   | `https://ca-passa-bola-api.azurecontainerapps.io`     | ✅          |
| `NEXT_PUBLIC_CHATBOT_URL` | URL do chatbot       | `https://ca-passa-bola-chatbot.azurecontainerapps.io` | ✅          |
| `NODE_ENV`                | Ambiente de execução | `production`                                          | ✅          |

### **Chatbot (Flask + Gemini)**

| Variável          | Descrição                          | Exemplo                               | Obrigatória |
| ----------------- | ---------------------------------- | ------------------------------------- | ----------- |
| `GOOGLE_API_KEY`  | API Key do Google Gemini           | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | ✅          |
| `SERPAPI_API_KEY` | API Key do SerpAPI (buscas Google) | `abc123def456ghi789jkl`               | ✅          |
| `ENVIRONMENT`     | Ambiente de execução               | `production`                          | ❌          |
| `FLASK_DEBUG`     | Debug mode (sempre False em prod)  | `False`                               | ❌          |

---

## ⚙️ Como Configurar no Azure Container Apps

### **Método 1: Azure Portal (Interface Gráfica)** 🖱️

#### **Passo a Passo:**

1. **Acesse o Azure Portal:**

   - Navegue até: https://portal.azure.com
   - Faça login com sua conta

2. **Encontre seu Container App:**

   - No menu lateral, clique em **"Container Apps"**
   - Selecione o container que deseja configurar:
     - `ca-passa-bola-api` (API)
     - `ca-passa-bola-front` (Frontend)
     - `ca-passa-bola-chatbot` (Chatbot)

3. **Configurar Variáveis de Ambiente:**

   - No menu lateral do Container App, clique em **"Containers"**
   - Clique em **"Edit and deploy"**
   - Na seção **"Environment variables"**, clique em **"+ Add"**
   - Para cada variável:
     - **Name:** Nome da variável (ex: `GOOGLE_API_KEY`)
     - **Source:** Escolha **"Manual entry"**
     - **Value:** Cole o valor da variável
   - Para valores sensíveis (senhas, API keys):
     - **Source:** Escolha **"Reference a secret"**
     - Primeiro crie um secret na aba **"Secrets"**

4. **Criar Secrets (para valores sensíveis):**

   - Clique na aba **"Secrets"**
   - Clique em **"+ Add"**
   - **Key:** Nome do secret (ex: `google-api-key`)
   - **Value:** Valor sensível
   - Salve

5. **Referenciar Secret na Variável:**

   - Volte para **"Environment variables"**
   - **Name:** `GOOGLE_API_KEY`
   - **Source:** `Reference a secret`
   - **Value:** Selecione `google-api-key`

6. **Salvar e Deploy:**
   - Clique em **"Create"** no final da página
   - O Container App fará um novo deploy com as variáveis configuradas

---

### **Método 2: Azure CLI (Linha de Comando)** 💻

#### **Configurar Variáveis Simples:**

```bash
# API - Configurar URL do banco
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "JWT_EXPIRATION=3600000" \
    "CORS_ALLOWED_ORIGINS=https://ca-passa-bola-front.azurecontainerapps.io"
```

#### **Configurar Secrets (valores sensíveis):**

```bash
# 1. Criar secrets primeiro
az containerapp secret set \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --secrets \
    google-api-key="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
    serpapi-key="abc123def456ghi789jkl"

# 2. Configurar variáveis referenciando os secrets
az containerapp update \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "GOOGLE_API_KEY=secretref:google-api-key" \
    "SERPAPI_API_KEY=secretref:serpapi-key" \
    "ENVIRONMENT=production" \
    "FLASK_DEBUG=False"
```

#### **Configurar Todas as Variáveis da API:**

```bash
# Defina suas variáveis primeiro
DB_PASSWORD="SuaSenhaSegura123!"
JWT_SECRET="sua-chave-jwt-super-segura-256-bits-ou-mais"
DB_SERVER="mysql-passa-bola.mysql.database.azure.com"

# Crie os secrets
az containerapp secret set \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --secrets \
    db-password="$DB_PASSWORD" \
    jwt-secret="$JWT_SECRET"

# Configure as variáveis
az containerapp update \
  --name ca-passa-bola-api \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "SPRING_DATASOURCE_URL=jdbc:mysql://${DB_SERVER}:3306/api_passa_bola?useSSL=true&requireSSL=true" \
    "SPRING_DATASOURCE_USERNAME=passabolaadmin@mysql-passa-bola" \
    "SPRING_DATASOURCE_PASSWORD=secretref:db-password" \
    "JWT_SECRET=secretref:jwt-secret" \
    "JWT_EXPIRATION=3600000"
```

#### **Configurar Frontend:**

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

# Configurar variáveis do frontend
az containerapp update \
  --name ca-passa-bola-front \
  --resource-group rg-passa-bola \
  --set-env-vars \
    "NEXT_PUBLIC_API_URL=https://${API_URL}" \
    "NEXT_PUBLIC_CHATBOT_URL=https://${CHATBOT_URL}" \
    "NODE_ENV=production"
```

---

### **Método 3: Script Automatizado** 🚀

Criei um script para você! Está em: `azure-scripts/04-configure-env-vars.sh`

```bash
# Execute o script
./azure-scripts/04-configure-env-vars.sh

# O script vai:
# 1. Pedir suas API keys (Google, SerpAPI, JWT secret, etc.)
# 2. Criar todos os secrets no Azure
# 3. Configurar todas as variáveis de ambiente
# 4. Fazer restart dos containers
```

---

## 🔐 Segurança e Best Practices

### **✅ FAÇA:**

1. **Use Secrets para Valores Sensíveis:**

   - Senhas de banco de dados
   - API Keys (Google, SerpAPI, etc.)
   - JWT secrets
   - Tokens de autenticação

2. **Geração de JWT Secret Seguro:**

   ```bash
   # Gere um secret forte (256 bits)
   openssl rand -base64 32
   ```

3. **Use HTTPS para Todas as URLs:**

   - ✅ `https://ca-passa-bola-api.azurecontainerapps.io`
   - ❌ `http://ca-passa-bola-api.azurecontainerapps.io`

4. **Configure CORS Corretamente:**

   ```bash
   # Use URLs específicas em produção
   CORS_ALLOWED_ORIGINS=https://ca-passa-bola-front.azurecontainerapps.io

   # Evite usar "*" em produção!
   ```

5. **Rotação Regular de Secrets:**
   - Troque senhas e API keys periodicamente
   - Use Azure Key Vault para gerenciamento avançado

### **❌ NÃO FAÇA:**

1. ❌ **Nunca commite secrets no Git:**

   - Adicione `.env` no `.gitignore`
   - Use `.env.example` como template

2. ❌ **Não use debug mode em produção:**

   ```bash
   FLASK_DEBUG=False  # ✅ Correto
   FLASK_DEBUG=True   # ❌ PERIGOSO em produção!
   ```

3. ❌ **Não hardcode valores sensíveis no código:**

   ```python
   # ❌ ERRADO
   GOOGLE_API_KEY = "AIzaSyXXXXXXXXXX"

   # ✅ CORRETO
   GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
   ```

4. ❌ **Não compartilhe secrets via email/chat:**
   - Use ferramentas seguras (Azure Key Vault, 1Password, etc.)

---

## 🔍 Verificar Variáveis Configuradas

### **Via Azure CLI:**

```bash
# Listar todas as variáveis de ambiente
az containerapp show \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --query properties.template.containers[0].env

# Listar todos os secrets (valores não são mostrados)
az containerapp secret list \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola
```

### **Via Azure Portal:**

1. Acesse o Container App
2. Clique em **"Containers"** → **"Edit and deploy"**
3. Veja a seção **"Environment variables"**

---

## 📝 Checklist de Configuração

### **Antes do Deploy:**

- [ ] Obtive API Key do Google Gemini (https://makersuite.google.com/app/apikey)
- [ ] Obtive API Key do SerpAPI (https://serpapi.com/manage-api-key)
- [ ] Gerei JWT secret seguro (`openssl rand -base64 32`)
- [ ] Anotei senha do Azure Database for MySQL
- [ ] Criei arquivo `.env.azure` local (não commitado)

### **Durante o Deploy:**

- [ ] Configurei secrets no Azure Container Apps (API keys, senhas)
- [ ] Configurei variáveis de ambiente para API
- [ ] Configurei variáveis de ambiente para Frontend
- [ ] Configurei variáveis de ambiente para Chatbot
- [ ] Verifiquei que todos os valores estão corretos

### **Após o Deploy:**

- [ ] Testei endpoints de health (`/health`, `/actuator/health`)
- [ ] Testei chatbot enviando mensagem
- [ ] Verifiquei logs no Azure Portal (procurar por erros de API key)
- [ ] Validei CORS entre frontend e API
- [ ] Documentei as configurações (sem incluir valores sensíveis!)

---

## 🆘 Troubleshooting

### **Erro: "GOOGLE_API_KEY not found"**

**Causa:** Variável de ambiente não configurada ou secret não referenciado corretamente.

**Solução:**

```bash
# Verificar se a variável está configurada
az containerapp show \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --query properties.template.containers[0].env

# Reconfigurar se necessário
az containerapp update \
  --name ca-passa-bola-chatbot \
  --resource-group rg-passa-bola \
  --set-env-vars "GOOGLE_API_KEY=secretref:google-api-key"
```

### **Erro: "Connection refused to MySQL"**

**Causa:** URL do banco incorreta ou firewall bloqueando.

**Solução:**

```bash
# 1. Verificar se Azure Services está permitido no firewall
az mysql flexible-server firewall-rule create \
  --resource-group rg-passa-bola \
  --name mysql-passa-bola \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 2. Verificar URL do banco nas variáveis
# Formato correto: jdbc:mysql://SERVER.mysql.database.azure.com:3306/DATABASE?useSSL=true
```

### **Erro: "CORS policy blocked"**

**Causa:** Frontend não está na lista de origens permitidas.

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
```

---

## 📚 Recursos Adicionais

- [Azure Container Apps - Environment Variables](https://learn.microsoft.com/en-us/azure/container-apps/environment-variables)
- [Azure Container Apps - Secrets](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets)
- [Google AI Studio - Get API Key](https://makersuite.google.com/app/apikey)
- [SerpAPI - API Key Management](https://serpapi.com/manage-api-key)
- [JWT.io - Token Debugger](https://jwt.io/)

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:**

   ```bash
   az containerapp logs show \
     --name ca-passa-bola-chatbot \
     --resource-group rg-passa-bola \
     --follow
   ```

2. **Teste o health endpoint:**

   ```bash
   curl https://ca-passa-bola-chatbot.azurecontainerapps.io/health
   ```

3. **Consulte a documentação:** `DEPLOY-AZURE.md` e `QUICK-REFERENCE.md`

---

**Última atualização:** 07/10/2025
