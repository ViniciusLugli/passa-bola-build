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
}) => {
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
          <Input
            label="ID do Time da Casa"
            type="number"
            name="homeTeamId"
            value={formData.homeTeamId}
            onChange={handleInputChange}
            required
          />
          <Input
            label="ID do Time Adversário"
            type="number"
            name="awayTeamId"
            value={formData.awayTeamId}
            onChange={handleInputChange}
            required
          />
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
