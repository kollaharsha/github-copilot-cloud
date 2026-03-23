import { fetchJson, fetchText } from "../core/http.mjs";
import { stripHtml, summarizeForMcp, truncate } from "../core/utils.mjs";

function buildGitLabHeaders() {
  const token = process.env.GITLAB_TOKEN;
  if (!token) {
    throw new Error("GITLAB_TOKEN is not configured.");
  }

  const authType = (process.env.GITLAB_AUTH_TYPE || "private-token").toLowerCase();
  if (authType === "bearer") {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  return {
    "PRIVATE-TOKEN": token
  };
}

function findProject(config, projectKey) {
  const projects = config.gitlab.projects || [];
  const project = projects.find((entry) => entry.alias === projectKey || entry.id === projectKey);

  if (!project) {
    throw new Error(`GitLab project "${projectKey}" is not in the configured allowlist.`);
  }

  return project;
}

export function registerGitLabTools(server, { z, limitSchema, loadKnowledgeConfig }) {
  server.tool(
    "search_gitlab",
    {
      query: z.string().min(2),
      project: z.string().optional(),
      ref: z.string().optional(),
      limit: limitSchema
    },
    async ({ query, project, ref, limit = 5 }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.gitlab.baseUrl) {
        throw new Error("gitlab.baseUrl is not configured.");
      }

      const projects = project ? [findProject(config, project)] : config.gitlab.projects;
      const headers = buildGitLabHeaders();
      const results = [];

      for (const entry of projects) {
        const projectId = encodeURIComponent(entry.id);
        const endpoint = new URL(`${config.gitlab.baseUrl}/api/v4/projects/${projectId}/search`);
        endpoint.searchParams.set("scope", "blobs");
        endpoint.searchParams.set("search", query);
        endpoint.searchParams.set("per_page", String(limit));
        endpoint.searchParams.set("ref", ref || entry.defaultRef || "main");

        const payload = await fetchJson(endpoint, { headers });
        for (const item of payload.slice(0, limit)) {
          results.push({
            project: entry.alias || entry.id,
            path: item.path,
            filename: item.filename,
            ref: ref || entry.defaultRef || "main",
            snippet: truncate(stripHtml(item.data || ""), 400)
          });
        }
      }

      return summarizeForMcp({
        query,
        source: "gitlab",
        results: results.slice(0, limit)
      });
    }
  );

  server.tool(
    "get_gitlab_file",
    {
      project: z.string().min(1),
      filePath: z.string().min(1),
      ref: z.string().optional()
    },
    async ({ project, filePath, ref }) => {
      const { config } = await loadKnowledgeConfig();
      if (!config.gitlab.baseUrl) {
        throw new Error("gitlab.baseUrl is not configured.");
      }

      const entry = findProject(config, project);
      const headers = buildGitLabHeaders();
      const endpoint = new URL(
        `${config.gitlab.baseUrl}/api/v4/projects/${encodeURIComponent(entry.id)}/repository/files/${encodeURIComponent(filePath)}/raw`
      );
      endpoint.searchParams.set("ref", ref || entry.defaultRef || "main");

      const payload = await fetchText(endpoint, { headers });
      return summarizeForMcp({
        source: "gitlab",
        project: entry.alias || entry.id,
        filePath,
        ref: ref || entry.defaultRef || "main",
        content: truncate(payload, 12000)
      });
    }
  );
}

export { buildGitLabHeaders, findProject };
