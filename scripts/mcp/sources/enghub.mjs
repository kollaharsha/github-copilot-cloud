import { fetchJson, fetchText } from "../core/http.mjs";
import {
  assertAllowedHost,
  normalizeSearchItem,
  pickSearchResultArray,
  resolveUrl,
  stripHtml,
  summarizeForMcp,
  truncate
} from "../core/utils.mjs";

function buildEngHubHeaders(config) {
  const headers = {
    ...(config.enghub.defaultHeaders || {})
  };

  const token = process.env.ENGHUB_API_TOKEN || process.env.INTERNAL_DOCS_API_TOKEN;
  if (token) {
    const headerName = process.env.ENGHUB_AUTH_HEADER || process.env.INTERNAL_DOCS_AUTH_HEADER || "Authorization";
    const scheme = process.env.ENGHUB_AUTH_SCHEME || process.env.INTERNAL_DOCS_AUTH_SCHEME || "Bearer";
    headers[headerName] = scheme ? `${scheme} ${token}` : token;
  }

  return headers;
}

function assertAllowedEngHubPath(config, candidateUrl) {
  if (!config.enghub.baseUrl) {
    throw new Error("enghub.baseUrl is not configured.");
  }

  assertAllowedHost(config.enghub.baseUrl, candidateUrl);

  const prefixes = config.enghub.allowedPathPrefixes || [];
  if (prefixes.length === 0) {
    return;
  }

  const candidatePath = new URL(candidateUrl).pathname;
  const allowed = prefixes.some((prefix) => candidatePath.startsWith(prefix));
  if (!allowed) {
    throw new Error(`The EngHub path "${candidatePath}" is not in the allowlist.`);
  }
}

export function registerEngHubTools(server, { z, limitSchema, loadKnowledgeConfig }) {
  server.tool(
    "search_enghub",
    {
      query: z.string().min(2),
      limit: limitSchema
    },
    async ({ query, limit = 5 }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.enghub.searchUrl) {
        throw new Error("enghub.searchUrl is not configured.");
      }

      const searchUrl = new URL(config.enghub.searchUrl);
      searchUrl.searchParams.set(config.enghub.searchQueryParam || "q", query);
      searchUrl.searchParams.set("limit", String(limit));

      const payload = await fetchJson(searchUrl, {
        headers: buildEngHubHeaders(config)
      });

      const items = pickSearchResultArray(payload)
        .slice(0, limit)
        .map((item) => normalizeSearchItem(item, config.enghub.baseUrl));

      return summarizeForMcp({
        query,
        source: "enghub",
        results: items
      });
    }
  );

  server.tool(
    "get_enghub_doc",
    {
      path: z.string().min(1)
    },
    async ({ path }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.enghub.baseUrl) {
        throw new Error("enghub.baseUrl is not configured.");
      }

      const targetUrl = resolveUrl(config.enghub.baseUrl, path).toString();
      assertAllowedEngHubPath(config, targetUrl);

      const body = await fetchText(targetUrl, {
        headers: buildEngHubHeaders(config)
      });

      return summarizeForMcp({
        source: "enghub",
        url: targetUrl,
        content: truncate(stripHtml(body), 12000)
      });
    }
  );
}

export { assertAllowedEngHubPath, buildEngHubHeaders };
