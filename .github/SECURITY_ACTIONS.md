# GitHub Actions Security Guidelines

This document outlines the security practices implemented for GitHub Actions workflows in this repository.

## Least Privilege Permissions

### Default Repository Permissions

All workflows use `permissions: read-all` as the default, granting minimal read access to:

- Repository contents
- Metadata
- Actions and packages (read-only)

### Job-Specific Permissions

Each job only receives additional permissions when explicitly required:

#### Content Write Access

- **Not required** - This repository uses external services for deployments
- All jobs operate with read-only access to repository contents

#### Actions Permissions

- **actions: read** - Required for caching and artifact operations
- **contents: read** - Required for checking out code
- **metadata: read** - Required for accessing repository metadata

### Why Least Privilege Matters

1. **Attack Surface Reduction**
   - Limits potential damage from compromised workflows
   - Prevents accidental modification of repository settings
   - Reduces risk of unauthorized code changes

2. **Supply Chain Security**
   - Minimizes impact of compromised third-party actions
   - Prevents privilege escalation attacks
   - Contains blast radius of security incidents

3. **Compliance Requirements**
   - Follows security best practices for CI/CD pipelines
   - Aligns with zero-trust security principles
   - Supports audit and compliance requirements

## Action Pinning Policy

### Pinning Strategy

All GitHub Actions are pinned to specific SHA commits rather than floating tags:

```yaml
# ❌ Vulnerable to supply chain attacks
uses: actions/checkout@v4

# ✅ Secure, pinned to specific commit
uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
```

### Pinned Actions in Use

| Action                       | Pinned SHA                                 | Version | Purpose            |
| ---------------------------- | ------------------------------------------ | ------- | ------------------ |
| `actions/checkout`           | `692973e3d937129bcbf40652eb9f2f61becf3332` | v4.1.7  | Code checkout      |
| `actions/setup-node`         | `1e60f620b9541d16bece96c5465dc8ee9832be0b` | v4.0.3  | Node.js setup      |
| `actions/cache`              | `0c45773b623bea8c8e75f6c82b208c3cf94ea4f9` | v4.0.2  | Dependency caching |
| `actions/upload-artifact`    | `89ef406dd8d7e03cfd12d9e0a4a378f454709029` | v4.4.0  | Artifact upload    |
| `docker/setup-buildx-action` | `c47758b77c9736f4b2ef4073d4d51994fabfe349` | v3.7.1  | Docker Buildx      |
| `docker/build-push-action`   | `5cd11c3a4ced054e52742c5fd54dca954e0edd85` | v6.7.0  | Docker build       |

### Why Pinning Matters

1. **Supply Chain Protection**
   - Prevents malicious updates to actions
   - Ensures reproducible builds
   - Protects against typosquatting attacks

2. **Version Control**
   - Explicit dependency management
   - Predictable behavior across runs
   - Easier rollback and debugging

3. **Security Auditability**
   - Clear record of exact action versions used
   - Enables security scanning of dependencies
   - Supports compliance and audit requirements

## OIDC Usage Recommendations

### Current State

This repository currently uses basic authentication mechanisms and does not require cloud deployments with OIDC.

### Future Cloud Deployments

When implementing cloud deployments, follow these OIDC best practices:

#### AWS Integration

```yaml
permissions:
  id-token: write # Required for OIDC
  contents: read # Minimal repo access

steps:
  - name: Configure AWS credentials
    uses: aws-actions/configure-aws-credentials@<sha>
    with:
      role-to-assume: arn:aws:iam::ACCOUNT:role/GitHubActionsRole
      role-session-name: GitHubActions
      aws-region: us-east-1
      # No long-lived credentials needed
```

#### Azure Integration

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - name: Azure Login
    uses: azure/login@<sha>
    with:
      client-id: ${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.AZURE_TENANT_ID }}
      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

#### Google Cloud Integration

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - name: Authenticate to Google Cloud
    uses: google-github-actions/auth@<sha>
    with:
      workload_identity_provider: projects/PROJECT/locations/global/workloadIdentityPools/POOL/providers/PROVIDER
      service_account: SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```

### OIDC Security Benefits

1. **No Long-Lived Secrets**
   - Eliminates need for stored credentials
   - Reduces secret sprawl and rotation burden
   - Prevents credential theft and misuse

2. **Short-Lived Tokens**
   - Automatic token expiration
   - Reduced attack window
   - No manual token management

3. **Fine-Grained Access Control**
   - Repository-specific access
   - Branch and tag restrictions
   - Conditional access policies

### Migration Recommendations

When moving to cloud deployments:

1. **Phase out stored secrets** - Replace with OIDC where possible
2. **Implement role-based access** - Use cloud IAM roles instead of service account keys
3. **Enable audit logging** - Track all authentication and authorization events
4. **Regular access review** - Audit and remove unused permissions
5. **Conditional access** - Restrict access based on repository, branch, or environment

## Security Monitoring

### Workflow Security Checks

- All workflows run with minimal required permissions
- Actions are pinned to prevent supply chain attacks
- No secrets are exposed in workflow logs
- External dependencies are explicitly declared

### Regular Maintenance

- **Monthly action updates** - Review and update pinned action versions
- **Quarterly security review** - Audit permissions and access patterns
- **Annual policy review** - Update security guidelines and best practices

### Incident Response

If a security issue is identified:

1. **Disable affected workflows** immediately
2. **Rotate any potentially compromised secrets**
3. **Update pinned action versions** if supply chain compromise
4. **Document lessons learned** and update security practices
