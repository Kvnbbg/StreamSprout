# StreamSprout Modernization Blueprint (Node + LynxJS)

## A. Executive Summary

### FR
Cette modernisation adopte un noyau de simulation déterministe local, un backend Node.js modulaire et une couche décisionnelle IA intervalle (1.5s), afin de garantir performance mobile, stabilité opérationnelle et conformité produit pour un lancement China-first.

### 中文（简体）
本次现代化改造采用“本地确定性数学模拟 + Node.js模块化后端 + 1.5秒间隔AI决策层”，确保移动端性能、可运维性与中国市场上线可行性。

### EN
The target architecture combines deterministic local game math, modular Node backend services, and interval-based AI decisions (1.5s) to meet mobile performance and China-first rollout constraints.

## B. Current-to-Target Migration Plan (phased)

1. Phase 1: Introduce modular game engine package and API contracts.
2. Phase 2: Add AI gateway reliability controls (validator, retries, breaker, cache fallback).
3. Phase 3: Add localization bundles FR > zh-CN > EN and cultural content packs.
4. Phase 4: Harden security/observability and rollout with canary.

## C. Final Monorepo Folder Structure

```text
server/
  game/
    GameEngine.js
    GameStateStore.js
    EntitySystem.js
    PhysicsEngine.js
    DetectionSystem.js
    BehaviorEngine.js
    AIDecisionGateway.js
    RenderAdapter.js
    Telemetry.js
public/
  i18n/
    fr.json
    zh-CN.json
    en.json
docs/modernization/
  node-lynx-modernization-blueprint.md
```

## D. Backend Design (Node) + API contracts

Express is kept for backward compatibility and low migration risk; strict JSON validation and resilience controls are enforced in new routes.

```json
{
  "POST /v1/ai/decision": {
    "request": {
      "type": "object",
      "required": ["player_state", "nearby_entities_summary", "difficulty", "latency_budget_ms"]
    },
    "response": {
      "type": "object",
      "required": ["speed", "behavior", "color", "risk_posture", "ttl_ms"]
    }
  }
}
```

## E. LynxJS Frontend Design + state/data flow

LynxJS client uses a unidirectional flow: input -> GameStateStore -> GameEngine.tick -> RenderAdapter -> UI modules.

## F. Math Engine Algorithms

- Proximity: `d = sqrt((x2-x1)^2 + (y2-y1)^2)`, detect if `d <= R`.
- Zigzag: `y(t) = y0 + A * sin(ωt + φ)`.
- Orbit: `x(t)=cx + r*cos(θ)`, `y(t)=cy + r*sin(θ)`, `θ+=Δθ`.
- Adaptive speed:
  `v(t)=clamp(vmin, vmax, v0 + α*log(1+t) - β*threat + γ*ally_bonus)`.
- Flocking-lite: weighted separation + alignment + cohesion.

## G. AI Decision Pipeline

```json
{
  "defaults": {
    "poll_interval_ms": 1500,
    "request_timeout_ms": 600,
    "max_retries": 2,
    "backoff_ms": [120, 360],
    "circuit_breaker": {"failure_threshold": 5, "half_open_after_ms": 10000},
    "cache_ttl_ms": 2500,
    "safe_local_policy": {
      "speed": 6.5,
      "behavior": "evade",
      "color": "blue",
      "risk_posture": "safe",
      "ttl_ms": 1500
    }
  }
}
```

## H. China Localization & Cultural Content Pack

Visual motifs: 红灯笼, 祥云纹, 龙纹, 山水/古建筑 accents.
Mechanics: 五行 system (火水木金土).
Events: 春节限定模式, 中秋主题皮肤, 节气 modifiers.
Policy: esports-safe game framing and sensitive-topic avoidance.

## I. Security/Compliance Checklist

- Rate limit defaults: 120 req/min/IP, AI route 20 req/min/session.
- Request validation enforced for all v1 routes.
- Auth boundary: token-based app access.
- Abuse controls: payload cap 64KB and repeated-failure throttle.

## J. Performance & Observability Plan

- Frame-time target: 16.7ms, hard cap 22ms.
- API latency target: p95 < 120ms.
- Mobile memory guidance: < 220MB.
- Metrics: `tick_ms`, `ai_latency_ms`, `ai_fallback_count`, `api_p95_ms`.

## K. Test Strategy

- Unit: formulas and deterministic behavior snapshots.
- Integration: AI gateway retries/breaker/cache fallback.
- Contract: request/response schema checks.
- Load: sustained burst target 800 RPS with p95 under threshold.

## L. Day-1 Implementation Kit

```json
{
  "commands": [
    "npm install",
    "npm test",
    "node --test server/__tests__/game-engine.test.js"
  ],
  "tickets": [
    "Build EntitySystem and Spatial Grid",
    "Implement DetectionSystem formulas",
    "Implement BehaviorEngine zigzag/orbit/adaptive",
    "Add AI Gateway retries, breaker, fallback",
    "Add FR/zh-CN/en localization bundles",
    "Add telemetry counters and request IDs",
    "Add v1 simulation and AI routes",
    "Add schema validators",
    "Add integration tests",
    "Run canary rollout checklist"
  ]
}
```
