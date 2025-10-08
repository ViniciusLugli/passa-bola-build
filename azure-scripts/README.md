# 📜 Scripts de Deploy Azure - Passa-Bola

Esta pasta contém os scripts para fazer deploy da aplicação Passa-Bola na Azure.

## 📚 Scripts Disponíveis

### 1️⃣ `01-deploy-infrastructure.sh`

**Cria toda a infraestrutura base na Azure**

- Resource Group
- Azure Container Registry (ACR)
- Azure Database for MySQL Flexible Server
- Log Analytics Workspace
- Application Insights
- Container Apps Environment

**Uso:**

```bash
./01-deploy-infrastructure.sh
```

**Output:** Cria o arquivo `azure-infrastructure.env` com todas as informações.

---

### 2️⃣ `02-deploy-images.sh`

**Faz build e push das imagens Docker para o ACR**

- Build da imagem da API (Spring Boot)
- Build da imagem do Frontend (Next.js)
- Build da imagem do Chatbot (Flask)
- Push de todas as imagens para o ACR

**Uso:**

```bash
./02-deploy-images.sh
```

**Pré-requisito:** Execute primeiro o script `01-deploy-infrastructure.sh`

---

### 3️⃣ `03-deploy-services.sh`

**Deploy dos serviços nos Container Apps**

- Deploy da API
- Deploy do Frontend
- Deploy do Chatbot
- Configuração de variáveis de ambiente
- Configuração de ingress (acesso externo)

**Uso:**

```bash
./03-deploy-services.sh
```

**Output:** Cria o arquivo `azure-urls.txt` com as URLs dos serviços.

**Pré-requisito:** Execute primeiro os scripts 01 e 02.

---

### 🗑️ `cleanup-azure.sh`

**Remove todos os recursos criados na Azure**

⚠️ **ATENÇÃO:** Este script é destrutivo e remove TODOS os recursos!

**Uso:**

```bash
./cleanup-azure.sh
```

**O que é removido:**

- Resource Group completo
- Todos os Container Apps
- Container Registry (e todas as imagens)
- Banco de dados MySQL (incluindo todos os dados!)
- Application Insights
- Log Analytics

---

## 🚀 Deploy Completo (Primeira vez)

Para fazer o deploy completo do zero:

```bash
# 1. Configure as variáveis de ambiente
cd ..
cp .env.azure.example .env.azure
nano .env.azure  # Edite com suas credenciais

# 2. Execute os scripts em ordem
cd azure-scripts
./01-deploy-infrastructure.sh
./02-deploy-images.sh
./03-deploy-services.sh
```

---

## 🔄 Atualizar Aplicação (Deploy incremental)

Se você fez alterações no código e quer atualizar:

```bash
# Rebuild e redeploy apenas as imagens alteradas
./02-deploy-images.sh

# Atualizar os serviços
./03-deploy-services.sh
```

---

## 📋 Checklist Antes do Deploy

- [ ] Azure CLI instalado (`az --version`)
- [ ] Docker instalado e rodando (`docker --version`)
- [ ] jq instalado (`jq --version`)
- [ ] Logado na Azure (`az login`)
- [ ] Arquivo `.env.azure` configurado
- [ ] Créditos Azure disponíveis

---

## 🆘 Problemas Comuns

### Script não executa

```bash
# Dê permissão de execução
chmod +x *.sh
```

### "jq: command not found"

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### "Docker daemon is not running"

```bash
# Inicie o Docker
sudo systemctl start docker
```

---

## 📁 Arquivos Gerados

Após executar os scripts, os seguintes arquivos serão criados:

- `../azure-infrastructure.env` - Informações da infraestrutura
- `../azure-urls.txt` - URLs dos serviços deployados

⚠️ Estes arquivos contêm informações sensíveis e estão no `.gitignore`

---

## 📖 Documentação Completa

Veja o arquivo `DEPLOY-AZURE.md` na raiz do projeto para documentação detalhada.

---

**Boa sorte com o deploy! ⚽🚀**
