# Chatbot de Atendimento para a Plataforma Passa-Bola

## 📖 Sobre o Projeto

Este projeto consiste em um chatbot inteligente desenvolvido para o site da **Passa-Bola**, uma plataforma inovadora focada em conectar e fortalecer a comunidade de futebol feminino. O chatbot serve como um assistente virtual, projetado para oferecer suporte instantâneo, responder a perguntas frequentes e engajar as usuárias, melhorando a experiência geral na plataforma.

O "cérebro" do chatbot foi construído em **Python** e utiliza bibliotecas de Processamento de Linguagem Natural (NLP) para compreender perguntas feitas em linguagem natural e fornecer respostas precisas e contextuais.

## ✨ Funcionalidades Principais

* **Compreensão de Linguagem Natural:** O bot utiliza um modelo de NLP (com `scikit-learn`) para entender a intenção do usuário, mesmo que a pergunta seja formulada de maneiras diferentes.
* **Base de Conhecimento Especializada:** O chatbot é treinado com informações específicas sobre:
    * O que é e como funciona a plataforma Passa-Bola.
    * Detalhes sobre as funcionalidades (marcar jogos, criar eventos, postar lances).
    * Informações gerais sobre o universo do futebol feminino para engajamento.
    * Questões de suporte técnico (login, bugs, denúncias).
* **API RESTful:** A lógica do chatbot é exposta através de uma API criada com **Flask**, permitindo que qualquer interface de frontend (um site, um aplicativo, etc.) possa se comunicar com ele de forma simples e eficiente.
* **Leve e Rápido:** A arquitetura do projeto é minimalista, garantindo respostas com baixa latência.

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Python
* **Backend & API:** Flask
* **Machine Learning / NLP:** Scikit-learn (para vetorização TF-IDF e cálculo de similaridade de cossenos)
* **Comunicação:** API REST com endpoints em JSON


### Pré-requisitos

* Python 3.8 ou superior
* Pip (gerenciador de pacotes do Python)


(Projeto ainda em mudanças)   
