"use client";

import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { useCreateTeamForm } from "@/app/teams/newTeam/useCreateTeamForm";

export default function CreateTeamForm() {
  const {
    teamName,
    setTeamName,
    loading,
    error,
    success,
    handleSubmit,
    mutualFollows,
    selectedPlayers,
    handleSelectPlayer,
  } = useCreateTeamForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome do Time"
        id="teamName"
        name="teamName"
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        required
        placeholder="Ex: As Poderosas FC"
      />

      <div className="border p-4 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            Adicionar Jogadores <span className="text-red-500">*</span>
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedPlayers.length > 0
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {selectedPlayers.length} selecionada
            {selectedPlayers.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Selecione pelo menos 1 jogadora para criar o time. Apenas seguidores
          mútuos podem ser convidados.
        </p>
        {mutualFollows.length === 0 && (
          <p className="text-gray-500">
            Nenhum seguidor mútuo encontrado. Você precisa seguir e ser
            seguido(a) por outras jogadoras.
          </p>
        )}
        <ul>
          {mutualFollows.map((p, index) => (
            <li
              key={`player-${p.id}-${index}`}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                selectedPlayers.some((s) => s.id === p.id)
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
              onClick={() =>
                handleSelectPlayer({ id: p.id, username: p.username })
              }
            >
              <div className="flex items-center gap-3">
                {p.profilePhoto ? (
                  <img
                    src={p.profilePhoto}
                    alt={p.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                )}
                <span>{p.username || "(usuário sem nome)"}</span>
              </div>
              {selectedPlayers.some((s) => s.id === p.id) && (
                <span className="text-blue-600">Selecionado</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {selectedPlayers.length > 0 && (
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Jogadores Selecionados</h3>
          <ul>
            {selectedPlayers.map((player, index) => (
              <li
                key={`selected-${player.id}-${index}`}
                className="flex items-center justify-between p-2 rounded-md bg-blue-50 mb-1"
              >
                <span>
                  {player.username} (Status:{" "}
                  {player.status === "pending" ? "Pendente" : player.status})
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectPlayer(player)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Time criado com sucesso!
        </div>
      )}

      <Button type="submit" disabled={loading || mutualFollows.length === 0}>
        {loading ? "Criando..." : "Criar Time"}
      </Button>
    </form>
  );
}
