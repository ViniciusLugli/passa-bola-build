"use client";

import Input from "@/app/components/Input";
import ConfirmSaveModal from "./ConfirmSaveModal";
import { useConfigForm } from "./useConfigForm";

export default function ConfigForm({ userId, userType }) {
  const {
    router,
    formData,
    loading,
    error,
    isModalOpen,
    passwordConfirm,
    newPassword,
    setIsModalOpen,
    setPasswordConfirm,
    setNewPassword,
    handleInputChange,
    handleSubmit,
    handleConfirmSave,
  } = useConfigForm(userId, userType);

  if (loading) {
    return <p>Carregando configurações...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Configurações do Perfil
        </h1>
        <p className="text-gray-500 mb-8">
          Atualize suas informações pessoais.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="md:col-span-2">
            <Input
              label="Nome de Exibição"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <Input
            label="Nome de Usuário"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <div className="md:col-span-2">
            <Input
              label="Telefone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Bio"
              type="textarea"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Segurança
            </h2>
            <Input
              label="Nova Senha"
              type="password"
              name="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-purple-800 text-white font-bold rounded-lg hover:bg-purple-900 transition-colors shadow-md cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <ConfirmSaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        passwordConfirm={passwordConfirm}
        setPasswordConfirm={setPasswordConfirm}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
