/**
 * Componente de estado de carregamento para a página de notificações
 * Exibe skeleton loading com animação
 */
export default function NotificationsLoadingState() {
  return (
    <div className="bg-page min-h-screen">
      <main className="container mx-auto p-4 mt-8 max-w-4xl">
        <div className="relative bg-surface border border-default rounded-2xl shadow-elevated p-8 flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-primary text-center mt-4">
            Notificações
          </h1>
          <p
            className="text-center text-secondary"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Carregando notificações...
          </p>

          <div className="flex flex-col gap-3 mt-2" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-2">
                <div className="p-4 rounded-lg border bg-surface animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded bg-surface-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-surface-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-surface-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-surface-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
