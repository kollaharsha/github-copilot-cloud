import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

const DEFAULT_CONFIG_PATH = "config/knowledge-sources.json";
const EXAMPLE_CONFIG_PATH = "config/knowledge-sources.example.json";
const DEFAULT_CLOUDABILITY_PATHS = ["/v3/views", "/v3/reporting", "/rightsizing"];
const DEFAULT_BLOCKED_AWS_SERVICES = ["secretsmanager", "kms", "ssm"];

export function resolveRepoPath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

export async function fileExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizeLegacyConfig(config) {
  if (config.enghub) {
    return config;
  }

  if (config.internalDocs) {
    return {
      ...config,
      enghub: config.internalDocs
    };
  }

  return config;
}

export function applyConfigDefaults(config) {
  const normalized = normalizeLegacyConfig(config);

  return {
    enghub: {
      allowedPathPrefixes: [],
      defaultHeaders: {},
      searchQueryParam: "q",
      ...normalized.enghub
    },
    gitlab: {
      projects: [],
      ...normalized.gitlab
    },
    confluence: {
      allowedSpaceKeys: [],
      ...normalized.confluence
    },
    aws: {
      blockedServices: DEFAULT_BLOCKED_AWS_SERVICES,
      allowedServices: [],
      ...normalized.aws
    },
    cloudability: {
      allowedPaths: DEFAULT_CLOUDABILITY_PATHS,
      defaultViewId: "0",
      ...normalized.cloudability
    }
  };
}

export async function loadKnowledgeConfig() {
  const configuredPath = process.env.PLATFORM_KB_CONFIG_PATH || DEFAULT_CONFIG_PATH;
  const resolvedConfiguredPath = resolveRepoPath(configuredPath);
  const resolvedExamplePath = resolveRepoPath(EXAMPLE_CONFIG_PATH);

  let config = {};
  let sourcePath = null;

  if (await fileExists(resolvedConfiguredPath)) {
    config = JSON.parse(await readFile(resolvedConfiguredPath, "utf8"));
    sourcePath = resolvedConfiguredPath;
  } else if (await fileExists(resolvedExamplePath)) {
    config = JSON.parse(await readFile(resolvedExamplePath, "utf8"));
  }

  return {
    sourcePath,
    configuredPath: resolvedConfiguredPath,
    config: applyConfigDefaults(config)
  };
}

export function getConfiguredSourceSummary(configInfo) {
  const { config, sourcePath } = configInfo;

  return {
    configLoaded: Boolean(sourcePath),
    configPath: sourcePath || configInfo.configuredPath,
    sources: {
      enghub: {
        enabled: Boolean(config.enghub.baseUrl),
        baseUrl: config.enghub.baseUrl || null,
        searchUrl: config.enghub.searchUrl || null,
        allowedPathPrefixes: config.enghub.allowedPathPrefixes || []
      },
      gitlab: {
        enabled: Boolean(config.gitlab.baseUrl && (config.gitlab.projects || []).length > 0),
        baseUrl: config.gitlab.baseUrl || null,
        projects: (config.gitlab.projects || []).map((project) => ({
          alias: project.alias,
          id: project.id,
          defaultRef: project.defaultRef || "main"
        }))
      },
      confluence: {
        enabled: Boolean(config.confluence.baseUrl),
        baseUrl: config.confluence.baseUrl || null,
        allowedSpaceKeys: config.confluence.allowedSpaceKeys || []
      },
      aws: {
        enabled: true,
        defaultRegion: config.aws.defaultRegion || null,
        allowedServices: config.aws.allowedServices || [],
        blockedServices: config.aws.blockedServices || DEFAULT_BLOCKED_AWS_SERVICES
      },
      cloudability: {
        enabled: Boolean(config.cloudability.baseUrl),
        baseUrl: config.cloudability.baseUrl || null,
        defaultViewId: config.cloudability.defaultViewId || "0",
        allowedPaths: config.cloudability.allowedPaths || DEFAULT_CLOUDABILITY_PATHS
      }
    },
    envStatus: {
      enghubTokenConfigured: Boolean(process.env.ENGHUB_API_TOKEN || process.env.INTERNAL_DOCS_API_TOKEN),
      gitlabTokenConfigured: Boolean(process.env.GITLAB_TOKEN),
      confluenceCredentialsConfigured: Boolean(process.env.CONFLUENCE_USERNAME && process.env.CONFLUENCE_API_TOKEN),
      cloudabilityTokenConfigured: Boolean(process.env.CLOUDABILITY_API_TOKEN),
      awsCredentialsDetected: Boolean(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ROLE_ARN || process.env.AWS_WEB_IDENTITY_TOKEN_FILE)
    }
  };
}

export { DEFAULT_BLOCKED_AWS_SERVICES, DEFAULT_CLOUDABILITY_PATHS };
