# DORA Metrics Implementation Plan

## Goals
Track the four key DORA metrics to quantify modernization progress and guide investments.

## Metric Capture Strategy
1. **Deployment Frequency**
   - Leverage GitHub Actions workflow run data filtered for `main` and `release/*` deployments.
   - Automate weekly aggregation via a scheduled workflow invoking a Python script that queries the GitHub GraphQL API and stores metrics in BigQuery.

2. **Lead Time for Changes**
   - Measure time from first commit on a branch to successful deployment job completion.
   - Use GitHub webhooks to send PR open/merge events into an AWS Lambda that writes time deltas to a metrics store.

3. **Change Failure Rate**
   - Tag production incidents in incident management (PagerDuty/Jira) with affected deployment IDs.
   - Correlate with deployment runs to calculate failure percentages automatically.

4. **Mean Time to Restore (MTTR)**
   - Capture incident start/resolution timestamps in PagerDuty and sync to analytics warehouse.
   - Introduce runbook automation to mark resolution deployments, enabling MTTR calculation per service.

## Reporting & Governance
- Build Looker or Grafana dashboards reading from BigQuery to visualize weekly trends.
- Review metrics in the engineering leadership sync and quarterly business reviews.
- Tie OKRs to improving at least one metric per quarter, starting with Deployment Frequency and MTTR.

## Implementation Steps
1. Publish a GitHub Actions workflow (`.github/workflows/dora-metrics.yml`) to compute metrics nightly and push results to BigQuery.
2. Create a `metrics/` Terraform module that provisions datasets, service accounts, and IAM roles for data collection.
3. Document standard operating procedures for incident tagging, deployment approvals, and dashboard interpretation.
4. Iterate with the SRE team to automate alerts when metrics regress beyond agreed thresholds.

This plan institutionalizes measurement, enabling data-driven decisions and validating the effectiveness of modernization investments.
