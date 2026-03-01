/**
 * D-72 Thesis Group — WebSocket Presence Server
 * 
 * Tracks who is currently online and broadcasts the live visitor list
 * to all connected clients in real-time.
 * 
 * Protocol (JSON messages):
 * 
 *  Client → Server:
 *    { type: "join",  name: "🎓 Fahad", sessionId: "uuid", page: "/" }
 *    { type: "page",  page: "/storage" }
 *    { type: "ping" }                   ← keepalive
 * 
 *  Server → Client:
 *    { type: "visitors", visitors: [{ name, sessionId, page }] }
 *    { type: "pong" }
 */

const { WebSocketServer } = require("ws");
const http = require("http");

const PORT = process.env.PORT || 7000;

// ── State ──────────────────────────────────────────────────────────────────
// sessionId → { ws, name, page, sessionId, joinedAt }
const clients = new Map();

// ── HTTP server (WebSocket upgrades only) ──────────────────────────────────
const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health") {
    const visitors = getVisitorList();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", online: visitors.length, visitors }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("D-72 WebSocket Presence Server\n");
});

// ── WebSocket server ───────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });

function getVisitorList() {
  return Array.from(clients.values()).map(({ name, page, sessionId, joinedAt }) => ({
    name,
    page,
    sessionId,
    joinedAt,
  }));
}

function broadcast() {
  const payload = JSON.stringify({
    type: "visitors",
    visitors: getVisitorList(),
    count: clients.size,
  });

  for (const [, client] of clients) {
    if (client.ws.readyState === 1 /* OPEN */) {
      client.ws.send(payload);
    }
  }
}

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  let sessionId = null;

  console.log(`[WS] New connection from ${ip}. Total: ${wss.clients.size}`);

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return; // Ignore malformed messages
    }

    switch (msg.type) {
      // ── JOIN: client registers with name + page ──
      case "join": {
        if (!msg.name || !msg.sessionId) break;
        sessionId = msg.sessionId;
        clients.set(sessionId, {
          ws,
          name: msg.name,
          page: msg.page || "/",
          sessionId,
          joinedAt: new Date().toISOString(),
        });
        console.log(`[WS] JOIN  — ${msg.name} on ${msg.page || "/"}`);
        broadcast();
        break;
      }

      // ── PAGE: client navigated to a different page ──
      case "page": {
        if (sessionId && clients.has(sessionId)) {
          clients.get(sessionId).page = msg.page || "/";
          console.log(`[WS] PAGE  — ${clients.get(sessionId).name} → ${msg.page}`);
          broadcast();
        }
        break;
      }

      // ── PING: keepalive ──
      case "ping": {
        ws.send(JSON.stringify({ type: "pong" }));
        break;
      }

      default:
        break;
    }
  });

  ws.on("close", () => {
    if (sessionId && clients.has(sessionId)) {
      const { name } = clients.get(sessionId);
      clients.delete(sessionId);
      console.log(`[WS] LEAVE — ${name}. Remaining: ${clients.size}`);
      broadcast();
    }
  });

  ws.on("error", (err) => {
    console.error(`[WS] Error:`, err.message);
    if (sessionId) clients.delete(sessionId);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log("");
  console.log("  🎓 D-72 Thesis Group — Presence Server");
  console.log("  ─────────────────────────────────────");
  console.log(`  🚀 WebSocket: ws://localhost:${PORT}`);
  console.log(`  🏥 Health:    http://localhost:${PORT}/health`);
  console.log("");
});
