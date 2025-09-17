"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input";
import SelectInput from "@/app/components/SelectInput";
import Alert from "@/app/components/Alert";
import { getGameTypeLabel } from "@/app/lib/gameUtils";

const GameForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  alert,
  loading,
  gameTypeOptions,
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <SelectInput
        label="Tipo de Jogo"
        name="gameType"
        options={gameTypeOptions}
        value={formData.gameType}
        onChange={handleInputChange}
        required
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
        disabled={loading}
      >
        {loading ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
};

export default GameForm;
