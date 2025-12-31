# Top 20 Developer Mistakes Mapped to OWASP (2021 & 2025)

This checklist reframes the original “Top 20 developer mistakes” into an actionable, black-box pentest model. It anchors each mistake to the OWASP Top 10:2021 categories and the latest OWASP Top 10:2025 taxonomy, highlighting category shifts (notably supply chain and exceptional-condition handling).

## OWASP Top 10 Mapping Reference

### OWASP Top 10:2021 (legacy alignment)

- **A01 Broken Access Control**
- **A02 Cryptographic Failures**
- **A03 Injection**
- **A04 Insecure Design**
- **A05 Security Misconfiguration**
- **A06 Vulnerable and Outdated Components**
- **A07 Identification & Authentication Failures**
- **A08 Software & Data Integrity Failures**
- **A09 Security Logging & Monitoring Failures**
- **A10 Server-Side Request Forgery (SSRF)**

### OWASP Top 10:2025 (current taxonomy)

- **A01 Broken Access Control**
- **A02 Security Misconfiguration**
- **A03 Software Supply Chain Failures**
- **A04 Cryptographic Failures**
- **A05 Injection**
- **A06 Insecure Design**
- **A07 Authentication Failures**
- **A08 Software or Data Integrity Failures**
- **A09 Security Logging & Alerting Failures**
- **A10 Mishandling of Exceptional Conditions**

## Top 20 Mistakes as a Pentest Checklist

Each item below includes a pentest signal and OWASP mappings. Where 2025 renames or shifts a category, the 2025 term is explicitly called out.

1) **Permitting invalid data into the database**
   - **Pentest signal:** Missing server-side validation, inconsistent states, edge-case failures.
   - **Maps to:** Injection (2021 A03 / 2025 A05), Insecure Design (2021 A04 / 2025 A06), Security Misconfiguration (2021 A05 / 2025 A02).

2) **Focusing on the system as a whole (ignoring trust boundaries)**
   - **Pentest signal:** Authorization assumed elsewhere, missing checks at object/action level, service-to-service trust.
   - **Maps to:** Broken Access Control (2021 A01 / 2025 A01), Insecure Design (2021 A04 / 2025 A06).

3) **Personally developed security methods (homegrown crypto/auth)**
   - **Pentest signal:** Bespoke token formats, nonstandard signing, ad-hoc password hashing.
   - **Maps to:** Cryptographic Failures (2021 A02 / 2025 A04), Authentication Failures (2021 A07 / 2025 A07).

4) **Treating security as the last step**
   - **Pentest signal:** Systemic issues across modules, repeated insecure patterns.
   - **Maps to:** Insecure Design (2021 A04 / 2025 A06).

5) **Plain-text password storage**
   - **Pentest signal:** Breach impact becomes catastrophic; password reuse cascade.
   - **Maps to:** Cryptographic Failures (2021 A02 / 2025 A04), Authentication Failures (2021 A07 / 2025 A07).

6) **Weak passwords**
   - **Pentest signal:** Account takeover via credential stuffing/password spraying; weak reset flows.
   - **Maps to:** Authentication Failures (2021 A07 / 2025 A07).

7) **Storing unencrypted data in the database**
   - **Pentest signal:** PII/secrets visible at rest; backups or exports leak.
   - **Maps to:** Cryptographic Failures (2021 A02 / 2025 A04).

8) **Depending excessively on the client side**
   - **Pentest signal:** “Disabled button” security; client-side role flags; hidden pricing fields.
   - **Maps to:** Broken Access Control (2021 A01 / 2025 A01), Insecure Design (2021 A04 / 2025 A06).

9) **Being too optimistic (“users won’t do that”)**
   - **Pentest signal:** Missing abuse-case design; no rate limits; predictable identifiers.
   - **Maps to:** Insecure Design (2021 A04 / 2025 A06), Authentication Failures (2021 A07 / 2025 A07).

10) **Permitting variables via the URL path name**
   - **Pentest signal:** IDOR/BOLA patterns; object IDs swapped; path-based authorization missing.
   - **Maps to:** Broken Access Control (2021 A01 / 2025 A01).

11) **Trusting third-party code**
   - **Pentest signal:** Vulnerable dependencies; risky plugins; weak update governance.
   - **Maps to:** Vulnerable and Outdated Components (2021 A06), Software Supply Chain Failures (2025 A03).

12) **Hard-coding backdoor accounts**
   - **Pentest signal:** Undocumented privileged users; default creds; hidden admin routes.
   - **Maps to:** Authentication Failures (2021 A07 / 2025 A07), Broken Access Control (2021 A01 / 2025 A01).

13) **Unverified injections**
   - **Pentest signal:** Injection sinks in query/filters/search; data-dependent behavior.
   - **Maps to:** Injection (2021 A03 / 2025 A05).

14) **Remote file inclusions (RFI)**
   - **Pentest signal:** Dynamic include of remote resources; template/include parameters.
   - **Maps to:** Injection (2021 A03 / 2025 A05), Security Misconfiguration (2021 A05 / 2025 A02).

15) **Insecure data handling (logs, exports, debug dumps)**
   - **Pentest signal:** Secrets in logs; verbose errors; PII in URLs; unsafe tenant sharing.
   - **Maps to:** Security Misconfiguration (2021 A05 / 2025 A02), Security Logging & Monitoring/Alerting Failures (2021 A09 / 2025 A09), Broken Access Control (2021 A01 / 2025 A01).

16) **Failing to encrypt data properly**
   - **Pentest signal:** Weak modes, poor key management, broken at-rest protection.
   - **Maps to:** Cryptographic Failures (2021 A02 / 2025 A04).

17) **Not using a secure cryptographic system**
   - **Pentest signal:** Nonstandard primitives, poor entropy, weak key rotation.
   - **Maps to:** Cryptographic Failures (2021 A02 / 2025 A04).

18) **Ignoring layer 8 (people/process)**
   - **Pentest signal:** Weak operational controls, poor secrets hygiene, risky admin workflows.
   - **Maps to:** Security Misconfiguration (2021 A05 / 2025 A02), Authentication Failures (2021 A07 / 2025 A07), Security Logging & Monitoring/Alerting Failures (2021 A09 / 2025 A09).

19) **Failing to review user actions (logging/monitoring gaps)**
   - **Pentest signal:** No audit trails; no alerts on sensitive operations; low traceability.
   - **Maps to:** Security Logging & Monitoring Failures (2021 A09), Security Logging & Alerting Failures (2025 A09).

20) **WAF misconfigurations**
   - **Pentest signal:** Bypassable rules; breaks APIs; inconsistent enforcement.
   - **Maps to:** Security Misconfiguration (2021 A05 / 2025 A02), Mishandling of Exceptional Conditions (2025 A10) when failures are poorly handled.

## Operationalizing the Checklist (Black-Box Workflow)

1. **Surface mapping:** Identify auth boundaries, roles, tenant model, and high-value actions.
2. **Abuse-case testing:** For each action, test same user vs. different user vs. no auth vs. lower role.
3. **Input handling:** Test each input class (path, query, body, headers, file uploads, template selectors) for injection, file inclusion, SSRF-like fetches, deserialization-like behavior.
4. **Observability:** Confirm logging, alerting, and attribution for sensitive operations (user/action/object/time).

## Reporting Guidance

- **Call out 2025-specific categories** when supply chain risk or mishandled exceptions are observed.
- **Avoid observations without impact**—tie findings to real abuse paths, data exposure, or policy violations.
- **Capture evidence** for each finding (request/response, role/tenant context, timestamps).
