import { DEFAULT_CLOUDABILITY_PATHS } from "../core/config.mjs";
import { fetchJson } from "../core/http.mjs";
import { summarizeForMcp } from "../core/utils.mjs";

function buildCloudabilityHeaders() {
  const token = process.env.CLOUDABILITY_API_TOKEN;
  if (!token) {
    throw new Error("CLOUDABILITY_API_TOKEN is not configured.");
  }

  const basic = Buffer.from(`${token}:`).toString("base64");
  return {
    Authorization: `Basic ${basic}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };
}

export function validateCloudabilityPath(config, requestPath) {
  if (!requestPath.startsWith("/")) {
    throw new Error("Cloudability path must begin with '/'.");
  }

  const allowedPaths = config.cloudability.allowedPaths || DEFAULT_CLOUDABILITY_PATHS;
  const allowed = allowedPaths.some((prefix) => requestPath.startsWith(prefix));

  if (!allowed) {
    throw new Error(`Cloudability path "${requestPath}" is not in the configured allowlist.`);
  }
}

export function registerCloudabilityTools(server, { z, limitSchema, loadKnowledgeConfig }) {
  server.tool(
    "list_cloudability_views",
    {
      limit: limitSchema
    },
    async ({ limit = 20 }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.cloudability.baseUrl) {
        throw new Error("cloudability.baseUrl is not configured.");
      }

      const endpoint = new URL(`${config.cloudability.baseUrl}/v3/views`);
      endpoint.searchParams.set("limit", String(limit));

      const payload = await fetchJson(endpoint, {
        headers: buildCloudabilityHeaders()
      });

      return summarizeForMcp({
        source: "cloudability",
        operation: "list_views",
        results: payload
      });
    }
  );

  server.tool(
    "list_cloudability_cost_reports",
    {
      limit: limitSchema
    },
    async ({ limit = 20 }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.cloudability.baseUrl) {
        throw new Error("cloudability.baseUrl is not configured.");
      }

      const endpoint = new URL(`${config.cloudability.baseUrl}/v3/reporting/reports/cost`);
      endpoint.searchParams.set("limit", String(limit));

      const payload = await fetchJson(endpoint, {
        headers: buildCloudabilityHeaders()
      });

      return summarizeForMcp({
        source: "cloudability",
        operation: "list_cost_reports",
        results: payload
      });
    }
  );

  server.tool(
    "cloudability_request",
    {
      path: z.string().min(1),
      method: z.enum(["GET", "POST"]).optional(),
      query: z.record(z.string()).optional(),
      body: z.string().optional()
    },
    async ({ path, method = "GET", query = {}, body }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.cloudability.baseUrl) {
        throw new Error("cloudability.baseUrl is not configured.");
      }

      validateCloudabilityPath(config, path);

      const endpoint = new URL(`${config.cloudability.baseUrl}${path}`);
      for (const [key, value] of Object.entries(query)) {
        endpoint.searchParams.set(key, value);
      }

      const options = {
        method,
        headers: buildCloudabilityHeaders()
      };

      if (method === "POST" && body) {
        options.body = body;
      }

      const payload = await fetchJson(endpoint, options);
      return summarizeForMcp({
        source: "cloudability",
        method,
        path,
        result: payload
      });
    }
  );
}
