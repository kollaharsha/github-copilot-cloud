import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const agentsDir = path.resolve(".github/agents");

const expectedTools = {
  "cloud-architect.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "cloud-developer.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "cloud-reviewer.agent.md": [
    "read",
    "search",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "cloud-tester.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/aws_cli_read"
  ],
  "cloud-verifier.agent.md": [
    "read",
    "search",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read",
    "platform-knowledge/list_cloudability_cost_reports"
  ],
  "cloud-debugger.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/aws_cli_read"
  ],
  "cloud-finops.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/list_cloudability_views",
    "platform-knowledge/list_cloudability_cost_reports",
    "platform-knowledge/cloudability_request",
    "platform-knowledge/aws_cli_read"
  ],
  "construct-creator.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page"
  ],
  "cloud-operations.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "cloud-sre.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "release-engineer.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "documentation-assistant.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page"
  ],
  "migration-advisor.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "observability-engineer.agent.md": [
    "read",
    "search",
    "edit",
    "execute",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "identity-and-access-advisor.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "resilience-engineer.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ],
  "security-and-compliance-advisor.agent.md": [
    "read",
    "search",
    "edit",
    "agent",
    "platform-knowledge/list_configured_sources",
    "platform-knowledge/search_enghub",
    "platform-knowledge/get_enghub_doc",
    "platform-knowledge/search_gitlab",
    "platform-knowledge/get_gitlab_file",
    "platform-knowledge/search_confluence",
    "platform-knowledge/get_confluence_page",
    "platform-knowledge/aws_cli_read"
  ]
};

function parseFrontmatter(contents) {
  const match = contents.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    throw new Error("Missing YAML frontmatter.");
  }

  return match[1];
}

function extractSingleLineValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function parseTools(frontmatter) {
  const value = extractSingleLineValue(frontmatter, "tools");
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value.replaceAll("'", "\""));
  } catch (error) {
    throw new Error(`Unable to parse tools array: ${error.message}`);
  }
}

function fail(message) {
  console.error(`validate:agents: ${message}`);
  process.exitCode = 1;
}

const files = (await readdir(agentsDir)).filter((file) => file.endsWith(".agent.md")).sort();

for (const file of files) {
  const fullPath = path.join(agentsDir, file);
  const contents = await readFile(fullPath, "utf8");
  const frontmatter = parseFrontmatter(contents);

  for (const key of ["name", "description", "model", "tools"]) {
    if (!extractSingleLineValue(frontmatter, key)) {
      fail(`${file}: missing required frontmatter key "${key}".`);
    }
  }

  if (extractSingleLineValue(frontmatter, "target")) {
    fail(`${file}: remove "target" so the agent stays portable across supported surfaces.`);
  }

  if (/^mcp-servers:/m.test(frontmatter)) {
    fail(`${file}: repository-level MCP config should be used instead of per-agent MCP duplication.`);
  }

  const displayName = extractSingleLineValue(frontmatter, "name")?.replace(/^['"]|['"]$/g, "");
  if (displayName && !/\s/.test(displayName)) {
    fail(`${file}: name should be a human-readable display name, not only a slug.`);
  }

  const model = extractSingleLineValue(frontmatter, "model")?.replace(/^['"]|['"]$/g, "");
  if (model !== "gpt-5") {
    fail(`${file}: model should be set to "gpt-5".`);
  }

  const tools = parseTools(frontmatter);
  const expected = expectedTools[file];
  if (!expected) {
    fail(`${file}: no expected tool policy registered.`);
  } else if (JSON.stringify(tools) !== JSON.stringify(expected)) {
    fail(`${file}: tools list does not match the expected least-privilege policy.`);
  }

  if (!contents.includes("## Output contract")) {
    fail(`${file}: missing "## Output contract" section.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`validate:agents: ${files.length} agent profiles passed validation.`);
