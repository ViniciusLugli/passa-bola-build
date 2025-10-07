"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, setAuthToken } from "@/app/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginErrorMessage, setLoginErrorMessage] = useState(null);
  const router = useRouter();

  const fetchFullProfileData = useCallback(async (basicUserData) => {
    let fullProfileData;
    const userTypeUpperCase = basicUserData.userType.toUpperCase();
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

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          const basicUserData = JSON.parse(storedUser);

          if (!basicUserData || !basicUserData.id || !basicUserData.userType) {
            console.error(
              "Dados de usuário incompletos no localStorage. Deslogando."
            );
            logout();
            return;
          }

          const fullProfileData = await fetchFullProfileData(basicUserData);

          setUser({ ...basicUserData, ...fullProfileData });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user from local storage:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, [fetchFullProfileData, logout]);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      const { token, profileId, role, ...restOfResponse } = response;

      setAuthToken(token);

      const userBasicDataWithIdAndType = {
        ...restOfResponse,
        id: profileId,
        userType: role.toUpperCase(),
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
      setLoginErrorMessage(null);
      router.push("/feed");
    } catch (error) {
      console.error("Login failed:", error);
      setLoginErrorMessage(
        error.message || "Falha no login. Verifique suas credenciais."
      );
      throw error;
    }
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
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
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
        register,
        loginErrorMessage,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
