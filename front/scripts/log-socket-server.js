#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "client-logs.log");
const PORT = process.env.LOG_SOCKET_PORT || 3001;

function ensureLogDir() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function readLastLines(n = 200) {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    const raw = fs.readFileSync(LOG_FILE, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    return lines.slice(-n).map((l) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        return { raw: l };
      }
    });
  } catch (err) {
    return [];
  }
}

function startServer() {
  ensureLogDir();

  const wss = new WebSocketServer({ port: PORT });
  console.log(
    `[log-socket] WebSocket server listening on ws://localhost:${PORT}`
  );

  wss.on("connection", (ws) => {
    console.log("[log-socket] client connected");

    // send last lines on connect
    const last = readLastLines(200);
    ws.send(JSON.stringify({ type: "history", payload: last }));

    ws.on("close", () => console.log("[log-socket] client disconnected"));
  });

  // watch file append and broadcast new lines
  let pos = 0;
  try {
    const st = fs.existsSync(LOG_FILE) ? fs.statSync(LOG_FILE) : null;
    pos = st ? st.size : 0;
  } catch (e) {
    pos = 0;
  }

  fs.watch(path.dirname(LOG_FILE), async (eventType, filename) => {
    if (!filename || filename !== path.basename(LOG_FILE)) return;
    try {
      const st = fs.statSync(LOG_FILE);
      if (st.size > pos) {
        const fd = fs.openSync(LOG_FILE, "r");
        const toRead = st.size - pos;
        const buffer = Buffer.allocUnsafe(toRead);
        fs.readSync(fd, buffer, 0, toRead, pos);
        fs.closeSync(fd);
        pos = st.size;
        const text = buffer.toString("utf8");
        const lines = text
          .split(/\r?\n/)
          .filter(Boolean)
          .map((l) => {
            try {
              return JSON.parse(l);
            } catch (e) {
              return { raw: l };
            }
          });
        const msg = JSON.stringify({ type: "lines", payload: lines });
        wss.clients.forEach((c) => {
          if (c.readyState === c.OPEN) c.send(msg);
        });
      }
    } catch (err) {
      // ignore
    }
  });
}

startServer();
