"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/context/ToastContext";

export const useConfigForm = (userId, userType) => {
  const router = useRouter();
  const {
    user: loggedInUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    profilePhotoUrl: "",
    bannerPhotoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (
        !isAuthenticated ||
        !loggedInUser ||
        String(loggedInUser.id) !== String(userId) ||
        loggedInUser.userType.toLowerCase() !== userType.toLowerCase()
      ) {
        setError("Você não tem permissão para acessar esta página.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let fullProfileData;
        switch (userType.toLowerCase()) {
          case "player":
            fullProfileData = await api.players.getById(userId);
            break;
          case "organization":
            fullProfileData = await api.organizations.getById(userId);
            break;
          case "spectator":
            fullProfileData = await api.spectators.getById(userId);
            break;
          default:
            throw new Error("Unknown user type");
        }

        setFormData({
          name: fullProfileData.name || "",
          username: fullProfileData.username || "",
          email: fullProfileData.email || "",
          phone: fullProfileData.phone || "",
          bio: fullProfileData.bio || "",
          profilePhotoUrl:
            fullProfileData.profilePhotoUrl ||
            fullProfileData.profilePhoto ||
            "",
          bannerPhotoUrl:
            fullProfileData.bannerPhotoUrl || fullProfileData.bannerPhoto || "",
        });
      } catch (err) {
        console.error("Error fetching user data for config:", err);
        setError(
          "Falha ao carregar dados do usuário. Por favor, tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [userId, userType, loggedInUser, isAuthenticated, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!passwordConfirm) {
      showToast("Por favor, insira sua senha para confirmar.", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToUpdate = { ...formData };

      console.log("Saving config data:", dataToUpdate);

      dataToUpdate.password = newPassword || passwordConfirm;

      switch (userType.toLowerCase()) {
        case "player":
          console.log("Updating player with ID:", userId);
          const result = await api.players.update(userId, dataToUpdate);
          console.log("Player update result:", result);
          break;
        case "organization":
          await api.organizations.update(userId, dataToUpdate);
          break;
        case "spectator":
          await api.spectators.update(userId, dataToUpdate);
          break;
        default:
          throw new Error("Unknown user type");
      }

      showToast("Informações salvas com sucesso!", "success");
      setIsModalOpen(false);
      setNewPassword("");
      setPasswordConfirm("");
      router.refresh();
    } catch (err) {
      console.error("Error saving user data:", err);
      setError(
        err.message ||
          "Falha ao salvar dados do usuário. Por favor, tente novamente."
      );
      showToast(err.message || "Falha ao salvar dados do usuário.", "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    router,
    loggedInUser,
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
  };
};
