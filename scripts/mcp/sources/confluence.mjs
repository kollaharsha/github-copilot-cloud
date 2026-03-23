import { fetchJson } from "../core/http.mjs";
import { stripHtml, summarizeForMcp, truncate } from "../core/utils.mjs";

function buildConfluenceHeaders() {
  const username = process.env.CONFLUENCE_USERNAME;
  const apiToken = process.env.CONFLUENCE_API_TOKEN;

  if (!username || !apiToken) {
    throw new Error("CONFLUENCE_USERNAME and CONFLUENCE_API_TOKEN must both be configured.");
  }

  const basic = Buffer.from(`${username}:${apiToken}`).toString("base64");
  return {
    Authorization: `Basic ${basic}`,
    Accept: "application/json"
  };
}

export function registerConfluenceTools(server, { z, limitSchema, loadKnowledgeConfig }) {
  server.tool(
    "search_confluence",
    {
      query: z.string().min(2),
      spaceKey: z.string().optional(),
      limit: limitSchema
    },
    async ({ query, spaceKey, limit = 5 }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.confluence.baseUrl) {
        throw new Error("confluence.baseUrl is not configured.");
      }

      if (spaceKey && (config.confluence.allowedSpaceKeys || []).length > 0 && !config.confluence.allowedSpaceKeys.includes(spaceKey)) {
        throw new Error(`Confluence space "${spaceKey}" is not in the configured allowlist.`);
      }

      const baseFilter = spaceKey
        ? `space="${spaceKey}"`
        : (config.confluence.allowedSpaceKeys || []).length > 0
          ? `(${config.confluence.allowedSpaceKeys.map((key) => `space="${key}"`).join(" OR ")})`
          : "";

      const cqlParts = ['type=page', `text~"${query.replace(/"/g, '\\"')}"`];
      if (baseFilter) {
        cqlParts.push(baseFilter);
      }

      const endpoint = new URL(`${config.confluence.baseUrl}/rest/api/search`);
      endpoint.searchParams.set("cql", cqlParts.join(" AND "));
      endpoint.searchParams.set("limit", String(limit));

      const payload = await fetchJson(endpoint, {
        headers: buildConfluenceHeaders()
      });

      const results = (payload.results || []).slice(0, limit).map((item) => ({
        title: item.title,
        pageId: item.content?.id || item.id,
        spaceKey: item.space?.key || item.content?.space?.key || null,
        url: item.url || (item._links?.base && item._links?.webui ? new URL(item._links.webui, item._links.base).toString() : null),
        excerpt: truncate(stripHtml(item.excerpt || item.content?.body?.view?.value || ""), 400)
      }));

      return summarizeForMcp({
        query,
        source: "confluence",
        results
      });
    }
  );

  server.tool(
    "get_confluence_page",
    {
      pageId: z.string().min(1)
    },
    async ({ pageId }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.confluence.baseUrl) {
        throw new Error("confluence.baseUrl is not configured.");
      }

      const endpoint = new URL(`${config.confluence.baseUrl}/rest/api/content/${pageId}`);
      endpoint.searchParams.set("expand", "body.storage,space,version");

      const payload = await fetchJson(endpoint, {
        headers: buildConfluenceHeaders()
      });

      const pageUrl = payload._links?.base && payload._links?.webui ? new URL(payload._links.webui, payload._links.base).toString() : null;
      return summarizeForMcp({
        source: "confluence",
        pageId,
        title: payload.title,
        spaceKey: payload.space?.key || null,
        version: payload.version?.number || null,
        url: pageUrl,
        content: truncate(stripHtml(payload.body?.storage?.value || ""), 12000)
      });
    }
  );
}

export { buildConfluenceHeaders };
