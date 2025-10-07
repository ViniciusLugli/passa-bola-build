"use client";

import Input from "@/app/components/Input";
import SelectInput from "@/app/components/SelectInput";
import { getGameTypeLabel } from "@/app/lib/gameUtils";

const EditGameForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  submitting,
  gameTypeOptions,
  handleDeleteGame,
  setShowDeleteModal,
  teams = [],
  loadingTeams = false,
}) => {
  // Transformar times em opções para o SelectInput
  const teamOptions = teams.map((team) => ({
    label: team.nameTeam,
    value: String(team.id),
  }));
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        label="Tipo de Jogo"
        type="text"
        name="gameType"
        value={getGameTypeLabel(formData.gameType)}
        readOnly
        disabled
      />

      {formData.gameType === "FRIENDLY" ||
      formData.gameType === "CHAMPIONSHIP" ? (
        <>
          <Input
            label="Nome do Jogo"
            type="text"
            name="gameName"
            value={formData.gameName}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Local do Jogo"
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Descrição"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="hasSpectators"
              id="hasSpectators"
              checked={formData.hasSpectators}
              onChange={(e) =>
                handleInputChange({
                  target: { name: "hasSpectators", value: e.target.checked },
                })
              }
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label
              htmlFor="hasSpectators"
              className="text-sm font-medium text-gray-700"
            >
              Permitir espectadores (mínimo de 5)
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                label="Mínimo de Jogadoras"
                type="number"
                name="minPlayers"
                value={formData.minPlayers}
                onChange={handleInputChange}
                min="6"
                max="22"
                step="2"
                required
              />
            </div>
            <div className="flex-1">
              <Input
                label="Máximo de Jogadoras"
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                min="6"
                max="22"
                step="2"
                required
              />
            </div>
          </div>
        </>
      ) : null}

      {formData.gameType === "CUP" ? (
        <>
          <Input
            label="Local do Jogo"
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Campeonato"
            type="text"
            name="championship"
            value={formData.championship}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Rodada"
            type="text"
            name="round"
            value={formData.round}
            onChange={handleInputChange}
            required
          />

          {loadingTeams ? (
            <div className="text-center text-gray-500 py-4">
              Carregando equipes...
            </div>
          ) : teamOptions.length > 0 ? (
            <>
              <SelectInput
                label="Time da Casa"
                name="homeTeamId"
                options={teamOptions}
                value={String(formData.homeTeamId)}
                onChange={handleInputChange}
                placeholder="Selecione o time"
                required
              />
              <SelectInput
                label="Time Adversário"
                name="awayTeamId"
                options={teamOptions}
                value={String(formData.awayTeamId)}
                onChange={handleInputChange}
                placeholder="Selecione o time"
                required
              />
            </>
          ) : (
            <div className="text-center text-red-500 py-4">
              Nenhuma equipe disponível.
            </div>
          )}
        </>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            label="Data do Jogo"
            type="date"
            name="gameDate"
            value={formData.gameDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="flex-1">
          <Input
            label="Hora do Jogo"
            type="time"
            name="gameTime"
            value={formData.gameTime}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="
          mt-4
          w-full 
          bg-purple-800 
          hover:bg-purple-900 
          text-white 
          font-bold 
          py-3
          rounded-xl 
          text-xl 
          transition-colors 
          duration-300 
          shadow-lg
        "
        disabled={submitting}
      >
        {submitting ? "Salvando..." : "Salvar Alterações"}
      </button>

      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="
          mt-2
          w-full 
          bg-red-600 
          hover:bg-red-700 
          text-white 
          font-bold 
          py-3
          rounded-xl 
          text-xl 
          transition-colors 
          duration-300 
          shadow-lg
        "
        disabled={submitting}
      >
        Excluir Jogo
      </button>
    </form>
  );
};

export default EditGameForm;
