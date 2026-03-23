# AWS CDK TypeScript Agent Catalog

This is the short-form routing guide for the custom agents in [`.github/agents`](../.github/agents).

## Quick routing

| Question type | Best agent | Also consider | Knowledge bases usually used |
| --- | --- | --- | --- |
| How should this workload be designed? | `Cloud Architect` | `Cloud FinOps`, `Identity and Access Advisor`, `Resilience Engineer` | EngHub, Confluence, GitLab, AWS CLI |
| Please implement this CDK change | `Cloud Developer` | `Construct Creator`, `Cloud Tester` | GitLab, EngHub, Confluence, AWS CLI |
| Should this become a shared construct? | `Construct Creator` | `Cloud Architect`, `Cloud Reviewer` | GitLab, EngHub, Confluence |
| Review this PR for risk and quality | `Cloud Reviewer` | `Cloud Verifier`, `Security and Compliance Advisor` | GitLab, EngHub, Confluence, AWS CLI |
| Do we meet standards and release gates? | `Cloud Verifier` | `Release Engineer`, `Security and Compliance Advisor` | EngHub, Confluence, GitLab, AWS CLI, Cloudability |
| Why is `cdk deploy` failing? | `Cloud Debugger` | `Identity and Access Advisor`, `Release Engineer` | AWS CLI, GitLab, EngHub |
| What does this design cost and how can we reduce it? | `Cloud FinOps` | `Cloud Architect`, `Cloud Verifier` | Cloudability, EngHub, GitLab, AWS CLI |
| Are IAM and trust policies too broad? | `Identity and Access Advisor` | `Security and Compliance Advisor`, `Cloud Reviewer` | EngHub, GitLab, Confluence, AWS CLI |
| Are our alarms and dashboards sufficient? | `Observability Engineer` | `Cloud Operations`, `Cloud SRE` | EngHub, GitLab, Confluence, AWS CLI |
| Is this operationally ready? | `Cloud Operations` | `Observability Engineer`, `Release Engineer` | EngHub, GitLab, Confluence, AWS CLI |
| Is this reliable enough for production? | `Cloud SRE` | `Resilience Engineer`, `Observability Engineer` | EngHub, Confluence, GitLab, AWS CLI |
| How should we deploy and roll this back safely? | `Release Engineer` | `Cloud Verifier`, `Cloud Debugger` | GitLab, EngHub, Confluence, AWS CLI |
| How do we migrate legacy infrastructure into CDK? | `Migration Advisor` | `Cloud Architect`, `Construct Creator` | EngHub, GitLab, Confluence, AWS CLI |
| Can you document this construct or stack? | `Documentation Assistant` | `Construct Creator`, `Cloud Operations` | EngHub, GitLab, Confluence |

## Design notes

- These agents are intentionally specialist and manually invoked.
- They are optimized for AWS CDK with TypeScript on AWS, not generic coding help.
- They assume a repository-level `platform-knowledge` MCP server is configured in GitHub Copilot settings.

## Recommended starting set

- `Cloud Architect`
- `Cloud Developer`
- `Construct Creator`
- `Cloud Reviewer`
- `Cloud Verifier`
- `Cloud Debugger`
- `Cloud FinOps`
- `Identity and Access Advisor`
- `Release Engineer`

## Avoid misrouting

- Do not use `Cloud Developer` for approval or verification decisions.
- Do not use `Cloud Reviewer` when you actually need implementation.
- Do not use `Cloud FinOps` as the final decision-maker on resilience or compliance tradeoffs.
- Do not use `Documentation Assistant` to invent undocumented behavior.
