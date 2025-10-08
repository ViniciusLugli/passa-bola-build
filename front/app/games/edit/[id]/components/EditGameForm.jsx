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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Seção: Tipo de Jogo (Read-only) */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-300 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-gray-500">🔒</span>
          Tipo de Jogo (não editável)
        </h3>
        <Input
          label="Tipo"
          type="text"
          name="gameType"
          value={getGameTypeLabel(formData.gameType)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed opacity-75"
        />
      </div>

      {formData.gameType === "FRIENDLY" ||
      formData.gameType === "CHAMPIONSHIP" ? (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Seção: Informações Básicas */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-purple-600">📋</span>
              Informações Básicas
            </h3>
            <div className="space-y-5">
              <Input
                label="Nome do Jogo"
                type="text"
                name="gameName"
                value={formData.gameName}
                onChange={handleInputChange}
                placeholder="Ex: Pelada do Sábado"
                required
              />
              <Input
                label="Local do Jogo"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Ex: Campo do Parque Central"
                required
              />
              <Input
                label="Descrição"
                type="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva os detalhes do jogo..."
                required
              />
            </div>
          </div>

          {/* Seção: Jogadoras */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-green-600">👥</span>
              Jogadoras
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {/* Seção: Espectadores */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-orange-600">👀</span>
              Espectadores
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-orange-100 hover:border-orange-300 transition-all duration-200">
                <input
                  type="checkbox"
                  name="hasSpectators"
                  id="hasSpectators"
                  checked={formData.hasSpectators}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "hasSpectators",
                        value: e.target.checked,
                      },
                    })
                  }
                  className="w-6 h-6 text-purple-600 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer transition-all duration-200"
                />
                <label
                  htmlFor="hasSpectators"
                  className="text-base font-semibold text-gray-700 cursor-pointer select-none flex-1"
                >
                  Permitir espectadores neste jogo
                </label>
              </div>

              {formData.hasSpectators && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 bg-white rounded-xl border border-orange-100">
                  <label
                    htmlFor="maxSpectators"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    Quantidade máxima de espectadores
                  </label>
                  <Input
                    name="maxSpectators"
                    type="number"
                    value={formData.maxSpectators || ""}
                    onChange={handleInputChange}
                    min="5"
                    placeholder="Mínimo: 5"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {formData.gameType === "CUP" ? (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Seção: Informações da Copa */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-yellow-600">🏆</span>
              Informações da Copa
            </h3>
            <div className="space-y-5">
              <Input
                label="Local do Jogo"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Ex: Estádio Municipal"
                required
              />
              <Input
                label="Campeonato"
                type="text"
                name="championship"
                value={formData.championship}
                onChange={handleInputChange}
                placeholder="Ex: Copa Regional 2025"
                required
              />
              <Input
                label="Rodada"
                type="text"
                name="round"
                value={formData.round}
                onChange={handleInputChange}
                placeholder="Ex: Quartas de Final"
                required
              />
            </div>
          </div>

          {/* Seção: Times */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-blue-600">⚔️</span>
              Times do Confronto
            </h3>
            {loadingTeams ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 font-medium">
                  Carregando equipes...
                </span>
              </div>
            ) : teamOptions.length > 0 ? (
              <div className="space-y-5">
                <SelectInput
                  label="Time da Casa"
                  name="homeTeamId"
                  options={teamOptions}
                  value={String(formData.homeTeamId)}
                  onChange={handleInputChange}
                  placeholder="Selecione o time da casa"
                  required
                />
                <SelectInput
                  label="Time Adversário"
                  name="awayTeamId"
                  options={teamOptions}
                  value={String(formData.awayTeamId)}
                  onChange={handleInputChange}
                  placeholder="Selecione o time adversário"
                  required
                />
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <span className="text-4xl mb-3 block">⚠️</span>
                <p className="text-red-700 font-semibold text-lg">
                  Nenhuma equipe disponível
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Seção: Data e Hora */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="text-indigo-600">📅</span>
          Quando será o jogo?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Data do Jogo"
            type="date"
            name="gameDate"
            value={formData.gameDate}
            onChange={handleInputChange}
            required
          />
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

      {/* Botões de Ação */}
      <div className="flex flex-col gap-4 pt-4">
        {/* Botão Salvar */}
        <button
          type="submit"
          className="
            group
            relative
            w-full 
            bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900
            hover:from-purple-800 hover:via-purple-900 hover:to-indigo-950
            text-white 
            font-bold 
            py-4
            px-8
            rounded-2xl 
            text-xl 
            transition-all 
            duration-300 
            shadow-xl
            hover:shadow-2xl
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-60
            disabled:cursor-not-allowed
            disabled:hover:scale-100
            overflow-hidden
          "
          disabled={submitting}
        >
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shimmer"></div>

          {submitting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
              Salvando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>💾</span>
              <span>Salvar Alterações</span>
            </span>
          )}
        </button>

        {/* Botão Excluir */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="
            group
            relative
            w-full 
            bg-gradient-to-r from-red-600 via-red-700 to-red-800
            hover:from-red-700 hover:via-red-800 hover:to-red-900
            text-white 
            font-bold 
            py-4
            px-8
            rounded-2xl 
            text-xl 
            transition-all 
            duration-300 
            shadow-xl
            hover:shadow-2xl
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-60
            disabled:cursor-not-allowed
            disabled:hover:scale-100
            border-2 border-red-500
            overflow-hidden
          "
          disabled={submitting}
        >
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shimmer"></div>

          <span className="flex items-center justify-center gap-2">
            <span>🗑️</span>
            <span>Excluir Jogo</span>
          </span>
        </button>
      </div>
    </form>
  );
};

export default EditGameForm;
