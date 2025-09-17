const API_URL = "http://localhost:8080/api";

let authToken = null;
export const setAuthToken = (token) => {
  authToken = token;
};

async function fetchApi(endpoint, options = {}) {
  const { body, ...customConfig } = options;
  const headers = { "Content-Type": "application/json" };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    method: body ? "POST" : options.method || "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      return Promise.reject(errorData);
    }
    if (response.status === 204) {
      return null; // No Content
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      // Se não for JSON, tenta ler como texto. Se for vazio, retorna null.
      const text = await response.text();
      return text ? text : null;
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

async function fetchApiFormData(endpoint, formData, options = {}) {
  const { ...customConfig } = options;
  const headers = {}; // FormData sets its own Content-Type header

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    method: "PUT", // Assumindo PUT para uploads de foto
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    body: formData,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      return Promise.reject(errorData);
    }
    if (response.status === 204) {
      return null; // No Content
    }
    return response.json();
  } catch (error) {
    return Promise.reject(error);
  }
}

// Importar as funções de criação de rotas
import createAuthRoutes from "./routes/authRoutes";
import createPlayerRoutes from "./routes/playerRoutes";
import createOrganizationRoutes from "./routes/organizationRoutes";
import createSpectatorRoutes from "./routes/spectatorRoutes";
import createFollowRoutes from "./routes/followRoutes";
import createGameRoutes from "./routes/gameRoutes";
import createGameParticipantsRoutes from "./routes/gameParticipantsRoutes";
import createGameInvitesRoutes from "./routes/gameInvitesRoutes";
import createPostRoutes from "./routes/postRoutes";
import createTeamRoutes from "./routes/teamRoutes";

export const api = {
  auth: createAuthRoutes(fetchApi),
  players: createPlayerRoutes(fetchApi, fetchApiFormData),
  organizations: createOrganizationRoutes(fetchApi, fetchApiFormData),
  spectators: createSpectatorRoutes(fetchApi),
  follow: createFollowRoutes(fetchApi),
  games: createGameRoutes(fetchApi),
  gameParticipants: createGameParticipantsRoutes(fetchApi),
  gameInvites: createGameInvitesRoutes(fetchApi),
  posts: createPostRoutes(fetchApi),
  teams: createTeamRoutes(fetchApi),
};
