"use client";

import Input from "@/app/components/Input";
import Modal from "@/app/components/Modal";

export default function ConfirmSaveModal({
  isOpen,
  onClose,
  passwordConfirm,
  setPasswordConfirm,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Confirmar Alterações
      </h2>
      <p className="text-gray-600 mb-6">
        Para sua segurança, por favor, insira sua senha para confirmar as
        alterações.
      </p>
      <Input
        label="Senha"
        type="password"
        name="passwordConfirm"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-8 py-3 bg-purple-800 text-white font-bold rounded-lg hover:bg-purple-900 transition-colors shadow-md"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
