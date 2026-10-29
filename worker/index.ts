import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

// A new Cloudflare account starts with an empty D1 database. Create the
// existing schema once per Worker isolate before any API route queries it.
let schemaReady: Promise<void> | undefined;
function ensureSchema(db: D1Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = db.exec(`
      CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, original_key TEXT NOT NULL, preview_key TEXT, published INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS uploads (id TEXT PRIMARY KEY NOT NULL, owner_id TEXT NOT NULL, object_key TEXT NOT NULL, upload_id TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL);
    `).then(() => undefined).catch(error => { schemaReady = undefined; throw error; });
  }
  return schemaReady;
}

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    if (new URL(request.url).pathname.startsWith("/api/") && env.DB) await ensureSchema(env.DB);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};

export default worker;
