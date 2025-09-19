# Security Testing Suite

This directory contains security verification tests and compliance validation scripts for the AI App Platform.

## Test Categories

### Supply Chain Security Tests

- SBOM generation and validation
- Dependency vulnerability scanning
- License compliance verification
- SLSA provenance verification

### Application Security Tests

- ASVS compliance verification
- Authentication and authorization testing
- Input validation and output encoding
- Session management security

### AI-Specific Security Tests

- AI model input validation
- Output filtering and sanitization
- Bias and fairness testing
- AI transparency compliance

## Running Security Tests

```bash
# Run all security tests
npm run test:security

# Run specific test categories
npm run test:security:supply-chain
npm run test:security:asvs
npm run test:security:ai-compliance
```

## Continuous Security Validation

Security tests are integrated into the CI/CD pipeline to ensure:

- No security regressions
- Compliance requirements are maintained
- Vulnerability detection and remediation
- Evidence generation for auditing
