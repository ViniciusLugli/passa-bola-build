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

          // Extract userId from JWT token if not present in stored user
          if (!basicUserData.userId) {
            try {
              const payload = JSON.parse(atob(storedToken.split(".")[1]));
              basicUserData.userId = payload.userId || payload.sub;
              console.log(
                "[AuthContext] Extracted userId from token:",
                basicUserData.userId
              );
            } catch (e) {
              console.error("[AuthContext] Failed to decode JWT:", e);
              basicUserData.userId = basicUserData.id; // Fallback to profile ID
            }
          }

          const fullProfileData = await fetchFullProfileData(basicUserData);

          const completeUserData = { ...basicUserData, ...fullProfileData };

          // Update localStorage with userId if it was missing
          localStorage.setItem("user", JSON.stringify(completeUserData));

          setUser(completeUserData);
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

      // Extract userId from JWT token
      let userIdFromToken = null;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userIdFromToken = payload.userId || payload.sub;
        console.log("[AuthContext] JWT Payload userId:", userIdFromToken);
      } catch (e) {
        console.error("[AuthContext] Failed to decode JWT:", e);
      }

      const userBasicDataWithIdAndType = {
        ...restOfResponse,
        id: profileId,
        userId: userIdFromToken || profileId, // Snowflake ID from JWT
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

  // Update user profile data in context and localStorage
  const updateUserProfile = useCallback(
    async (updatedData) => {
      try {
        // Merge updated data with existing user data
        const updatedUser = { ...user, ...updatedData };

        // Update state
        setUser(updatedUser);

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return updatedUser;
      } catch (error) {
        console.error("Failed to update user profile:", error);
        throw error;
      }
    },
    [user]
  );

  // Refresh user data from server
  const refreshUserProfile = useCallback(async () => {
    if (!user?.id || !user?.userType) return;

    try {
      const freshProfileData = await fetchFullProfileData(user);
      const updatedUser = { ...user, ...freshProfileData };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      throw error;
    }
  }, [user, fetchFullProfileData]);

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
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
