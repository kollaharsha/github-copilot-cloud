#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getConfiguredSourceSummary, loadKnowledgeConfig } from "./core/config.mjs";
import { summarizeForMcp } from "./core/utils.mjs";
import { registerAllSourceTools } from "./sources/index.mjs";

const server = new McpServer({
  name: "platform-knowledge",
  version: "1.0.0"
});

const limitSchema = z.number().int().min(1).max(20).optional();

server.tool("list_configured_sources", {}, async () => {
  const configInfo = await loadKnowledgeConfig();
  return summarizeForMcp(getConfiguredSourceSummary(configInfo));
});
registerAllSourceTools(server, { z, limitSchema, loadKnowledgeConfig });

const transport = new StdioServerTransport();
await server.connect(transport);
