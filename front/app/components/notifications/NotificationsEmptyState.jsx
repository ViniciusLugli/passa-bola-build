import EmptyState from "@/app/components/ui/EmptyState";
import { Bell, CheckCircle, Archive } from "lucide-react";

/**
 * Componente de estado vazio para a lista de notificações
 * Exibe diferentes mensagens baseado no filtro ativo
 *
 * @param {string} filter - Filtro atual ("all" | "unread" | "read")
 */
export default function NotificationsEmptyState({ filter }) {
  if (filter === "all") {
    return (
      <EmptyState
        icon={<Bell />}
        title="Nenhuma notificação"
        description="Você ainda não recebeu notificações"
      />
    );
  }

  if (filter === "unread") {
    return (
      <EmptyState
        icon={<CheckCircle />}
        title="Tudo em dia!"
        description="Você não tem notificações não lidas"
      />
    );
  }

  if (filter === "read") {
    return (
      <EmptyState
        icon={<Archive />}
        title="Nenhuma lida ainda"
        description="As notificações que você ler aparecerão aqui"
      />
    );
  }

  return null;
}
