"use client";

import Input from "@/app/components/ui/Input";
import ImageUpload from "@/app/components/ui/ImageUpload";
import ConfirmSaveModal from "./ConfirmSaveModal";
import AccordionSection from "@/app/components/AccordionSection";
import { useConfigForm } from "./useConfigForm";
import { X } from "lucide-react";

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
      <div className="bg-surface border border-default rounded-2xl shadow-elevated p-6 md:p-10 relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-6 right-6 p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Voltar"
        >
          <X className="w-6 h-6" strokeWidth={2} />
        </button>

        <h1 className="text-3xl font-bold text-primary mb-2">
          Configurações do Perfil
        </h1>
        <p className="text-secondary mb-8">
          Atualize suas informações pessoais.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <AccordionSection
            id="personal-data"
            title="Dados Pessoais"
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </AccordionSection>

          {/* Imagens do Perfil */}
          <AccordionSection
            id="profile-images"
            title="Imagens do Perfil"
            defaultOpen={true}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Foto de Perfil
                </h3>
                <p className="text-sm text-secondary mb-4">
                  Escolha uma imagem que represente você. Recomendamos formato
                  quadrado.
                </p>
                <ImageUpload
                  type="avatar"
                  userId={userId}
                  userType={userType}
                  currentImageUrl={formData.profilePhotoUrl}
                  onUploadSuccess={(result) => {
                    if (result?.url) {
                      handleInputChange({
                        target: {
                          name: "profilePhotoUrl",
                          value: result.url,
                        },
                      });
                    }
                  }}
                  onImageRemove={() => {
                    handleInputChange({
                      target: {
                        name: "profilePhotoUrl",
                        value: "",
                      },
                    });
                  }}
                  size="large"
                  shape="circle"
                  showLabel={true}
                  placeholder="Clique para enviar sua foto"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Banner do Perfil
                </h3>
                <p className="text-sm text-secondary mb-4">
                  Uma imagem de capa para personalizar seu perfil. Formato
                  retangular recomendado.
                </p>
                <ImageUpload
                  type="banner"
                  userId={userId}
                  userType={userType}
                  currentImageUrl={formData.bannerPhotoUrl}
                  onUploadSuccess={(result) => {
                    if (result?.url) {
                      handleInputChange({
                        target: {
                          name: "bannerPhotoUrl",
                          value: result.url,
                        },
                      });
                    }
                  }}
                  onImageRemove={() => {
                    handleInputChange({
                      target: {
                        name: "bannerPhotoUrl",
                        value: "",
                      },
                    });
                  }}
                  size="large"
                  shape="rectangle"
                  showLabel={true}
                  placeholder="Clique para enviar seu banner"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Segurança */}
          <AccordionSection id="security" title="Segurança" defaultOpen={false}>
            <div className="space-y-4">
              <Input
                label="Nova Senha"
                type="password"
                name="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Deixe em branco para não alterar"
              />
              <p className="text-sm text-secondary">
                A senha deve ter no mínimo 8 caracteres.
              </p>
            </div>
          </AccordionSection>

          {/* Privacidade */}
          <AccordionSection
            id="privacy"
            title="Privacidade"
            defaultOpen={false}
          >
            <div className="space-y-4">
              <p className="text-sm text-secondary">
                Configurações de privacidade estarão disponíveis em breve.
              </p>
            </div>
          </AccordionSection>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-default">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-surface-muted text-secondary font-semibold rounded-lg border border-default hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-accent hover:bg-accent-strong font-bold rounded-lg transition-all duration-200 shadow-elevated cursor-pointer text-on-brand"
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
