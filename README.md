# GitHub Copilot Cloud Agent Suite for AWS CDK TypeScript

This repository contains an implementation-ready operating model for a suite of GitHub Copilot custom agents tailored to infrastructure development on AWS using AWS CDK with TypeScript.

## What is included

- A full enterprise operating model for the agent suite.
- A final, simplified persona set focused on design, build, review, verification, security, cost, observability, and reliability.
- Copy-paste prompt packs for each persona.
- Guidance on retrieval strategy, guardrails, invocation patterns, and rollout.

## Persona set

### Phase 1 essentials
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

### Phase 2 optional
- cloud-operations
- cloud-sre
- resilience-engineer
- migration-advisor
- documentation-assistant

## Repository layout

- `docs/copilot-agent-operating-model.md` — full design document.
- `copilot-agents/manifest.md` — quick index of personas, ownership model, and invocation guidance.
- `copilot-agents/*.md` — per-persona prompt packs and operating instructions.

## Intended usage

These agents are intended to operate as **parallel specialist copilots invoked on demand**. They are not designed as a rigid workflow pipeline.
