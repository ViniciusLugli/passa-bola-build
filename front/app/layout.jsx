import { AuthProvider } from "@/app/context/AuthContext";
import { ToastProvider } from "@/app/context/ToastContext";
import { NotificationProvider } from "@/app/context/NotificationContext";
import { ChatProvider } from "@/app/context/ChatContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import "@/app/globals.css";

export const metadata = {
  title: "PassaBola",
  description:
    "Sua plataforma para organizar e participar de jogos de futebol.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="min-h-screen bg-page text-primary antialiased transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ChatProvider>
                <ToastProvider>{children}</ToastProvider>
              </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
