export function stripHtml(value) {
  if (!value) {
    return "";
  }

  const decoded = value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");

  return decoded.replace(/\s+/g, " ").trim();
}

export function truncate(value, maxLength = 1600) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) {
    return null;
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function resolveUrl(baseUrl, pathOrUrl) {
  if (!pathOrUrl) {
    throw new Error("A path or URL is required.");
  }

  const normalizedBase = normalizeBaseUrl(baseUrl);
  return new URL(pathOrUrl, normalizedBase || undefined);
}

export function assertAllowedHost(baseUrl, candidateUrl) {
  const base = new URL(baseUrl);
  const candidate = new URL(candidateUrl);

  if (base.host !== candidate.host) {
    throw new Error(`The requested URL host "${candidate.host}" is not allowed.`);
  }
}

export function summarizeForMcp(payload) {
  return {
    content: [
      {
        type: "text",
        text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)
      }
    ]
  };
}

export function pickSearchResultArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of ["results", "items", "data", "documents", "value"]) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "object")) {
      return value;
    }
  }

  return [];
}

export function normalizeSearchItem(item, baseUrl = null) {
  const rawUrl = item.url || item.href || item.webui || item.path || item._links?.webui || item._links?.self;
  let url = rawUrl || null;
  if (url && baseUrl) {
    url = new URL(url, baseUrl).toString();
  }

  return {
    title: item.title || item.name || item.filename || item.path || "Untitled",
    url,
    snippet: stripHtml(
      item.snippet ||
        item.summary ||
        item.excerpt ||
        item.body ||
        item.data ||
        item.content ||
        item.text ||
        ""
    )
  };
}
