# 📁 Estrutura dos Arquivos de Deploy Azure

```
passa-bola-build/
│
├── 📄 azure-config.json              # Configurações dos recursos Azure
├── 📄 .env.azure.example             # Template de variáveis de ambiente
├── 📄 .env.azure                     # Suas credenciais (não commitado)
├── 📄 azure-infrastructure.env       # Info da infra (gerado automaticamente)
├── 📄 azure-urls.txt                 # URLs dos serviços (gerado automaticamente)
├── 📄 DEPLOY-AZURE.md                # Documentação completa de deploy
├── 📄 azure-deploy.sh                # Menu interativo de deploy
│
├── 📂 azure-scripts/                 # Scripts de deploy
│   ├── 📄 README.md                  # Documentação dos scripts
│   ├── 🔧 check-prerequisites.sh     # Verifica pré-requisitos
│   ├── 1️⃣  01-deploy-infrastructure.sh # Cria infraestrutura
│   ├── 2️⃣  02-deploy-images.sh         # Build e push de imagens
│   ├── 3️⃣  03-deploy-services.sh       # Deploy dos serviços
│   └── 🗑️  cleanup-azure.sh           # Remove todos os recursos
│
├── 📂 api/
│   ├── 📄 Dockerfile                 # Dockerfile original
│   └── 📄 Dockerfile.azure           # Dockerfile otimizado para Azure
│
├── 📂 front/
│   ├── 📄 Dockerfile                 # Dockerfile original
│   ├── 📄 Dockerfile.azure           # Dockerfile otimizado para Azure
│   ├── 📄 next.config.mjs            # Config Next.js (atualizado)
│   └── 📂 app/
│       └── 📂 api/
│           └── 📂 health/
│               └── 📄 route.js       # Endpoint de health check
│
└── 📂 chatbot/
    ├── 📄 Dockerfile                 # Dockerfile original
    ├── 📄 Dockerfile.azure           # Dockerfile otimizado para Azure
    └── 📄 app.py                     # App Flask (com endpoint health)
```

## 🎯 Arquivos Principais

### Configuração

- **azure-config.json** - Configurações centralizadas (nomes, SKUs, regiões)
- **.env.azure** - Credenciais sensíveis (senhas, secrets)

### Scripts (azure-scripts/)

1. **check-prerequisites.sh** - Verifica se tem tudo instalado
2. **01-deploy-infrastructure.sh** - Cria a base na Azure
3. **02-deploy-images.sh** - Faz build e upload das imagens
4. **03-deploy-services.sh** - Deploya os Container Apps
5. **cleanup-azure.sh** - Remove tudo (cuidado!)

### Dockerfiles Otimizados

- **Dockerfile.azure** - Versões para produção:
  - Multi-stage builds
  - Usuários não-root
  - Health checks configurados
  - Otimizações de memória e CPU

### Arquivos Gerados

- **azure-infrastructure.env** - Criado pelo script 01
- **azure-urls.txt** - Criado pelo script 03

## 🚀 Fluxo de Deploy

```
┌─────────────────────────────────────────────────────┐
│  1. Verificar pré-requisitos                        │
│     ./azure-scripts/check-prerequisites.sh          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  2. Configurar credenciais                          │
│     cp .env.azure.example .env.azure                │
│     nano .env.azure                                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  3. Criar infraestrutura                            │
│     ./azure-scripts/01-deploy-infrastructure.sh     │
│                                                      │
│     Cria: Resource Group, ACR, MySQL, etc.         │
│     Gera: azure-infrastructure.env                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  4. Build e push das imagens                        │
│     ./azure-scripts/02-deploy-images.sh             │
│                                                      │
│     Build: API, Frontend, Chatbot                   │
│     Push: Para Azure Container Registry             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  5. Deploy dos serviços                             │
│     ./azure-scripts/03-deploy-services.sh           │
│                                                      │
│     Deploy: Container Apps                          │
│     Gera: azure-urls.txt                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Aplicação deployada!                            │
│     Acesse as URLs em azure-urls.txt                │
└─────────────────────────────────────────────────────┘
```

## 🎨 Menu Interativo

Ao invés de executar os scripts individualmente, você pode usar:

```bash
./azure-deploy.sh
```

Este menu oferece:

- ✅ Deploy completo com um comando
- ✅ Deploy incremental (só o que mudou)
- ✅ Ver status e logs em tempo real
- ✅ Cleanup interativo

## 🔐 Segurança

### Arquivos que NÃO devem ser commitados:

- ❌ `.env.azure` (credenciais)
- ❌ `azure-infrastructure.env` (info sensível)
- ❌ `azure-urls.txt` (URLs dos serviços)

Estes arquivos estão no `.gitignore`!

### Arquivos que PODEM ser commitados:

- ✅ `azure-config.json` (configs gerais)
- ✅ `.env.azure.example` (template)
- ✅ Todos os scripts em `azure-scripts/`
- ✅ `DEPLOY-AZURE.md` (documentação)

## 📚 Documentação

- **DEPLOY-AZURE.md** - Guia completo com troubleshooting
- **azure-scripts/README.md** - Documentação dos scripts
- Este arquivo - Visão geral da estrutura

## 🆘 Suporte

Problemas? Consulte:

1. `DEPLOY-AZURE.md` - Seção de troubleshooting
2. Execute `./azure-scripts/check-prerequisites.sh`
3. Veja os logs: `./azure-deploy.sh` → opção 7, 8 ou 9

---

**Criado com ❤️ para facilitar o deploy do Passa-Bola na Azure! ⚽🚀**
