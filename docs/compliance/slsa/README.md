# SLSA v1.0 Provenance Documentation

This directory contains Supply-chain Levels for Software Artifacts (SLSA) v1.0 provenance evidence and build attestations for the AI App Platform.

## Overview

SLSA (Supply-chain Levels for Software Artifacts) is a security framework that provides increasing security guarantees by documenting how software artifacts are produced. SLSA provenance provides cryptographically signed attestations of build processes.

## SLSA Implementation Status

### Current Status
- 🔴 **SLSA Level 0**: Current state - no provenance attestations
- 🟡 **SLSA Level 1**: Planned - basic build documentation
- 🔴 **SLSA Level 2**: Future - tamper resistance and isolation
- 🔴 **SLSA Level 3**: Future - maximum security guarantees

### SLSA v1.0 Compliance
- 🔴 **Build Provenance**: Not implemented - needs SLSA generator
- 🔴 **Cryptographic Signatures**: Not implemented - needs signing infrastructure
- 🔴 **Build Isolation**: Partial - CI runs in isolated environments
- 🔴 **Reproducible Builds**: Not verified - needs build reproducibility testing

## SLSA Levels

### SLSA Level 1: Basic Provenance
**Requirements:**
- Build process must be documented
- Provenance must be machine-readable
- Provenance must be cryptographically signed

**Implementation Plan:**
- [ ] Implement SLSA GitHub Generator
- [ ] Generate provenance attestations for all builds
- [ ] Sign provenance with GitHub's signing infrastructure
- [ ] Store provenance as workflow artifacts

### SLSA Level 2: Tamper Resistance
**Requirements (Future):**
- All Level 1 requirements
- Build service generates provenance
- Build service is hosted on infrastructure with safeguards against tampering

**Implementation Plan:**
- [ ] Use GitHub-hosted runners with SLSA generator
- [ ] Implement build parameter verification
- [ ] Add build environment attestations
- [ ] Verify all build inputs are attested

### SLSA Level 3: Maximum Security
**Requirements (Future):**
- All Level 2 requirements
- Build service provides strong isolation guarantees
- Provenance demonstrates build isolation

**Implementation Plan:**
- [ ] Implement hardware-based isolation
- [ ] Add comprehensive audit logging
- [ ] Verify reproducible builds
- [ ] Implement multi-party attestation

## Build Provenance Implementation

### GitHub Actions Integration

#### Planned SLSA Generator Integration
```yaml
# Enhanced CI with SLSA provenance generation
name: CI with SLSA Provenance
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      # Output build artifacts for provenance
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      
      # Standard build steps
      - name: Build application
        id: build
        run: |
          # Build process with output hash
          npm run build
          echo "digest=$(sha256sum dist.tar.gz | cut -d' ' -f1)" >> $GITHUB_OUTPUT

  # Generate SLSA provenance
  provenance:
    needs: [build]
    permissions:
      actions: read
      id-token: write
      contents: write
    uses: slsa-framework/slsa-github-generator/.github/workflows/generator_generic_slsa3.yml@v1.10.0
    with:
      base64-subjects: ${{ needs.build.outputs.subjects }}
      provenance-name: provenance.intoto.jsonl
```

### Provenance Content

#### Build Information
- **Builder Identity**: GitHub Actions runner information
- **Build Timestamp**: When the build occurred
- **Source Repository**: Git commit hash and repository URL
- **Build Parameters**: Environment variables and build configuration
- **Dependencies**: Input materials and their hashes

#### Attestation Format
SLSA provenance follows the in-toto attestation format:
```json
{
  "_type": "https://in-toto.io/Statement/v0.1",
  "subject": [
    {
      "name": "ai-app-platform",
      "digest": {
        "sha256": "abc123..."
      }
    }
  ],
  "predicateType": "https://slsa.dev/provenance/v1",
  "predicate": {
    "buildDefinition": {
      "buildType": "https://github.com/actions/...",
      "externalParameters": {},
      "internalParameters": {},
      "resolvedDependencies": []
    },
    "runDetails": {
      "builder": {
        "id": "https://github.com/actions/runner/..."
      },
      "metadata": {
        "invocationId": "...",
        "startedOn": "2024-01-01T00:00:00Z",
        "finishedOn": "2024-01-01T00:10:00Z"
      }
    }
  }
}
```

## Verification Process

### Automated Verification
```yaml
# Verify SLSA provenance in deployment
- name: Verify SLSA Provenance
  run: |
    # Download provenance from build
    gh run download ${{ github.run_id }} -n provenance
    
    # Verify provenance signature
    slsa-verifier verify-artifact \
      --provenance-path provenance.intoto.jsonl \
      --source-uri github.com/Baragji/ai-app-platform \
      --source-tag ${{ github.ref_name }} \
      dist.tar.gz
```

### Manual Verification
```bash
# Verify artifact against provenance
slsa-verifier verify-artifact \
  --provenance-path provenance.intoto.jsonl \
  --source-uri github.com/Baragji/ai-app-platform \
  --source-tag v1.0.0 \
  artifact.tar.gz

# Inspect provenance content
cat provenance.intoto.jsonl | jq '.predicate.buildDefinition'
```

## Integration with Container Images

### Container Provenance
```yaml
# Build and attest container images
- name: Build and Push with Provenance
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/baragji/ai-app-platform:latest
    # Automatically generate provenance
    provenance: true
    # Generate SBOM
    sbom: true
```

### Image Verification
```bash
# Verify container image provenance
cosign verify-attestation \
  --type slsaprovenance \
  --certificate-identity-regexp="https://github.com/Baragji/ai-app-platform/.*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  ghcr.io/baragji/ai-app-platform:latest
```

## Security Benefits

### Supply Chain Protection
- **Build Integrity**: Cryptographically prove build process integrity
- **Source Verification**: Verify artifacts were built from expected source
- **Build Environment**: Attest to build environment security
- **Dependency Tracking**: Document all build inputs and dependencies

### Compliance Support
- **Audit Trail**: Complete build audit trail for compliance
- **Non-repudiation**: Cryptographic proof of build process
- **Transparency**: Public verification of build processes
- **Risk Assessment**: Enable supply chain risk analysis

## Implementation Roadmap

### Phase 1: Basic Provenance (Current)
- [ ] Implement SLSA GitHub Generator
- [ ] Generate provenance for main branch builds
- [ ] Store provenance as workflow artifacts
- [ ] Document verification procedures

### Phase 2: Enhanced Security
- [ ] Implement provenance verification in CI
- [ ] Add container image provenance
- [ ] Integrate with deployment processes
- [ ] Automate artifact verification

### Phase 3: Advanced Features
- [ ] Multi-signature provenance
- [ ] Reproducible build verification
- [ ] Cross-organization attestation
- [ ] Advanced security policies

## Tools and Dependencies

### SLSA Tools
- **slsa-github-generator**: Official GitHub Actions SLSA generator
- **slsa-verifier**: Command-line provenance verification tool
- **cosign**: Container image signing and verification

### Supporting Infrastructure
- **GitHub Actions**: Build environment and signing infrastructure
- **Sigstore**: Keyless signing infrastructure
- **OCI Registry**: Container image and attestation storage

## Monitoring and Alerting

### Provenance Monitoring
- Track provenance generation success/failure
- Monitor verification results in deployments
- Alert on provenance validation failures
- Audit provenance access and usage

### Security Metrics
- SLSA level compliance over time
- Build environment security score
- Provenance verification coverage
- Supply chain risk indicators

## Future Enhancements

1. **Multi-platform Builds**: Provenance for multiple architectures
2. **Nested Attestations**: Provenance for dependencies
3. **Policy Enforcement**: Automated policy-based deployment gates
4. **Integration with SBOM**: Combined SBOM and provenance attestations

## References

- [SLSA v1.0 Specification](https://slsa.dev/spec/v1.0/)
- [SLSA GitHub Generator](https://github.com/slsa-framework/slsa-github-generator)
- [in-toto Attestation Format](https://github.com/in-toto/attestation)
- [Supply Chain Security Documentation](../../supply-chain.md)