# Enterprise Design for GitHub Copilot Custom Agents for AWS CDK TypeScript on AWS

## 1. Executive Summary

This design defines an enterprise-ready suite of parallel specialist GitHub Copilot custom agents for infrastructure development on AWS using AWS CDK with TypeScript.

The operating model is based on on-demand specialist invocation rather than a mandatory linear workflow. Developers, architects, reviewers, testers, platform engineers, SREs, and FinOps practitioners invoke the most appropriate agent for the task at hand.

### Objectives
- Improve AWS CDK implementation quality.
- Accelerate delivery without weakening standards.
- Reduce cloud security, reliability, and cost risk.
- Increase reuse of approved patterns and constructs.
- Improve observability, testability, and maintainability.

### Operating context
- Primary framework: AWS CDK
- Language: TypeScript
- Cloud: AWS
- Invocation model: Parallel specialist copilots invoked independently on demand
- Knowledge model: Hybrid retrieval
- Knowledge sources:
  - Confluence
  - Internal documentation site
  - GitLab repositories
  - AWS documentation
  - Cloudability

### Final design choice
This model intentionally excludes the following personas:
- `release-engineer`
- `policy-validator`
- `cloud-compliance`
- `platform-governance`

Their concerns are redistributed across:
- `cloud-verifier`
- `cloud-reviewer`
- `cloud-security`
- `cloud-architect`
- `construct-creator`
- `identity-and-access-advisor`
- `cloud-operations`

That creates a leaner model while retaining enterprise controls through prompt design, source precedence, and universal guardrails.

## 2. Design Principles

### 2.1 Core principles
1. **Specialists over generalists** — each agent has a bounded mission and explicit handoff rules.
2. **Internal standards first** — approved internal standards and golden paths outrank generic cloud advice.
3. **Reuse before invention** — GitLab code and approved constructs should be checked before proposing new patterns.
4. **Evidence-backed guidance only** — recommendations must be grounded in internal docs, existing code, AWS docs, or Cloudability.
5. **CDK-native reasoning** — agents must reason in terms of stacks, constructs, props, bootstrap, synth/deploy, and account boundaries.
6. **Confidence is mandatory** — every answer must use High / Medium / Low confidence labels.
7. **Tradeoffs must be explicit** — especially for security, reliability, operability, and cost.
8. **Governance is embedded** — control personas are reduced, so guardrails must be embedded into the remaining agents.
9. **Parallel composition** — agents can be used independently and outputs can be referenced without tight coupling.
10. **Humans approve exceptions** — agents can identify exceptions, but never approve them.

## 3. Agent Operating Model

### 3.1 Model summary
| Dimension | Model |
|---|---|
| Invocation | On-demand independent specialist invocation |
| Coordination | Loose coupling via common output schema |
| Knowledge access | Hybrid retrieval across internal and external sources |
| Output mode | Recommendations, critiques, verifications, and diagnostics |
| Governance | Embedded prompt guardrails and source precedence |
| Escalation | Human escalation for exceptions, ambiguity, and risk acceptance |

### 3.2 Agent classes

#### Advisory agents
- cloud-architect
- cloud-developer
- construct-creator
- cloud-debugger
- cloud-finops
- cloud-operations
- cloud-sre
- migration-advisor
- documentation-assistant
- observability-engineer
- identity-and-access-advisor
- resilience-engineer
- cloud-security

#### Review-oriented agents
- cloud-reviewer
- cloud-tester

#### Validation-oriented agent
- cloud-verifier

### 3.3 Standard agent output contract
Every agent should answer in this shape:
1. Intent understood
2. Recommendation or assessment
3. Rationale
4. Evidence used
5. Risks or tradeoffs
6. Next actions
7. Confidence
8. Escalation needed

### 3.4 Severity model
| Severity | Meaning |
|---|---|
| Info | Improvement opportunity |
| Warning | Important concern, not necessarily blocking |
| High | Significant risk or likely rework |
| Critical | Must be addressed before production or merge, depending on context |

## 4. Full Persona Catalog

| Persona | Category | Core function |
|---|---|---|
| cloud-architect | Design & Build | Architecture design and tradeoff analysis |
| cloud-developer | Design & Build | CDK TypeScript implementation guidance |
| cloud-reviewer | Review & Verification | Rigorous PR-style review |
| cloud-tester | Review & Verification | Infra testing strategy and test guidance |
| cloud-verifier | Review & Verification | Standards, readiness, and conformance verification |
| cloud-debugger | Operations & Reliability | Troubleshooting synth/deploy/runtime infra issues |
| cloud-finops | Cost & Optimization | Cost analysis and optimization |
| construct-creator | Construct Engineering | Reusable construct design and API quality |
| cloud-operations | Operations & Reliability | Day-2 operations and supportability |
| cloud-sre | Operations & Reliability | Reliability, SLO, and production risk analysis |
| documentation-assistant | Design & Build | Documentation, READMEs, runbooks, and examples |
| migration-advisor | Design & Build | Migration planning into AWS CDK |
| observability-engineer | Operations & Reliability | Logs, metrics, traces, alarms, and dashboards |
| identity-and-access-advisor | Security | IAM, trust, boundaries, and access patterns |
| resilience-engineer | Operations & Reliability | Failure modes, recovery, backups, and resilience |
| cloud-security | Security | Technical security posture and hardening |

## 5. Persona-by-Persona Specification

Each persona is defined in `copilot-agents/` as an implementation-oriented prompt pack. The packs contain:
- mission
- primary users
- when to invoke and when not to invoke
- scope of responsibility
- AWS CDK TypeScript focus areas
- knowledge routing logic
- system prompt
- developer prompt
- invocation examples
- guardrails
- escalation rules

## 6. Knowledge Source Mapping by Persona

| Persona | Check first | Authoritative | Advisory |
|---|---|---|---|
| cloud-architect | Confluence, Internal docs | Internal standards and ADRs | AWS docs, GitLab |
| cloud-developer | GitLab, Internal docs | Approved repo patterns | AWS docs |
| cloud-reviewer | GitLab, Internal docs | Internal standards + repo conventions | AWS docs, Cloudability |
| cloud-tester | GitLab tests | Internal testing patterns | AWS docs |
| cloud-verifier | Internal docs, Confluence | Internal standards | AWS docs, GitLab, Cloudability |
| cloud-debugger | Logs/errors, AWS docs | Runtime evidence + AWS docs | GitLab, Internal docs |
| cloud-finops | Cloudability, Internal docs | Cloudability + accountability rules | AWS docs |
| construct-creator | GitLab construct libraries, Internal docs | Approved reusable code | AWS docs, Confluence |
| cloud-operations | Internal docs | Operating standards | AWS docs, GitLab |
| cloud-sre | Reliability docs, Confluence | Reliability expectations | AWS docs |
| documentation-assistant | Code/docs/READMEs | Current code + doc standards | AWS docs |
| migration-advisor | Migration playbooks, GitLab precedent | Migration guidance | AWS docs |
| observability-engineer | Observability docs | Telemetry standards | AWS docs |
| identity-and-access-advisor | IAM standards | IAM guidance + AWS IAM docs | GitLab |
| resilience-engineer | DR/resilience docs | Recovery requirements | AWS docs |
| cloud-security | Security standards | Security guidance + AWS docs | GitLab, Confluence |

### Common conflict rules
1. Internal mandatory standards outrank advisory guidance.
2. AWS docs outrank assumptions for factual service behavior.
3. GitLab approved implementations outrank speculative new patterns.
4. Cloudability informs cost posture but does not automatically override security or reliability requirements.
5. Conflicts must be surfaced explicitly.

## 7. Invocation Patterns inside GitHub Copilot

### 7.1 Intent-based agent selection
| Need | Best agent |
|---|---|
| Design the architecture | cloud-architect |
| Write CDK code | cloud-developer |
| Build a reusable abstraction | construct-creator |
| Review a PR | cloud-reviewer |
| Verify standards and readiness | cloud-verifier |
| Improve tests | cloud-tester |
| Debug deployment or synth issues | cloud-debugger |
| Review cost | cloud-finops |
| Review security posture | cloud-security |
| Review IAM and trust | identity-and-access-advisor |
| Add observability | observability-engineer |
| Evaluate reliability | cloud-sre |
| Evaluate recovery and resilience | resilience-engineer |
| Evaluate supportability | cloud-operations |
| Plan migration | migration-advisor |
| Write docs and runbooks | documentation-assistant |

### 7.2 Parallel use examples
- A team designing a new platform may invoke `cloud-architect`, `cloud-security`, `cloud-finops`, and `cloud-verifier` independently.
- A team building a shared library may invoke `construct-creator`, `cloud-reviewer`, `cloud-tester`, and `documentation-assistant` independently.
- A team troubleshooting deployment issues may invoke `cloud-debugger`, `identity-and-access-advisor`, and `cloud-operations` independently.

## 8. Guardrails and Governance

### 8.1 Universal guardrails
Every persona should enforce:
- no invented internal standards
- explicit confidence labels
- explicit source precedence
- secure-by-default reasoning
- least privilege as a baseline
- major cost drivers surfaced when relevant
- observability and change safety surfaced for production workloads
- reuse before invention
- no claims of formal compliance or release approval

### 8.2 Governance model
- Prompt templates are centrally owned and versioned.
- Retrieval is constrained to approved source systems.
- Humans approve exceptions and accept risk.
- Prompt reviews should occur monthly during rollout, then quarterly.

## 9. Example Workflows

### Workflow: New reusable service pattern
1. `cloud-architect` defines the architecture.
2. `construct-creator` decides whether the pattern warrants a new reusable construct.
3. `cloud-developer` implements the CDK TypeScript code.
4. `cloud-tester` defines high-value tests.
5. `cloud-reviewer` critiques the PR.
6. `cloud-verifier` checks standards and readiness.

### Workflow: Cost optimization review
1. `cloud-finops` identifies major cost drivers and waste.
2. `cloud-architect` evaluates lower-cost alternatives.
3. `cloud-security` checks for security regressions caused by cost changes.
4. `cloud-verifier` checks that the resulting design still aligns to standards.

### Workflow: Failed deployment
1. `cloud-debugger` isolates the likely root cause.
2. `identity-and-access-advisor` reviews IAM or trust issues if implicated.
3. `cloud-operations` assesses rollback, recovery, or support implications.

## 10. Risk Register

| Risk | Description | Impact | Mitigation |
|---|---|---|---|
| Reduced explicit governance | Fewer dedicated control personas may weaken policy consistency | Medium | Strengthen prompts for cloud-verifier, cloud-reviewer, and cloud-security |
| Standards drift | Teams may invent bespoke patterns | High | Make cloud-architect and construct-creator strongly reuse-first |
| Verification overload | cloud-verifier may become too broad | Medium | Keep a strict scorecard and handoff model |
| Compliance ambiguity | Teams may confuse security review with compliance approval | High | Require security and verifier prompts to avoid compliance certification claims |
| Construct sprawl | Too many abstractions get created | Medium | Use construct adoption criteria and reuse-first rules |
| Retrieval quality issues | Weak retrieval leads to poor recommendations | High | Use source ranking, freshness rules, and confidence labels |
| Hallucinated standards | Agents invent rules | High | Enforce no-fabrication rule and confidence downgrades |

## 11. Recommended Rollout Plan

### Phase 0: Foundation
Deliver:
- source connectors
- source precedence rules
- prompt versioning model
- common output schema
- confidence model
- persona ownership model

### Phase 1: Core high-value set
- cloud-architect
- cloud-developer
- cloud-reviewer
- cloud-tester
- cloud-verifier
- cloud-debugger
- cloud-finops
- construct-creator
- cloud-security
- identity-and-access-advisor
- observability-engineer

### Phase 2: Maturity expansion
- cloud-operations
- cloud-sre
- resilience-engineer
- migration-advisor
- documentation-assistant

## 12. Success Metrics / KPIs

### Adoption
- % of CDK PRs using one or more specialist agents
- invocation volume by persona
- repeat usage rate

### Quality
- reduction in post-merge infra defects
- reduction in deployment failures caused by config or stack issues
- increase in construct and stack test coverage

### Consistency
- % of changes reusing approved patterns or constructs
- reduction in duplicate constructs
- tag coverage improvement

### Security and reliability
- reduction in wildcard IAM usage
- increase in observability coverage
- reduction in public exposure misconfigurations
- MTTR improvement for CDK deployment failures

### Cost
- savings opportunities identified by `cloud-finops`
- reduction in idle non-prod spend
- cost allocation tag coverage improvement

## 13. Recommended Final Persona Set for AWS CDK TypeScript on AWS

### Design & Build
- cloud-architect — Phase 1 Essential
- cloud-developer — Phase 1 Essential
- migration-advisor — Phase 2 Optional
- documentation-assistant — Phase 2 Optional

### Review & Verification
- cloud-reviewer — Phase 1 Essential
- cloud-tester — Phase 1 Essential
- cloud-verifier — Phase 1 Essential

### Security
- cloud-security — Phase 1 Essential
- identity-and-access-advisor — Phase 1 Essential

### Operations & Reliability
- cloud-debugger — Phase 1 Essential
- cloud-operations — Phase 2 Optional
- cloud-sre — Phase 2 Optional
- observability-engineer — Phase 1 Essential
- resilience-engineer — Phase 2 Optional

### Cost & Optimization
- cloud-finops — Phase 1 Essential

### Reusable Abstractions / Construct Engineering
- construct-creator — Phase 1 Essential
