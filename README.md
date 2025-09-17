# Projeto Passa Bola - Monitoramento com Spring Boot, Next.js, MySQL, Prometheus e Grafana

Este projeto demonstra a integração de uma API Spring Boot, uma aplicação Next.js, um banco de dados MySQL, e ferramentas de monitoramento Prometheus e Grafana, tudo orquestrado com Docker Compose.

## Estrutura do Projeto

- `api/api`: Contém a aplicação Spring Boot (backend).
- `front`: Contém a aplicação Next.js (frontend).
- `chatbot`: Contém uma aplicação Python para chatbot (não incluída no Docker Compose atual, mas pode ser adicionada).
- `docker-compose.yml`: Define e orquestra todos os serviços Docker.
- `prometheus/prometheus.yml`: Configuração do Prometheus para coletar métricas.

## Pré-requisitos

- Docker Desktop instalado e em execução.
- Maven (para construir a API Spring Boot manualmente, se necessário).
- Node.js e npm (para construir o frontend Next.js manualmente, se necessário).

## Como Rodar o Projeto

Siga os passos abaixo para levantar todo o ambiente.

### 1. Construir as Imagens Docker

Navegue até a raiz do projeto e construa as imagens Docker para a API e o Frontend:

```bash
docker-compose build
```

### 2. Iniciar os Serviços com Docker Compose

Após a construção das imagens, inicie todos os serviços definidos no `docker-compose.yml`:

```bash
docker-compose up -d
```

Este comando irá:

- Criar e iniciar o contêiner MySQL.
- Criar e iniciar o contêiner da API Spring Boot (`api-passa-bola`).
- Criar e iniciar o contêiner da aplicação Next.js (`front-passa-bola`).
- Criar e iniciar o contêiner Prometheus.
- Criar e iniciar o contêiner Grafana.

### 3. Acessar as Aplicações e Ferramentas

Após todos os serviços estarem em execução, você pode acessá-los nos seguintes endereços:

- **API Spring Boot:** `http://localhost:8080`
  - Métricas Prometheus: `http://localhost:8080/actuator/prometheus`
- **Aplicação Next.js (Frontend):** `http://localhost:3000`
  - Para rodar o frontend isoladamente (sem `docker-compose`), navegue até a pasta `front` e execute:
    ```bash
    docker build -t front-passa-bola .
    docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 --name front-passa-bola-standalone front-passa-bola
    ```
    Certifique-se de que a API Spring Boot esteja acessível em `http://localhost:8080` na sua máquina local.
- **Prometheus UI:** `http://localhost:9090`
- **Grafana UI:** `http://localhost:3001` (Usuário: `admin`, Senha: `admin`)

### 4. Configurar o Prometheus no Grafana

1.  Acesse o Grafana em `http://localhost:3001`.
2.  Faça login com `admin`/`admin`.
3.  No menu lateral, clique em "Connections" (ícone de plug).
4.  Clique em "Add new connection".
5.  Procure por "Prometheus" e selecione-o.
6.  No campo "URL", insira `http://prometheus:9090` (este é o nome do serviço Prometheus dentro da rede Docker).
7.  Clique em "Save & test". Você deverá ver uma mensagem de sucesso.

### 5. Importar ou Criar Dashboards no Grafana

Você pode importar dashboards pré-existentes ou criar os seus próprios:

- **Importar Dashboard:**

  1.  No menu lateral, clique em "Dashboards" (ícone de dashboards).
  2.  Clique em "Import".
  3.  Você pode carregar um arquivo JSON de dashboard ou colar o ID de um dashboard do Grafana Labs (ex: para Spring Boot, procure por "Spring Boot" no site do Grafana Labs e use o ID).
  4.  Selecione o Prometheus como sua fonte de dados.
  5.  Clique em "Import".

- **Criar Novo Dashboard:**
  1.  No menu lateral, clique em "Dashboards".
  2.  Clique em "New Dashboard".
  3.  Adicione painéis e configure-os para visualizar as métricas da sua API Spring Boot (ex: `jvm_memory_used_bytes`, `http_server_requests_seconds_count`, etc.).

## Parar e Remover os Serviços

Para parar os serviços e remover os contêineres, redes e volumes (exceto os volumes de dados persistentes):

```bash
docker-compose down
```

Para remover também os volumes de dados (cuidado, isso apagará os dados do MySQL, Prometheus e Grafana):

```bash
docker-compose down -v
```

## Variáveis de Ambiente

Você pode configurar as variáveis de ambiente para o MySQL no arquivo `.env` na raiz do projeto (crie-o se não existir):

```
DB_USER=seu_usuario_mysql
DB_PASSWORD=root
```

Se o arquivo `.env` não for fornecido, os valores padrão (`root` e `root`) serão utilizados.
