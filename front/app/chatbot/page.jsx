"use client";

import { useState, useRef, useEffect } from "react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import Header from "@/app/components/Header";

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:5000";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    try {
      const response = await fetch(`${CHATBOT_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply || data.response };
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
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">Chatbot</h1>
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow-md mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg max-w-[70%] ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-gray-800 self-start mr-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            name="chatInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded-lg"
          />
          <Button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Enviar
          </Button>
        </form>
      </main>
    </div>
  );
}
