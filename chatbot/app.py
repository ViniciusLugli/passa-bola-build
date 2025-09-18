# app.py

from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json

# Inicializa o aplicativo Flask
app = Flask(__name__)


# --- Base de Conhecimento (Perguntas e Respostas) para o App Passa-Bola ---
knowledge_base = {
    # --- Interações Sociais ---
    "oi": "Olá! Sou a assistente do Passa-Bola. Posso te ajudar com alguma dúvida sobre o projeto e suas funcionalidades?",
    "olá": "Olá! Sou a assistente do Passa-Bola. Posso te ajudar com alguma dúvida sobre o projeto e suas funcionalidades?",
    "obrigado": "De nada! Se tiver mais alguma dúvida sobre o projeto, é só perguntar.",
    "obrigada": "De nada! Se tiver mais alguma dúvida sobre o projeto, é só perguntar.",

    # --- Visão Geral e MVP ---
    "O que já está funcionando no app?": "Na versão atual (MVP), as funções essenciais estão no ar! Você já pode se cadastrar, fazer login, criar um perfil básico, listar e ver detalhes dos jogos, criar eventos (como organização) e interagir no feed com postagens.",
    "O que é o MVP?": "O MVP (Mínimo Produto Viável) é a nossa primeira versão funcional do app. Ele inclui: Cadastro/Login, Perfil, Listagem e criação de jogos, Feed de postagens e Mapa para visualizar os jogos.",
    "Quais as próximas funcionalidades?": "Estamos trabalhando em várias melhorias! As próximas a chegar são: edição completa do perfil, confirmação de participação nos jogos, sistema de seguidores e calendário de jogos.",

    # --- Autenticação & Cadastro ---
    "Como posso me cadastrar?": "O cadastro já está disponível! Você pode criar sua conta como Organização, Jogadora ou Espectadora.",
    "O login já funciona?": "Sim, a funcionalidade de login para usuários cadastrados já está implementada e funcionando.",
    "Se eu esquecer minha senha, o que faço?": "A função de recuperação de senha é uma prioridade média e está no nosso radar de desenvolvimento. Ela estará disponível em uma atualização futura.",
    "Posso editar meu nome, email ou senha?": "Ainda não. A edição das informações da conta é uma funcionalidade de média prioridade que planejamos lançar em breve.",

    # --- Perfil ---
    "O que aparece no meu perfil?": "Atualmente, seu perfil já exibe as informações principais, como sua foto, descrição e algumas estatísticas básicas.",
    "É possível editar meu perfil?": "A edição completa do perfil, para você alterar sua bio, foto e outras informações, é uma funcionalidade de média prioridade e estará disponível nas próximas atualizações.",
    "Posso seguir outras pessoas ou times?": "O sistema de seguir/seguidores está no nosso planejamento de média prioridade. Em breve você poderá se conectar com outras jogadoras e organizações!",

    # --- Jogos & Eventos ---
    "Como faço para ver os jogos?": "A listagem de jogos disponíveis é uma função principal e já está no ar! Você pode ver todos os detalhes como time, local, horário e descrição.",
    "Quem pode criar um jogo ou evento?": "Nesta primeira fase, a criação de jogos e eventos está liberada para perfis do tipo 'Organização'.",
    "Posso confirmar minha participação em um jogo?": "A confirmação de participação em jogos é um recurso importante que será adicionado logo após o lançamento inicial. É uma de nossas prioridades!",
    "O app tem um calendário de jogos?": "Ainda não, mas um calendário para organizar seus próximos jogos está planejado como uma melhoria de média prioridade e deve chegar em breve.",

    # --- Social & Interação ---
    "Existe um feed de notícias ou timeline?": "Sim! O feed de postagens, nossa timeline, já é uma realidade. Você pode criar postagens com texto e imagens para compartilhar suas jogadas.",
    "Posso curtir ou comentar nas postagens?": "A interação com curtidas e comentários é uma melhoria que consideramos muito importante. Ela está no nosso backlog com prioridade média e será implementada em breve.",

    # --- Localização & Mapas ---
    "Os jogos aparecem em um mapa?": "Com certeza! A visualização dos locais dos jogos em um mapa já está funcionando, é um dos nossos recursos principais.",
    "O app mostra a rota para chegar no jogo?": "A função de traçar a rota até o local do jogo é uma melhoria de média prioridade. Planejamos integrá-la com serviços de mapa em breve para facilitar seu trajeto.",

    # --- Times & Equipes ---
    "Posso ver informações dos times?": "Sim, já temos uma listagem de equipes e uma página de detalhes para cada uma, mostrando as jogadoras e os jogos relacionados.",
    "Eu mesma posso criar e gerenciar um time?": "A gestão completa de equipes, como criar, editar e excluir seu próprio time, é uma funcionalidade planejada para o futuro, atualmente com baixa prioridade, pois estamos focando nos recursos essenciais primeiro.",

    # --- Configurações Gerais ---
    "Como faço logout?": "A função de logout (sair da conta) é essencial e já está funcionando no menu de configurações.",
    "Onde eu gerencio minha conta?": "O gerenciamento geral da conta, para alterar dados pessoais, está em nosso radar com prioridade média e será implementado em futuras atualizações.",
    "Posso configurar as notificações que recebo?": "A personalização de notificações é uma melhoria de baixa prioridade. No futuro, você poderá escolher exatamente o que quer receber de alerta."
}


# Extrai as perguntas da base de conhecimento
perguntas = list(knowledge_base.keys())

# --- Lógica do Chatbot com NLP ---

# Vetorização das perguntas

# TfidfVectorizer transforma o texto em vetores numéricos que o computador pode entender.
vectorizer = TfidfVectorizer(ngram_range=(1,2)) # ngram_range considera palavras e pares de palavras
vetores_perguntas = vectorizer.fit_transform(perguntas) # Cria os vetores para todas as perguntas

# Função para encontrar a melhor resposta

def encontrar_melhor_resposta(mensagem_usuario):
    # Transforma a mensagem do usuário no mesmo tipo de vetor das perguntas
    vetor_usuario = vectorizer.transform([mensagem_usuario])
    
    # Calcula a similaridade de cosseno entre a pergunta do usuário e todas as perguntas da base
    similaridades = cosine_similarity(vetor_usuario, vetores_perguntas)
    
    # Encontra o índice da pergunta mais similar
    indice_mais_similar = np.argmax(similaridades)
    
    # Define uma divisa de confiança. Se a similaridade for muito baixa, não responde.
    limiar_confianca = 0.3 
    if similaridades[0][indice_mais_similar] > limiar_confianca:
        return knowledge_base[perguntas[indice_mais_similar]]
    else:
        return "Desculpe, não entendi sua pergunta. Poderia tentar reformulá-la?"

# --- Criação da API ---

@app.route('/chat', methods=['POST'])
def chat():
    # Teoricamente pega a mensagem do usuário que veio do frontend  (Teoricamente pois o frontend ainda não existe)
    data = request.json 
    mensagem_usuario = data.get('message') # Pega a mensagem enviada pelo usuário
    
    if not mensagem_usuario:
        return jsonify({"error": "Nenhuma mensagem recebida"}), 400 # Retorna erro se não houver mensagem
        
    # Obtém a resposta do chatbot
    resposta_bot = encontrar_melhor_resposta(mensagem_usuario) # Chama a função para encontrar a melhor resposta
    
    # Retorna a resposta em formato JSON
    return jsonify({"response": resposta_bot}) # Retorna a resposta do bot

# Roda o servidor
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
