import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from serpapi import GoogleSearch

# --- Configuração Inicial ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

if not GOOGLE_API_KEY or not SERPAPI_API_KEY:
    raise ValueError("Chaves da API do Google ou SerpApi não encontradas no arquivo .env.")

genai.configure(api_key=GOOGLE_API_KEY)

current_date = datetime.now().strftime('%d/%m/%Y')

system_instruction = f"""
Você é o chatbot oficial da plataforma Passabola, um assistente virtual especialista em futebol feminino. Seu nome é Martinha.
Sua personalidade é amigável, simpática, engajada e apaixonada pelo esporte.

**REGRAS DE COMPORTAMENTO:**
1.  **Considere a Data Atual:** Hoje é {current_date}. Você DEVE usar esta data como referência principal para responder perguntas sobre eventos atuais.
2.  **Tom de Voz:** Seja sempre simpática, positiva e acolhedora. Use uma linguagem leve e emojis de forma sutil.
3.  **Seja Breve e Direto:** Suas respostas devem ser curtas (máximo 3-4 frases).
4.  **Decida se Precisa Buscar:** Para perguntas sobre notícias, resultados ou eventos atuais, sua primeira tarefa é chamar la função `Google Search`.
5.  **Conhecimento do Passabola:** Para perguntas sobre o projeto Passabola, responda diretamente.
6.  **Sem Markdown:** Não use asteriscos (*) para formatação.

**CONHECIMENTO INTERNO SOBRE O PASSABOLA:**
- **Missão Principal:** Transformar a maneira como o futebol feminino é vivenciado no ambiente digital.
- **Nossa Solução:** Um ecossistema com App, Site e você, o Chatbot.
- **Objetivos:** Dar visibilidade às atletas, fortalecer a comunidade e conectar todos os envolvidos.
- **Funcionalidades:** Perfis, criação de jogos e um hub para conhecer organizações.
"""

google_search_tool = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name='google_search',
            description='Use esta ferramenta para encontrar informações atuais na web, como notícias, placares e eventos sobre futebol feminino.',
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    'query': genai.protos.Schema(type=genai.protos.Type.STRING, description='A pergunta para pesquisar no Google.')
                },
                required=['query']
            )
        )
    ]
)

model = genai.GenerativeModel(
    model_name='gemini-1.5-flash-latest',
    system_instruction=system_instruction,
)

app = Flask(__name__)
CORS(app)

def execute_google_search(query):
    try:
        params = {
            "api_key": SERPAPI_API_KEY,
            "engine": "google",
            "q": query,
            "google_domain": "google.com.br",
            "gl": "br",
            "hl": "pt"
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        
        if "answer_box" in results and "snippet" in results["answer_box"]:
            return results["answer_box"]["snippet"]
        elif "organic_results" in results and results["organic_results"]:
            snippets = [result.get("snippet", "") for result in results["organic_results"][:3]]
            return " ".join(snippets)
        return "Nenhum resultado encontrado."
    except Exception as e:
        print(f"Erro no SerpApi: {e}")
        return "Erro ao buscar informação."

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "Nenhuma mensagem fornecida"}), 400

    try:
        response = model.generate_content(user_input, tools=[google_search_tool])
        
        # Verificamos se a resposta tem uma chamada de função na primeira parte
        if response.candidates and response.candidates[0].content.parts and response.candidates[0].content.parts[0].function_call.name == "google_search":
            function_call = response.candidates[0].content.parts[0].function_call
            query = function_call.args['query']
            print(f"DEBUG: Modelo decidiu pesquisar por: '{query}'")

            search_results_text = execute_google_search(query)
            print(f"DEBUG: Resultados da busca: '{search_results_text}'")
            
            # Criamos a resposta da função
            function_response = genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name='google_search',
                    response={'result': search_results_text}
                )
            )

            # Criamos o histórico da conversa para dar contexto ao modelo
            conversation_history = [
                # 1. A pergunta original do usuário
                genai.protos.Content(parts=[genai.protos.Part(text=user_input)]),
                # 2. A resposta do modelo pedindo para usar a ferramenta
                response.candidates[0].content,
                # 3. Os resultados da ferramenta que executamos
                genai.protos.Content(parts=[function_response])
            ]

            # Segunda chamada com o histórico completo
            response_final = model.generate_content(conversation_history)
            final_reply = response_final.text
        else:
            final_reply = response.text

        return jsonify({"reply": final_reply})

    except Exception as e:
        print(f"Erro ao chamar a API do Gemini: {e}")
        return jsonify({"error": "Ocorreu um erro ao processar sua mensagem."}), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de health check para Azure Container Apps"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "chatbot-passa-bola"
    }), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)