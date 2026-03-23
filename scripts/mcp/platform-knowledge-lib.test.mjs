import test from "node:test";
import assert from "node:assert/strict";
import {
  applyConfigDefaults,
  getConfiguredSourceSummary,
  stripHtml,
  validateAwsCliRequest,
  validateCloudabilityPath
} from "./platform-knowledge-lib.mjs";

test("stripHtml removes tags and decodes common entities", () => {
  assert.equal(stripHtml("<p>Hello &amp; <strong>World</strong></p>"), "Hello & World");
});

test("validateAwsCliRequest allows read-only operations", () => {
  const config = applyConfigDefaults({
    aws: {
      allowedServices: ["cloudformation"]
    }
  });

  const result = validateAwsCliRequest(config, {
    service: "cloudformation",
    operation: "describe-stacks",
    args: ["--stack-name", "example"]
  });

  assert.equal(result.service, "cloudformation");
  assert.equal(result.operation, "describe-stacks");
});

test("validateAwsCliRequest blocks write operations and blocked services", () => {
  const config = applyConfigDefaults({
    aws: {
      allowedServices: ["iam", "cloudformation"]
    }
  });

  assert.throws(() => {
    validateAwsCliRequest(config, {
      service: "iam",
      operation: "create-role",
      args: []
    });
  }, /not read-only/);

  assert.throws(() => {
    validateAwsCliRequest(config, {
      service: "ssm",
      operation: "get-parameter",
      args: []
    });
  }, /blocked/);
});

test("validateCloudabilityPath enforces allowlisted paths", () => {
  const config = applyConfigDefaults({
    cloudability: {
      allowedPaths: ["/v3/views"]
    }
  });

  assert.doesNotThrow(() => validateCloudabilityPath(config, "/v3/views"));
  assert.throws(() => validateCloudabilityPath(config, "/v3/reporting/reports/cost"), /allowlist/);
});

test("legacy internalDocs config is normalized into enghub", () => {
  const config = applyConfigDefaults({
    internalDocs: {
      baseUrl: "https://enghub.example.com",
      searchUrl: "https://enghub.example.com/api/search"
    }
  });

  assert.equal(config.enghub.baseUrl, "https://enghub.example.com");
  assert.equal(config.enghub.searchUrl, "https://enghub.example.com/api/search");

  const summary = getConfiguredSourceSummary({
    config,
    sourcePath: null,
    configuredPath: "config/knowledge-sources.json"
  });

  assert.equal(summary.sources.enghub.enabled, true);
  assert.equal(summary.sources.enghub.baseUrl, "https://enghub.example.com");
});
