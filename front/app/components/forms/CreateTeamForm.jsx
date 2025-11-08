"use client";

import Image from "next/image";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import ImageUpload from "@/app/components/ui/ImageUpload";
import { useCreateTeamForm } from "@/app/(app)/teams/newTeam/useCreateTeamForm";

export default function CreateTeamForm() {
  const {
    teamName,
    setTeamName,
    teamLogo,
    handleLogoUpload,
    handleLogoRemove,
    loading,
    error,
    success,
    handleSubmit,
    mutualFollows,
    selectedPlayers,
    handleSelectPlayer,
  } = useCreateTeamForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-surface border border-default rounded-2xl p-6 shadow-elevated"
    >
      <Input
        label="Nome do Time"
        id="teamName"
        name="teamName"
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        required
        placeholder="Ex: As Poderosas FC"
        error={
          teamName && teamName.trim().length === 0
            ? "O nome do time não pode ser vazio."
            : undefined
        }
      />

      {/* Logo Upload Section */}
      <div className="space-y-3">
        <ImageUpload
          type="temp"
          currentImageUrl={teamLogo}
          onUploadSuccess={handleLogoUpload}
          onImageRemove={handleLogoRemove}
          size="medium"
          shape="circle"
          label="Logo do Time"
          placeholder="Adicionar logo do time"
          disabled={loading}
        />
      </div>

      <div className="border border-default rounded-xl p-4 bg-surface-muted">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-primary">
            Adicionar Jogadores <span className="text-red-400">*</span>
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedPlayers.length > 0
                ? "bg-[rgb(34_197_94/0.15)] text-[rgb(22_163_74)]"
                : "bg-surface text-tertiary"
            }`}
          >
            {selectedPlayers.length} selecionada
            {selectedPlayers.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-secondary mb-3">
          Selecione pelo menos 1 jogadora para criar o time. Apenas seguidores
          mútuos podem ser convidados.
        </p>
        {mutualFollows.length === 0 && (
          <p className="text-tertiary">
            Nenhum seguidor mútuo encontrado. Você precisa seguir e ser
            seguido(a) por outras jogadoras.
          </p>
        )}
        <ul>
          {mutualFollows.map((p, index) => (
            <li
              key={`player-${p.id}-${index}`}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                selectedPlayers.some((s) => s.id === p.id)
                  ? "bg-accent-soft text-accent-strong"
                  : "hover:bg-surface"
              }`}
              onClick={() =>
                handleSelectPlayer({ id: p.id, username: p.username })
              }
            >
              <div className="flex items-center gap-3">
                {p.profilePhotoUrl ? (
                  <Image
                    src={p.profilePhotoUrl}
                    alt={p.username}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface" />
                )}
                <span className="text-primary">
                  {p.username || "(usuário sem nome)"}
                </span>
              </div>
              {selectedPlayers.some((s) => s.id === p.id) && (
                <span className="text-accent-strong font-medium">
                  Selecionado
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {selectedPlayers.length > 0 && (
        <div className="border border-default rounded-xl p-4 bg-surface-muted">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Jogadores Selecionados
          </h3>
          <ul>
            {selectedPlayers.map((player, index) => (
              <li
                key={`selected-${player.id}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-accent-soft text-accent-strong mb-2"
              >
                <span>
                  {player.username} (Status:{" "}
                  {player.status === "pending" ? "Pendente" : player.status})
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectPlayer(player)}
                  className="text-red-400 hover:text-red-500"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="p-3 bg-surface-muted border border-red-400 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-surface-muted border border-green-400 text-green-400 rounded-lg">
          Time criado com sucesso!
        </div>
      )}

      <Button type="submit" disabled={loading || mutualFollows.length === 0}>
        {loading ? "Criando..." : "Criar Time"}
      </Button>
    </form>
  );
}
