const LOG_ENDPOINT =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOG_ENDPOINT) ||
  "http://localhost:3000/api/log";

function redactHeaders(headers = {}) {
  const h = {};
  try {
    if (typeof Headers !== "undefined" && headers instanceof Headers) {
      headers.forEach((v, k) => {
        if (
          k.toLowerCase() === "authorization" ||
          k.toLowerCase() === "cookie"
        ) {
          h[k] = "[REDACTED]";
        } else {
          h[k] = v;
        }
      });
    } else if (headers && typeof headers === "object") {
      Object.keys(headers).forEach((k) => {
        if (
          k.toLowerCase() === "authorization" ||
          k.toLowerCase() === "cookie"
        ) {
          h[k] = "[REDACTED]";
        } else {
          h[k] = headers[k];
        }
      });
    }
  } catch (err) {
    return {};
  }
  return h;
}

async function sendToServer(payload) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(LOG_ENDPOINT, blob);
      return;
    }

    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (err) {
    console.debug("Logger failed to send", err);
  }
}

export async function logRequestResponse({
  level = "info",
  route = null,
  method = "GET",
  requestBody = null,
  requestHeaders = {},
  responseBody = null,
  responseStatus = null,
  responseHeaders = {},
  message = null,
  meta = {},
}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    route,
    method,
    request: {
      headers: redactHeaders(requestHeaders),
      body: requestBody,
    },
    response: {
      status: responseStatus,
      headers: redactHeaders(responseHeaders),
      body: responseBody,
    },
    message,
    meta,
  };

  // Log no console do navegador para desenvolvimento
  if (process.env.NODE_ENV === "development") {
    const logStyle =
      level === "error"
        ? "color: #ef4444; font-weight: bold"
        : level === "warn"
        ? "color: #f59e0b; font-weight: bold"
        : "color: #10b981; font-weight: bold";

    const emoji = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";

    console.groupCollapsed(
      `%c${emoji} [${level.toUpperCase()}] ${method} ${route} ${
        responseStatus ? `(${responseStatus})` : ""
      }`,
      logStyle
    );

    console.log("📅 Timestamp:", payload.timestamp);
    console.log("🔗 Route:", route);
    console.log("📤 Method:", method);

    if (requestBody) {
      console.log("📦 Request Body:", requestBody);
    }

    if (responseStatus) {
      console.log("📊 Response Status:", responseStatus);
    }

    if (responseBody) {
      console.log("📥 Response Body:", responseBody);
    }

    if (message) {
      console.log("💬 Message:", message);
    }

    if (meta && Object.keys(meta).length > 0) {
      console.log("🔍 Meta:", meta);
    }

    console.groupEnd();
  }

  // fire-and-forget
  sendToServer(payload);
}

export async function info(payload) {
  return logRequestResponse({ level: "info", ...payload });
}

export async function warn(payload) {
  return logRequestResponse({ level: "warn", ...payload });
}

export async function error(payload) {
  return logRequestResponse({ level: "error", ...payload });
}

const _default = { logRequestResponse, info, warn, error };
export default _default;
