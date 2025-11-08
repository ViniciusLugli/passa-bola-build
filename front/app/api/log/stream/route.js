import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "logs", "client-logs.log");

function formatEvent(obj) {
  // send as JSON string per event
  const payload = typeof obj === "string" ? { line: obj } : obj;
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ensure file exists
        if (!fs.existsSync(LOG_FILE)) {
          // nothing yet - send a heartbeat comment so clients know stream is open
          controller.enqueue(": no log file yet\n\n");
        } else {
          // send last N lines (safe for dev)
          const raw = await fs.promises.readFile(LOG_FILE, {
            encoding: "utf8",
          });
          const lines = raw.split(/\r?\n/).filter(Boolean);
          const last = lines.slice(-200);
          for (const l of last) {
            controller.enqueue(
              formatEvent({ line: l, timestamp: new Date().toISOString() })
            );
          }
        }

        // keep track of current file size
        let pos = 0;
        try {
          const st = await fs.promises.stat(LOG_FILE);
          pos = st.size;
        } catch (e) {
          pos = 0;
        }

        // Watch for changes and stream appended content
        const watcher = fs.watch(
          path.dirname(LOG_FILE),
          async (eventType, filename) => {
            try {
              if (!filename || filename !== path.basename(LOG_FILE)) return;
              const st = await fs.promises.stat(LOG_FILE);
              if (st.size > pos) {
                const streamFd = await fs.promises.open(LOG_FILE, "r");
                const toRead = st.size - pos;
                const buffer = Buffer.allocUnsafe(toRead);
                await streamFd.read(buffer, 0, toRead, pos);
                await streamFd.close();
                pos = st.size;
                const text = buffer.toString("utf8");
                const addedLines = text.split(/\r?\n/).filter(Boolean);
                for (const l of addedLines)
                  controller.enqueue(
                    formatEvent({
                      line: l,
                      timestamp: new Date().toISOString(),
                    })
                  );
              }
            } catch (err) {
              // if file removed or race, ignore
            }
          }
        );

        // keep watcher reference to close on cancel
        controller._watcher = watcher;
      } catch (err) {
        controller.enqueue(formatEvent({ error: String(err) }));
        controller.close();
      }
    },
    cancel() {
      try {
        const w = this._watcher;
        if (w && typeof w.close === "function") w.close();
      } catch (e) {
        // ignore
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
