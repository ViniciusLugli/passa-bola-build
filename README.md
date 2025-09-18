# Passa-Bola ⚽

> Uma rede social para conectar amantes do futebol.

http://127.0.0.1:49767/?code=11d5d9d29b818ab5f379&state=4e75c9f20ffd465c8eebd97491b926aa

## 🌟 Sobre o Projeto

O Passa-Bola é uma plataforma completa para jogadores, times e organizadores de partidas de futebol. A nossa missão é facilitar a organização e participação em jogos, além de criar uma comunidade vibrante onde todos possam compartilhar a sua paixão pelo esporte.

## ✨ Funcionalidades

-   **👤 Perfis Personalizados:** Crie seu perfil como Jogador, Organização ou Espectador.
-   **📅 Gestão de Partidas:** Organize e divulgue jogos de forma simples e rápida.
-   **📰 Feed de Notícias:** Compartilhe suas melhores jogadas, fotos e atualizações.
-   **🔍 Busca Inteligente:** Encontre times e jogadores compatíveis com seu estilo.
-   **🤖 Chatbot Assistente:** Tire suas dúvidas sobre o app a qualquer momento.
-   **📊 Monitoramento em Tempo Real:** Acompanhe a saúde da aplicação com dashboards interativos.

## 🚀 Tecnologias Utilizadas

-   **Backend:** Spring Boot (Java)
-   **Frontend:** Next.js (React)
-   **Banco de Dados:** MySQL
-   **Chatbot:** Python (Flask)
-   **Monitoramento:** Prometheus & Grafana
-   **Containerização:** Docker & Docker Compose

## 🏁 Começando

Siga este guia para configurar e executar o projeto em seu ambiente local.

### ✅ Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas em sua máquina:

-   [Git](https://git-scm.com/)
-   [Docker](https://www.docker.com/products/docker-desktop/) & [Docker Compose](https://docs.docker.com/compose/install/)
-   [Node.js (versão LTS)](https://nodejs.org/)
-   [Java (JDK 17 ou superior)](https://www.oracle.com/java/technologies/downloads/)
-   [Maven](https://maven.apache.org/download.cgi)
-   [Python](https://www.python.org/downloads/)

### 📂 1. Clone o Repositório

```bash
git clone <URL-do-repositorio>
cd passa-bola
```

### 🐳 2. Executando com Docker Compose (Recomendado)

A maneira mais fácil de rodar o projeto é com o Docker Compose, que orquestra todos os serviços para você.

```bash
docker-compose up --build -d
```

Este comando irá construir as imagens Docker e iniciar todos os serviços em segundo plano.

### 🛠️ 3. Executando os Serviços Manualmente (Para Desenvolvimento)

Se você precisa de mais controle para desenvolver, pode rodar cada serviço individualmente.

#### 🐘 Banco de Dados (MySQL)

Inicie apenas o banco de dados com o Docker Compose:

```bash
docker-compose up -d mysql
```

> 🔑 O banco de dados estará disponível na porta `3307` do seu `localhost`.

#### ☕ Backend (API)

1.  Abra um novo terminal e navegue até a pasta `api`:
    ```bash
    cd api
    ```
2.  Execute o projeto com o Maven:
    ```bash
    mvn spring-boot:run
    ```
    > 🚀 A API estará disponível em `http://localhost:8080`.

#### ⚛️ Frontend

1.  Em outro terminal, navegue até a pasta `front`:
    ```bash
    cd front
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    > 🖥️ A aplicação estará disponível em `http://localhost:3000`.

#### 🐍 Chatbot

1.  Em mais um terminal, vá para a pasta `chatbot`:
    ```bash
    cd chatbot
    ```
2.  Instale as dependências do Python:
    ```bash
    pip install -r requirements.txt
    ```
3.  Inicie o servidor Flask:
    ```bash
    python app.py
    ```
    > 🤖 O chatbot estará disponível em `http://localhost:5000`.

## 🌐 Acessando os Serviços

Aqui estão os endereços para acessar cada parte da aplicação:

-   **Aplicação Principal (Frontend):** [http://localhost:3000](http://localhost:3000)
-   **API (Backend):** [http://localhost:8080](http://localhost:8080)
-   **Chatbot API:** [http://localhost:5000](http://localhost:5000)
-   **Prometheus (Monitoramento):** [http://localhost:9090](http://localhost:9090)
-   **Grafana (Dashboards):** [http://localhost:3001](http://localhost:3001)
    -   **Usuário:** `admin`
    -   **Senha:** `admin`

## 📂 Estrutura do Projeto

```
passa-bola/
├── ☕ api/            # Backend em Spring Boot
├── 🐍 chatbot/        # Chatbot em Python/Flask
├── ⚛️ front/          # Frontend em Next.js
├── 📊 prometheus/     # Configuração do Prometheus
├── 🐳 docker-compose.yml # Orquestração dos containers
└── 📄 README.md       # Este arquivo
```
