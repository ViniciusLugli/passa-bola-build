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
        <h3 className="text-lg font-semibold mb-2">Adicionar Jogadores</h3>
        {mutualFollows.length === 0 && (
          <p className="text-gray-500">Nenhum seguidor mútuo encontrado.</p>
        )}
        <ul>
          {mutualFollows.map((player) => (
            <li
              key={player.followerId}
              className={`
                flex items-center justify-between p-2 rounded-md cursor-pointer
                ${
                  selectedPlayers.some((p) => p.id === player.followerId)
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }
              `}
              onClick={() =>
                handleSelectPlayer({
                  id: player.followerId,
                  username: player.followerUsername,
                })
              }
            >
              <span>{player.followerUsername}</span>
              {selectedPlayers.some((p) => p.id === player.followerId) && (
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
            {selectedPlayers.map((player) => (
              <li
                key={player.id}
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

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Time criado com sucesso!</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Time"}
      </Button>
    </form>
  );
}
