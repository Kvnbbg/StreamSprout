# Secrets Management Blueprint

## Objectives
- Eliminate hardcoded credentials from source control and runtime defaults.
- Provide auditable, automated rotation for database, Bedrock, and third-party API secrets.
- Supply a consistent developer experience across Node, Java, and Python runtimes.

## Recommended Platform: HashiCorp Vault (Cloud Hosted)

### Architecture
1. **Authentication**
   - CI/CD workloads authenticate via GitHub OIDC federated role mapped to a Vault Kubernetes auth method (or GitHub Actions auth method).
   - Developers authenticate via SSO-backed Vault UI/CLI roles.
2. **Secret Engines**
   - **Database Engine:** Manage PostgreSQL credentials (`players` database) with dynamic usernames per service. Configure max TTL 1h, rotation 15m.
   - **AWS Secrets Engine:** Broker temporary credentials for Amazon Bedrock invocations.
   - **KV v2 Engine:** Store application feature flags, API keys for external services, and encryption keys for stored prompts.
3. **Transit Encryption**
   - Use the Transit engine to sign Bedrock payloads and encrypt sensitive chat transcripts before persistence.

### Delivery Plan
1. Provision a Vault cluster (HCP Vault or self-hosted) with HA enabled.
2. Create namespaces per environment (`dev`, `staging`, `prod`) and define policies for Node API, Spring Boot service, and analytics tooling.
3. Instrument services:
   - Update Node server to read configuration from Vault via the official client or an Envconsul sidecar; remove fallback credentials from code.
   - Configure Spring Boot with `spring-cloud-vault-config` to auto-refresh secrets.
   - Leverage `hvac` in Python utilities for ephemeral secret retrieval.
4. Integrate rotation jobs using Vault's built-in rotation or Terraform Cloud workflows.
5. Audit usage with Vault's audit devices, exporting logs to the centralized observability stack.

### Migration Checklist
- [ ] Inventory all secrets currently stored in `.env`, AWS Parameter Store, or local configs.
- [ ] Define access matrices for engineering teams and service accounts.
- [ ] Script migration with Terraform modules and GitOps repositories.
- [ ] Update runbooks to include break-glass procedures and rotation verification steps.

Executing this blueprint closes the configuration gap identified in the assessment and aligns with the DevSecOps layer of the modernization doctrine.
