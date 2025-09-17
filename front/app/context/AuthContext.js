"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, setAuthToken } from "@/app/lib/api"; // Importar setAuthToken
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginErrorMessage, setLoginErrorMessage] = useState(null); // Novo estado para mensagens de erro de login
  const router = useRouter();

  const fetchFullProfileData = useCallback(async (basicUserData) => {
    let fullProfileData;
    const userTypeUpperCase = basicUserData.userType.toUpperCase(); // Converter para maiúsculas
    switch (userTypeUpperCase) {
      case "PLAYER":
        fullProfileData = await api.players.getById(basicUserData.id);
        break;
      case "ORGANIZATION":
        fullProfileData = await api.organizations.getById(basicUserData.id);
        break;
      case "SPECTATOR":
        fullProfileData = await api.spectators.getById(basicUserData.id);
        break;
      default:
        console.warn(
          "Unknown user type from localStorage:",
          basicUserData.userType
        );
        fullProfileData = {};
    }
    return fullProfileData;
  }, []);

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          const basicUserData = JSON.parse(storedUser);

          // Adicionar validação aqui
          if (!basicUserData || !basicUserData.id || !basicUserData.userType) {
            console.error(
              "Dados de usuário incompletos no localStorage. Deslogando."
            );
            logout(); // Limpa o estado inconsistente
            return;
          }

          // Re-fetch full profile data to ensure it's up-to-date
          const fullProfileData = await fetchFullProfileData(basicUserData);

          setUser({ ...basicUserData, ...fullProfileData });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user from local storage:", error);
        logout(); // Limpa qualquer estado inconsistente
      } finally {
        setLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, [fetchFullProfileData]);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      // A resposta do login agora deve incluir 'id' e 'role'
      const { token, profileId, role, ...restOfResponse } = response; // Desestruturar 'role' em vez de 'userType'

      setAuthToken(token);

      // Usar 'id' e 'role' da resposta do login, mapeando 'role' para 'userType'
      const userBasicDataWithIdAndType = {
        ...restOfResponse,
        id: profileId, // Mapeia profileId para id
        userType: role.toUpperCase(), // Usar 'role' como 'userType' e garantir maiúsculas
      };

      const fullProfileData = await fetchFullProfileData(
        userBasicDataWithIdAndType
      );

      const userDataToStore = {
        ...userBasicDataWithIdAndType,
        ...fullProfileData,
      };

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userDataToStore));

      setUser(userDataToStore);
      setIsAuthenticated(true);
      setLoginErrorMessage(null); // Limpa qualquer erro anterior ao fazer login com sucesso
      router.push("/feed"); // Redireciona para o feed após o login
    } catch (error) {
      console.error("Login failed:", error);
      setLoginErrorMessage(
        error.message || "Falha no login. Verifique suas credenciais."
      );
      throw error; // Re-lança o erro para que o componente de login possa lidar com ele
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login"); // Redireciona para a página de login após o logout
  };

  const register = async (payload, apiRole) => {
    try {
      let response;
      switch (apiRole) {
        case "player":
          response = await api.auth.registerPlayer(payload);
          break;
        case "organization":
          response = await api.auth.registerOrganization(payload);
          break;
        case "spectator":
          response = await api.auth.registerSpectator(payload);
          break;
        default:
          throw new Error("Tipo de registro inválido.");
      }
      // Após o registro, o usuário precisará fazer login para obter o token
      // ou a API pode retornar o token diretamente, dependendo da implementação do backend.
      // Por enquanto, apenas retornamos a resposta.
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Re-lança o erro para que o componente de registro possa lidar com ele
    }
  };

  const clearLoginError = useCallback(() => {
    setLoginErrorMessage(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register, // Adicionar a função register ao contexto
        loginErrorMessage,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
