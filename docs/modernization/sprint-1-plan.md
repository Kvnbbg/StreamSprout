# Project Velocity — Sprint 1 Execution Plan

**Sprint window:** 2 weeks (10 working days)

**Sprint theme:** Establish the modernization "ground state" by delivering the first slice of the Expansion Blueprint across features, performance, UX, and deployment while activating the quantum feedback loop for data-driven iteration.

## Sprint Goal
- Ship production-ready scaffolding that enables probabilistic roster intelligence while tightening code health and deployment hygiene.
- Lay the telemetry foundation so that every change in subsequent sprints produces measurable signals.
- Reduce foundational risk by institutionalizing CI, access control, and infrastructure as described in the modernization briefing.

## Quantum Backlog Overview
| ID | Blueprint Track | Summary | Primary Components | Definition of Done | Expected DORA / KPI Impact |
|----|-----------------|---------|--------------------|--------------------|----------------------------|
| FEAT-101 | Features | Introduce prompt-template registry & feature flag for contextual bandit rollout. | `server/index.js`, `valor_db/*`, new config in `docs/modernization/artifacts/logic/` | - Template registry stored in Postgres with migration script.<br>- `/create-team` consults registry + flag before Bedrock call.【F:server/index.js†L120-L203】<br>- Unit test covering fallback logic (`npm test`).<br>- ADR describing feature flag strategy appended to governance folder. | Improves Change Failure Rate via controlled rollout; establishes traceability for new capability. |
| OPT-101 | Optimization | Cache /search-players lookup path with Redis + Bloom-filter guardrails per probabilistic strategy. | `server/index.js`, new `redis.js`, infra docs | - Redis connection wrapper with env-driven config.<br>- `/search-players` consults Bloom filter before SQL.【F:server/index.js†L64-L118】<br>- Load tests via `npm run perf` (new script) hitting p95 < 250 ms.<br>- Grafana panel stub documenting latency improvement baseline. | Decreases MTTR through faster triage dashboards; lifts Service Latency KPI. |
| UI-101 | UI/UX | Modularize `public/index.html` to surface roster insights & flag state. | `public/index.html`, `public/scripts/*.js` | - Extract reusable components (prompt selector, insights tray).<br>- Display flag/bandit status banner + loading skeletons.<br>- Add Cypress smoke test (GitHub Actions) verifying UI states.<br>- Update `README.md` usage instructions. | Higher Deployment Frequency by automating UI regression coverage; increased user NPS via insights exposure. |
| OBS-101 | Observability | Activate OTel tracing & structured logging baseline. | `server/index.js`, `TensorFlowLlmApplication.java`, `ai.py`, `.env.example` | - Integrate `pino` w/ correlation IDs in Express.【F:server/index.js†L46-L117】<br>- Add OpenTelemetry SDK to Node & Java entry points with exporter config stubs.<br>- Emit initial custom metrics (LLM latency, DB hits).<br>- Document dashboard wiring in `docs/modernization/artifacts/observability.md`. | Enables MTTR measurement and supports Change Failure Rate alerts. |
| SEC-101 | Security / Governance | Implement CODEOWNERS & branch protection guardrails. | `.github/CODEOWNERS`, `.github/workflows/*`, docs | - Materialize CODEOWNERS from artifact with team mapping.【F:docs/modernization/artifacts/security/CODEOWNERS†L1-L22】<br>- Apply branch protection policy via documented GitHub settings checklist.<br>- Automate dependency review + CodeQL gating by wiring CI workflow from artifacts.<br>- Secrets sourced from Vault placeholders (no hardcoded fallbacks). | Increases Deployment Frequency safely by enforcing reviews; reduces Change Failure Rate via automated scans. |
| DEP-101 | Deployment | Stand up container build & preview release path. | `Dockerfile` (new), `.github/workflows/ci.yml`, docs | - Author multi-stage Dockerfile for Express API with healthcheck.<br>- Add CI pipeline from `artifacts/ci/github-actions.yml` tailored to repo structure.<br>- Push preview deploy stub (Render/Proton) with environment variable contract documented.<br>- Smoke test container locally (`docker run`) and via CI. | Shortens Lead Time for Changes; supports release cadence by enabling previews. |

## Definition of Done (Shared Gates)
- **Quality:** All services pass lint/unit/static analysis (`npm test`, `mvn verify`, `ruff check`). Security scans (CodeQL, OWASP Dependency Check, npm audit) are green or issues triaged.
- **Documentation:** README, runbooks, and modernization artifacts updated to reflect new capabilities. ADR-002 captures the prompt registry decision.
- **Observability:** New code paths emit spans, metrics, and structured logs traceable in Grafana/Tempo mock dashboards.
- **Feature Flags:** Every new capability is gated via `APP_FEATURES_*` environment toggles with defaults disabled in production configs.

## Sprint Rituals & Quantum Feedback Loop
- **Daily telemetry review:** Inspect OpenTelemetry traces and Prometheus metrics each stand-up; compare to baseline snapshots captured on Day 0.
- **Mid-sprint observability checkpoint (Day 5):** Validate that new metrics (`llm_latency_ms`, `player_search_cache_hit_ratio`) are flowing; adjust instrumentation if gaps exist.
- **Change review board:** Pair-review every PR referencing the CODEOWNERS map to ensure security gating and artifact alignment.
- **Retro data pack:** Export DORA metrics (deployment frequency, lead time, MTTR, change failure rate) using scripts outlined in `docs/modernization/artifacts/governance/dora-metrics-plan.md`; include CodeQL trendline.

## Risk Mitigation & Contingencies
- **Redis introduction risk:** If Redis provisioning stalls, fall back to in-memory cache with identical interface; keep telemetry toggled to measure hit ratio once Redis arrives.
- **Observability SDK overhead:** Guard instrumentation with sampling configuration to prevent latency regression; feature flag spans for high-traffic endpoints until profiling complete.
- **Vault integration lead time:** Use AWS Parameter Store as interim secret source with migration checklist tracked in `secrets-management.md` to unblock CI.

## Sprint Readiness Checklist
- [ ] Product owner sign-off on backlog priorities and acceptance criteria.
- [ ] Environment parity verified (dev/stage/prod env vars align with new flags, Redis, telemetry exporters).
- [ ] CI secrets configured (Vault/Parameter Store credentials, Docker registry tokens, CodeQL).
- [ ] Team briefed on new testing commands (`npm run perf`, Cypress, Docker smoke tests).

Upon approval, the team can transition into execution and invoke the "EXECUTE SPRINT" directive to begin simulated delivery and feedback processing.
