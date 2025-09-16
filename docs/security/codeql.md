# CodeQL Code Scanning

This repository uses GitHub's CodeQL for automated security vulnerability detection and code quality analysis.

## What Default Setup Scans

CodeQL Default Setup automatically analyzes the repository for:

### Languages Detected
- **JavaScript/TypeScript** - Web application code, API endpoints, React components
- **Configuration files** - GitHub Actions workflows, Docker configurations

### Security Vulnerabilities
- **Injection attacks** - SQL injection, command injection, XSS
- **Authentication & authorization** - Insecure authentication flows, privilege escalation
- **Cryptographic issues** - Weak encryption, improper key management
- **Data flow analysis** - Sensitive data exposure, improper input validation
- **Configuration vulnerabilities** - Insecure defaults, misconfigured services

### Code Quality Issues
- **Performance problems** - Inefficient algorithms, resource leaks
- **Maintainability** - Code smells, complex functions, dead code
- **Correctness** - Logic errors, type mismatches, null pointer dereferences

## Where to View Alerts

### GitHub Security Tab
1. Navigate to the repository on GitHub
2. Click the **Security** tab in the repository navigation
3. Select **Code scanning alerts** from the left sidebar
4. View all current and historical alerts with severity levels

### Pull Request Integration
- CodeQL automatically runs on all pull requests
- Results appear as status checks in the PR
- New alerts are highlighted directly in the PR diff
- Alerts that are resolved by the PR are marked as fixed

### Alert Details
Each alert provides:
- **Description** - What the vulnerability or issue is
- **Location** - Exact file and line number
- **Severity** - Critical, High, Medium, Low, Note
- **CWE/CVE references** - Industry-standard vulnerability classifications
- **Example code paths** - How data flows through the vulnerability

## How to Triage False Positives

### Dismissing Alerts
1. Navigate to the specific alert in the Security tab
2. Click **Dismiss alert**
3. Select the appropriate reason:
   - **False positive** - The alert is incorrect
   - **Won't fix** - Valid issue but accepted risk
   - **Used in tests** - Test code that mimics vulnerabilities

### Best Practices for Triage
- **Investigate thoroughly** - Understand why CodeQL flagged the code
- **Validate manually** - Confirm whether the vulnerability is exploitable
- **Document decisions** - Add comments explaining dismissal rationale
- **Review with team** - Discuss security concerns with other developers

### Suppression in Code
For legitimate false positives, add CodeQL query suppression:

```javascript
// CodeQL: This is safe because input is validated upstream
// lgtm[js/path-injection]
const filePath = path.join(baseDir, userInput);
```

### Regular Review Process
- **Weekly triage** - Review new alerts promptly
- **Monthly review** - Reassess dismissed alerts
- **Release gates** - Block releases for Critical/High severity alerts
- **Security training** - Keep team updated on common vulnerability patterns

## Configuration

CodeQL Default Setup requires no configuration files - it automatically:
- Detects languages in the repository
- Runs analysis on push to default branch and pull requests
- Uses GitHub's curated query suites for maximum coverage
- Updates query definitions automatically for new vulnerability patterns

For custom analysis needs, a manual CodeQL workflow can be added, but the default setup covers the vast majority of security scanning requirements.