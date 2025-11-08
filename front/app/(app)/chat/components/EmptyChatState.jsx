/**
 * Empty state shown when no conversation is selected
 */
export default function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-muted">
      <div className="text-center text-secondary">
        <svg
          className="mx-auto h-16 w-16 text-tertiary mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium">Selecione uma conversa</p>
        <p className="text-sm mt-2 text-tertiary">
          Escolha uma conversa da lista para começar a conversar
        </p>
      </div>
    </div>
  );
}
