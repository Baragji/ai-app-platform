# Supply Chain Security

This document describes the supply chain security measures implemented for the AI App Platform container image.

## Overview

The AI App Platform implements comprehensive supply chain security using:

- **Build Provenance**: Cryptographically signed build attestations
- **Cosign Keyless Signing**: Container image signatures using OIDC
- **SBOM Generation**: Software Bill of Materials for dependency tracking
- **Signature Verification**: Automated verification of signatures

## Security Guarantees

### Build Provenance

The build process generates signed provenance attestations that provide:

- **Build integrity**: Cryptographic proof of the build process
- **Source integrity**: Verification that the build matches the source code
- **Build metadata**: Complete record of build parameters and environment
- **Audit trail**: Tamper-evident record of the build process

### Cosign Keyless Signing

Container images are signed using Cosign with keyless signing via OIDC:

- **No long-term keys**: Uses short-lived certificates from Fulcio
- **Identity-based**: Tied to GitHub Actions OIDC identity
- **Transparency**: All signatures logged in Rekor transparency log

### SBOM (Software Bill of Materials)

Every container image includes a signed SBOM that provides:

- **Dependency tracking**: Complete list of all software components
- **Vulnerability scanning**: Enables automated security scanning
- **Compliance**: Supports regulatory and audit requirements
- **Supply chain visibility**: Full transparency of third-party components

## Verification Commands

### Verify Container Image Signature

```bash
# Install cosign (if not already installed)
curl -O -L "https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
sudo mv cosign-linux-amd64 /usr/local/bin/cosign
sudo chmod +x /usr/local/bin/cosign

# Verify the container image signature
cosign verify \
  --certificate-identity-regexp="https://github.com/Baragji/ai-app-platform/.*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  ai-app-platform:latest
```

### Verify Build Provenance

```bash
# Verify build provenance signature (after downloading provenance files from artifacts)
cosign verify-blob \
  --certificate-identity-regexp="https://github.com/Baragji/ai-app-platform/.*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  --signature provenance.json.sig \
  --certificate provenance.json.pem \
  provenance.json

# Inspect provenance content
cat provenance.json | jq '.'
```

### Verify SBOM Signature

```bash
# Verify SBOM signature (after downloading SBOM and signature files from artifacts)
cosign verify-blob \
  --certificate-identity-regexp="https://github.com/Baragji/ai-app-platform/.*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  --signature sbom.spdx.json.sig \
  --certificate sbom.spdx.json.pem \
  sbom.spdx.json
```

## CI/CD Integration

The supply chain security is integrated into the CI/CD pipeline:

1. **Build Phase**: Container image is built with buildx
2. **Signing Phase**: Image is signed with cosign keyless signing
3. **SBOM Generation**: Software Bill of Materials is created and signed
4. **Provenance Generation**: Build provenance attestation is generated and signed
5. **Verification**: All signatures are verified before completion
6. **Artifact Upload**: All attestations are uploaded as artifacts

## Artifact Storage

Supply chain artifacts are stored as GitHub Actions artifacts:

- **SBOM**: `sbom.spdx.json` (SPDX format)
- **SBOM Signature**: `sbom.spdx.json.sig`
- **SBOM Certificate**: `sbom.spdx.json.pem`
- **Build Provenance**: `provenance.json` (In-toto format)
- **Provenance Signature**: `provenance.json.sig`
- **Provenance Certificate**: `provenance.json.pem`
- **Container Image**: Saved as `docker-image` artifact

## Security Considerations

### Threat Model

This supply chain security setup protects against:

- **Build tampering**: Signed provenance ensures build integrity
- **Image tampering**: Cosign signatures detect unauthorized modifications
- **Dependency confusion**: SBOM provides complete dependency visibility
- **Supply chain attacks**: Full audit trail of build process

### Limitations

- **Runtime security**: This focuses on build-time security, not runtime protection
- **Registry security**: When pushing to registries, additional security measures may be needed
- **Key rotation**: Keyless signing reduces key management burden but relies on OIDC provider security

## Compliance

This implementation supports compliance with:

- **NIST SSDF**: Secure Software Development Framework
- **In-toto Specification**: Supply chain metadata format
- **CISA Guidelines**: Software supply chain security guidance
- **Executive Order 14028**: Improving the Nation's Cybersecurity

## Future Enhancements

Potential future improvements:

- **SLSA Level 3**: Upgrade to full SLSA Level 3 compliance with slsa-github-generator
- **Policy enforcement**: Implement admission controllers for signature verification
- **Continuous monitoring**: Regular re-verification of signatures
- **Multi-signature**: Require multiple signatures for critical releases
- **Hardware security**: Integration with hardware security modules (HSMs)
