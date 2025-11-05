# Senior Architect's Modernization Briefing

## Current State Assessment
### Architectural Overview
- **Express + PostgreSQL service.** The Node.js server exposes player CRUD, search, and team composition endpoints while connecting directly to PostgreSQL using environment-sourced credentials, and proxies Bedrock LLM calls through shared helpers.【F:server/index.js†L1-L203】
- **Static web client.** A jQuery-powered single page provides the chat and team-building interface with extensive inlined styling, pointing requests at the Express API.【F:public/index.html†L1-L120】
- **Experimental AI surfaces.** A Spring Boot TensorFlow skeleton and a Python tool-calling script exist alongside the Node stack, signaling a multi-runtime footprint without integration glue.【F:TensorFlowLlmApplication.java†L1-L103】【F:ai.py†L1-L39】
- **Build metadata.** `package.json` and `POM.xml` define Node and Maven entry points but testing scaffolds are either recursive placeholders or absent, leaving quality checks unimplemented.【F:package.json†L1-L63】【F:POM.xml†L1-L41】

### Architectural Gaps & Risks
- **Configuration & secrets leakage.** The API defaults to placeholder credentials and lacks secret rotation or environment isolation, inviting accidental misuse in shared environments.【F:server/index.js†L22-L29】
- **Security posture.** The Java service globally disables CSRF and limits authentication to basic auth, while the Node API exposes high-value LLM access without rate limits, audit logging, or abuse controls.【F:TensorFlowLlmApplication.java†L23-L70】【F:server/index.js†L83-L159】
- **Testing & automation debt.** The npm `test` script recursively invokes itself and no CI artifacts exist, leaving regressions undetected and DORA metrics unobtainable.【F:package.json†L6-L9】
- **Observability gaps.** Logging relies on `console.log`/`console.error` without correlation IDs or structured logging; no metrics or tracing are emitted from any runtime.【F:server/index.js†L46-L195】
- **Data & model governance.** There is no documented dataset provenance, feature flagging, or evaluation workflow for Bedrock or TensorFlow models, raising reliability and compliance concerns.

## Modernization Roadmap
1. **Stabilize foundations (Weeks 0-2).**
   - Implement the provided CI pipeline and remediate the npm test script to execute real unit tests and linting. Establish branch protection and CODEOWNERS to enforce reviews.
   - Containerize the Express API with multi-env configs, replace hardcoded defaults with Vault-backed secrets, and document environment setup.
2. **Elevate security & observability (Weeks 2-4).**
   - Introduce structured logging (e.g., pino for Node, SLF4J for Spring), centralize to OpenTelemetry collectors, and add request metrics + tracing.
   - Enforce mTLS or OAuth for inter-service calls, add rate limiting + input validation to LLM endpoints, and integrate automated SAST/DAST scans from the pipeline.
3. **Intelligent capability enhancements (Weeks 4-6).**
   - Implement probabilistic ranking for player scouting, a bandit-driven recommendation engine for team prompts, and anomaly detection on player stats ingestion per the logic artifact.
   - Establish model evaluation harnesses, dataset versioning, and ADR-driven change governance.
4. **Operational excellence (Weeks 6+).**
   - Roll out DORA metric tracking dashboard, incident response runbooks, chaos experiments for database + LLM failures, and continuously iterate on dependency + patch management.

## Artifacts Overview
The following modernization assets accompany this briefing:
- **CI/CD:** [`artifacts/ci/github-actions.yml`](artifacts/ci/github-actions.yml)
- **Security:** [`artifacts/security/CODEOWNERS`](artifacts/security/CODEOWNERS), [`artifacts/security/branch-protection.md`](artifacts/security/branch-protection.md), [`artifacts/security/secrets-management.md`](artifacts/security/secrets-management.md)
- **Intelligent Logic:** [`artifacts/logic/probabilistic-strategy.md`](artifacts/logic/probabilistic-strategy.md)
- **Governance:** [`artifacts/governance/ADR-001-adopt-modernization-framework.md`](artifacts/governance/ADR-001-adopt-modernization-framework.md), [`artifacts/governance/dora-metrics-plan.md`](artifacts/governance/dora-metrics-plan.md)

These assets operationalize the Senior Developer's Modernization Framework across modernization, security, probabilistic intelligence, and governance pillars.
