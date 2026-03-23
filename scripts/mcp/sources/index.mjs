import { registerAwsCliTools } from "./aws-cli.mjs";
import { registerCloudabilityTools } from "./cloudability.mjs";
import { registerConfluenceTools } from "./confluence.mjs";
import { registerEngHubTools } from "./enghub.mjs";
import { registerGitLabTools } from "./gitlab.mjs";

export function registerAllSourceTools(server, context) {
  registerEngHubTools(server, context);
  registerGitLabTools(server, context);
  registerConfluenceTools(server, context);
  registerAwsCliTools(server, context);
  registerCloudabilityTools(server, context);
}
