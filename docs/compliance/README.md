# Security & Compliance Documentation

This directory contains comprehensive security and supply chain compliance documentation for the AI App Platform.

## Directory Structure

### Core Security Frameworks
- **`asvs/`** - Application Security Verification Standard (ASVS) v5.0 evidence and mappings
- **`sbom/`** - Software Bill of Materials (SBOM) documentation and CycloneDX 1.6 compliance
- **`slsa/`** - Supply-chain Levels for Software Artifacts (SLSA) v1.0 provenance evidence

### Regulatory Compliance
- **`ai-act/`** - EU AI Act General Purpose AI Model (GPAI) transparency documentation
- **`iso42001/`** - ISO/IEC 42001 AI Management System alignment documentation

## Security Evidence Bundle

The complete security evidence bundle includes:

1. **ASVS v5.0 Compliance**
   - Security control mappings
   - Verification evidence
   - Testing documentation

2. **Supply Chain Security**
   - SBOM generation and signing
   - SLSA provenance attestations
   - Container image signatures

3. **Security Scanning**
   - Static analysis (CodeQL, SARIF)
   - Dependency vulnerability scanning
   - OpenSSF Scorecard compliance

4. **Regulatory Documentation**
   - AI Act transparency requirements
   - ISO 42001 alignment evidence
   - Privacy and data protection measures

## Compliance Status

| Framework | Status | Last Updated | Evidence Location |
|-----------|--------|--------------|-------------------|
| ASVS v5.0 | 🟡 In Progress | TBD | `asvs/` |
| SBOM CycloneDX 1.6 | 🟡 Partial | Current | `sbom/` |
| SLSA v1.0 | 🔴 Planned | TBD | `slsa/` |
| EU AI Act | 🔴 Planned | TBD | `ai-act/` |
| ISO 42001 | 🔴 Planned | TBD | `iso42001/` |

## Security Verification

All security evidence is automatically generated and verified through:
- CI/CD pipeline security checks
- Automated SBOM generation
- Digital signature verification
- Supply chain attestation validation

For detailed information, see the individual subdirectories and their README files.