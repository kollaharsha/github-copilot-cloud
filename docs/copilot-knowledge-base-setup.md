# Copilot Knowledge Base Integration Setup

This repository now includes a local MCP server at [`scripts/mcp/platform-knowledge-server.mjs`](../scripts/mcp/platform-knowledge-server.mjs) that gives GitHub Copilot custom agents controlled, read-only access to:

- EngHub
- Selected GitLab repositories
- Confluence pages
- AWS account metadata through AWS CLI
- Cloudability APIs

The recommended operating model is:

- Configure `platform-knowledge` once at the repository level in GitHub Copilot MCP settings.
- Keep individual agent files focused on persona behavior and least-privilege tool selection.
- Avoid repeating the full MCP server definition in every `.agent.md` file.

## What was implemented

- MCP server: [`scripts/mcp/platform-knowledge-server.mjs`](../scripts/mcp/platform-knowledge-server.mjs)
- Shared core utilities: [`scripts/mcp/core`](../scripts/mcp/core)
- Source modules: [`scripts/mcp/sources`](../scripts/mcp/sources)
- Compatibility exports and tests: [`scripts/mcp/platform-knowledge-lib.mjs`](../scripts/mcp/platform-knowledge-lib.mjs)
- Example source configuration: [`config/knowledge-sources.example.json`](../config/knowledge-sources.example.json)
- Example repository-level MCP configuration: [`config/copilot-repository-mcp.example.json`](../config/copilot-repository-mcp.example.json)
- Copilot environment bootstrap workflow: [`.github/workflows/copilot-setup-steps.yml`](../.github/workflows/copilot-setup-steps.yml)
- Agent profile validator: [`scripts/validate-agents.mjs`](../scripts/validate-agents.mjs)

## MCP tools exposed

- `platform-knowledge/list_configured_sources`
- `platform-knowledge/search_enghub`
- `platform-knowledge/get_enghub_doc`
- `platform-knowledge/search_gitlab`
- `platform-knowledge/get_gitlab_file`
- `platform-knowledge/search_confluence`
- `platform-knowledge/get_confluence_page`
- `platform-knowledge/aws_cli_read`
- `platform-knowledge/list_cloudability_views`
- `platform-knowledge/list_cloudability_cost_reports`
- `platform-knowledge/cloudability_request`

## Repository configuration

### 1. Configure the repository-level MCP server

Use [`config/copilot-repository-mcp.example.json`](../config/copilot-repository-mcp.example.json) as the source template for your repository-level GitHub Copilot MCP configuration.

This de-duplicates the MCP server definition so every custom agent can reference the same `platform-knowledge` toolset without carrying identical frontmatter blocks.

### 2. Configure the knowledge source allowlist

Create a real config file at `config/knowledge-sources.json` by copying the example:

```json
{
  "enghub": {
    "baseUrl": "https://enghub.internal.example.com",
    "searchUrl": "https://enghub.internal.example.com/api/search",
    "searchQueryParam": "q",
    "allowedPathPrefixes": ["/platform", "/engineering/aws"]
  },
  "gitlab": {
    "baseUrl": "https://gitlab.example.com",
    "projects": [
      {
        "alias": "construct-library",
        "id": "platform/aws/cdk-construct-library",
        "defaultRef": "main"
      }
    ]
  },
  "confluence": {
    "baseUrl": "https://company.atlassian.net/wiki",
    "allowedSpaceKeys": ["PLAT", "ARCH"]
  },
  "aws": {
    "defaultRegion": "us-east-1",
    "allowedServices": ["sts", "cloudformation", "service-quotas", "ec2", "iam"],
    "blockedServices": ["secretsmanager", "kms", "ssm"]
  },
  "cloudability": {
    "baseUrl": "https://api.cloudability.com",
    "defaultViewId": "0",
    "allowedPaths": ["/v3/views", "/v3/reporting", "/rightsizing"]
  }
}
```

`config/knowledge-sources.json` is ignored by git so internal URLs, project identifiers, and allowlists can stay repository-local if needed.

## Copilot environment secrets and variables

Configure these in the repository `copilot` environment on GitHub. GitHub’s docs say only names prefixed with `COPILOT_MCP_` are exposed to MCP configuration.

### Required secrets

- `COPILOT_MCP_GITLAB_TOKEN`
- `COPILOT_MCP_CONFLUENCE_API_TOKEN`
- `COPILOT_MCP_CLOUDABILITY_API_TOKEN`

### Required variables

- `COPILOT_MCP_CONFLUENCE_USERNAME`

### Optional secrets

- `COPILOT_MCP_ENGHUB_API_TOKEN`

### Optional variables

- `COPILOT_MCP_ENGHUB_AUTH_HEADER`
- `COPILOT_MCP_ENGHUB_AUTH_SCHEME`
- `COPILOT_MCP_GITLAB_AUTH_TYPE`

## Security model

- All knowledge tools are read-only.
- GitLab access is restricted to explicitly allowlisted repositories.
- EngHub fetches are restricted to the configured host and optional path prefixes.
- AWS CLI access is restricted to read-only operations with `get`, `list`, or `describe` prefixes.
- `secretsmanager`, `kms`, and `ssm` are blocked by default for AWS CLI access.
- Cloudability requests are restricted to configured allowlisted path prefixes.

## Important GitHub Copilot notes

GitHub’s current docs say:

- Repository admins can configure MCP servers in repository settings.
- Custom agents can define `mcp-servers` in agent YAML frontmatter, but this repository intentionally avoids that duplication and uses repository-level MCP configuration instead.
- Secrets and variables exposed to MCP configuration must live in the repository `copilot` environment.
- Local MCP servers are supported for Copilot coding agent.

### Sources

- GitHub custom agent configuration: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- GitHub MCP for coding agent: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp
- GitHub Copilot setup steps: https://docs.github.com/en/enterprise-cloud%40latest/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment

## Optional: enable broader GitHub web search

If you also want agents to look up AWS public documentation or related GitHub content beyond this repository, configure the built-in GitHub MCP server in repository settings with the `web_search` toolset. GitHub documents that separately in repository settings rather than as a file in the repo.
