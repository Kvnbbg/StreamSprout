# Branch Protection Policy

To uphold code integrity and enable rapid, reliable delivery, enforce the following GitHub branch protection rules on `main` and all `release/*` branches:

1. **Require pull request reviews**
   - Minimum two approving reviews, with at least one from `@streamsprout-security` or the relevant CODEOWNER team.
   - Dismiss stale approvals when new commits are pushed.

2. **Status checks must pass before merging**
   - Mandatory checks: `Node API Quality`, `Spring Boot Build Verification`, `Python Toolchain Hygiene`, `Security & Supply-Chain`, and `Build & Push API Container` jobs from the CI workflow.
   - Enforce branch protection to require status checks to be up to date and disallow bypass.

3. **Require signed commits and linear history**
   - Enforce GPG or SSH signed commits for all contributors.
   - Enable "Require linear history" to prevent merge commits and simplify audit trails.

4. **Restrict who can push**
   - Only automation service accounts and release engineers may push directly to protected branches; all other contributions must flow through pull requests.

5. **Secret scanning & deployment protection**
   - Enable GitHub Advanced Security secret scanning alerts and block merges when high-severity findings exist.
   - Wire branch protections to environment protection rules so production deployments require manual approval from the on-call SRE.

6. **Automated issue linking**
   - Require pull requests to reference a tracked work item (e.g., Jira ID) for traceability.

These guardrails align the repository with the Senior Developer's Modernization Framework by embedding security, compliance, and governance into daily delivery workflows.
