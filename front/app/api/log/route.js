import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "client-logs.log");

async function ensureLogDir() {
  try {
    await fs.promises.mkdir(LOG_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const now = new Date().toISOString();

    const entry = {
      receivedAt: now,
      remoteAddr: request.headers.get("x-forwarded-for") || null,
      origin: request.headers.get("origin") || null,
      ua: request.headers.get("user-agent") || null,
      payload: body,
    };

    await ensureLogDir();
    const line = JSON.stringify(entry) + "\n";
    // append to file - fire and forget but await to ensure durability locally
    await fs.promises.appendFile(LOG_FILE, line, { encoding: "utf8" });

    // Also print to server console to help during dev
    console.info("[client-log]", entry.receivedAt, entry.origin);

    // 204 No Content - client uses sendBeacon or fetch keepalive
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error writing client log:", err);
    return NextResponse.json({ error: "failed to write log" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await ensureLogDir();
    // truncate the file
    await fs.promises.writeFile(LOG_FILE, "", { encoding: "utf8" });
    console.info("[client-log] cleared client-logs.log");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error clearing client log:", err);
    return NextResponse.json({ error: "failed to clear log" }, { status: 500 });
  }
}
