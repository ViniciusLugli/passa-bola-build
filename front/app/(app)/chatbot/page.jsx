"use client";

import { useState, useRef, useEffect } from "react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Sou o Assistente PassaBola 🤖\n\nEstou aqui para ajudar você! Como posso te auxiliar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "Como criar um time?",
    "Como encontrar jogos?",
    "Como funciona o ranking?",
    "Ajuda com o perfil",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e, messageText = null) => {
    if (e) e.preventDefault();

    const textToSend = messageText || input;
    if (textToSend.trim() === "") return;

    const newMessage = { sender: "user", text: textToSend };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    try {
      const chatbotUrl =
        process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:5000";
      const response = await fetch(`${chatbotUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Erro ao comunicar com o chatbot:", error);
      const errorMessage = {
        sender: "bot",
        text: "Desculpe, não consegui me conectar ao chatbot.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-page">
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Header with bot info */}
        <div className="flex items-center gap-3 mb-4 p-4 bg-surface border border-default rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">
              Assistente PassaBola
            </h1>
            <p className="text-sm text-secondary">Sempre pronto para ajudar</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-surface border border-default rounded-lg shadow-elevated mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              {/* Bot avatar */}
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}

              <div
                className={`max-w-[70%] min-h-[48px] rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${
                  msg.sender === "user"
                    ? "bg-accent text-on-brand shadow-md"
                    : "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 text-primary"
                }`}
              >
                {msg.sender === "bot" && (
                  <p className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">
                    Assistente PassaBola
                  </p>
                )}
                <p className="break-words whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>
              </div>

              {/* User avatar placeholder */}
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                  <span className="text-accent text-sm font-semibold">U</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply buttons */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-secondary mb-2">Sugestões rápidas:</p>
            <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(null, reply)}
                  className="flex-shrink-0 snap-start px-4 py-2 bg-surface border border-default rounded-full text-sm text-primary hover:bg-accent hover:text-on-brand hover:border-accent transition-all duration-200 whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            name="chatInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="medium"
            fullWidth={false}
            className="min-w-[100px]"
          >
            Enviar
          </Button>
        </form>
      </main>
    </div>
  );
}
