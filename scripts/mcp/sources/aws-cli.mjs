import { spawn } from "node:child_process";
import { summarizeForMcp, truncate } from "../core/utils.mjs";
import { DEFAULT_BLOCKED_AWS_SERVICES } from "../core/config.mjs";

const SAFE_AWS_OPERATION_PREFIXES = ["get", "list", "describe"];

export function validateAwsCliRequest(config, request) {
  const service = request.service?.trim();
  const operation = request.operation?.trim();
  const args = request.args || [];

  if (!service || !operation) {
    throw new Error("Both service and operation are required.");
  }

  const normalizedService = service.toLowerCase();
  const normalizedOperation = operation.toLowerCase();
  const allowedServices = (config.aws.allowedServices || []).map((item) => item.toLowerCase());
  const blockedServices = (config.aws.blockedServices || DEFAULT_BLOCKED_AWS_SERVICES).map((item) => item.toLowerCase());

  if (blockedServices.includes(normalizedService)) {
    throw new Error(`AWS service "${service}" is blocked for this MCP tool.`);
  }

  if (allowedServices.length > 0 && !allowedServices.includes(normalizedService)) {
    throw new Error(`AWS service "${service}" is not in the configured allowlist.`);
  }

  if (!SAFE_AWS_OPERATION_PREFIXES.some((prefix) => normalizedOperation.startsWith(prefix))) {
    throw new Error(`AWS operation "${operation}" is not read-only by policy.`);
  }

  if (args.some((value) => value.includes("file://"))) {
    throw new Error("Arguments containing file:// are not allowed.");
  }

  if (args.some((value) => value === "--with-decryption")) {
    throw new Error("Arguments requesting decryption are not allowed.");
  }

  return {
    service,
    operation,
    args
  };
}

export function registerAwsCliTools(server, { z, loadKnowledgeConfig }) {
  server.tool(
    "aws_cli_read",
    {
      service: z.string().min(1),
      operation: z.string().min(1),
      args: z.array(z.string()).optional(),
      region: z.string().optional(),
      query: z.string().optional()
    },
    async ({ service, operation, args = [], region, query }) => {
      const { config } = await loadKnowledgeConfig();
      const validated = validateAwsCliRequest(config, { service, operation, args });

      const commandArgs = [validated.service, validated.operation, ...validated.args];
      if (region || config.aws.defaultRegion) {
        commandArgs.push("--region", region || config.aws.defaultRegion);
      }
      if (query) {
        commandArgs.push("--query", query);
      }
      commandArgs.push("--output", "json");

      const result = await new Promise((resolve, reject) => {
        const child = spawn("aws", commandArgs, {
          env: process.env,
          stdio: ["ignore", "pipe", "pipe"]
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (chunk) => {
          stdout += chunk.toString();
        });

        child.stderr.on("data", (chunk) => {
          stderr += chunk.toString();
        });

        child.on("error", reject);
        child.on("close", (code) => {
          if (code !== 0) {
            reject(new Error(`aws exited with code ${code}: ${truncate(stderr, 800)}`));
            return;
          }

          try {
            resolve(stdout ? JSON.parse(stdout) : {});
          } catch {
            resolve(stdout.trim());
          }
        });
      });

      return summarizeForMcp({
        source: "aws-cli",
        service,
        operation,
        region: region || config.aws.defaultRegion || null,
        result
      });
    }
  );
}
