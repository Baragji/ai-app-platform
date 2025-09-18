# Software Bill of Materials (SBOM) Documentation

This directory contains Software Bill of Materials (SBOM) documentation and CycloneDX 1.6 compliance evidence for the AI App Platform.

## Overview

A Software Bill of Materials (SBOM) is a formal record containing the details and supply chain relationships of components used in building software. This includes open source and proprietary software components, libraries, and dependencies.

## SBOM Implementation

### Current Status
- ✅ **Basic SBOM Generation**: Automated via CycloneDX npm tool in CI/CD
- 🟡 **CycloneDX 1.6 Compliance**: Partial implementation, needs enhancement
- 🔴 **SBOM Signing**: Planned - cryptographic signatures for integrity
- 🔴 **SBOM Validation**: Planned - automated validation and verification

### SBOM Format
We use **CycloneDX 1.6** as our primary SBOM format because:
- Industry-standard format with broad tool support
- Rich metadata support for security analysis
- Native vulnerability correlation capabilities
- NIST and CISA recommended format

### Generation Process

#### Automated Generation
SBOM is automatically generated in CI/CD pipeline:

```yaml
- name: Generate SBOM (CycloneDX)
  if: always()
  run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json || true
```

#### Manual Generation
For local development and testing:

```bash
# Generate SBOM for entire workspace
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# Generate SBOM for specific workspace
npx @cyclonedx/cyclonedx-npm --output-file sbom-web.json apps/web

# Generate SBOM with enhanced metadata
npx @cyclonedx/cyclonedx-npm \
  --output-file sbom.json \
  --include-dev \
  --include-optional \
  --spec-version 1.6
```

## SBOM Content

### Components Tracked
- **Application Dependencies**: All production npm packages
- **Development Dependencies**: Build and test tools
- **System Dependencies**: Base container images and system libraries
- **Transitive Dependencies**: Complete dependency tree
- **Licenses**: All component licenses identified

### Metadata Included
- Component names, versions, and hashes
- License information (SPDX identifiers)
- Supplier and publisher information
- Vulnerability identifiers (CVEs)
- Component relationships and dependencies
- Build and deployment metadata

## Security Integration

### Vulnerability Scanning
SBOM is used for:
- Automated vulnerability detection
- Supply chain risk assessment
- License compliance verification
- Component lifecycle management

### CI/CD Integration
```yaml
# Enhanced SBOM generation with signing (planned)
- name: Generate and Sign SBOM
  run: |
    # Generate SBOM
    npx @cyclonedx/cyclonedx-npm --output-file sbom.json --spec-version 1.6
    
    # Sign SBOM with cosign (planned)
    cosign sign-blob --yes sbom.json > sbom.json.sig
    
    # Verify signature
    cosign verify-blob --signature sbom.json.sig sbom.json
```

## SBOM Enhancements (Planned)

### 1. CycloneDX 1.6 Full Compliance
- [ ] Upgrade to latest CycloneDX specification
- [ ] Include all recommended metadata fields
- [ ] Add component provenance information
- [ ] Include build environment details

### 2. SBOM Signing and Verification
- [ ] Implement cryptographic signing with cosign
- [ ] Add signature verification to CI/CD
- [ ] Store signed SBOMs as workflow artifacts
- [ ] Document signature verification procedures

### 3. SBOM Distribution
- [ ] Publish SBOMs to container registry
- [ ] Include SBOMs in release artifacts
- [ ] Provide API endpoint for SBOM access
- [ ] Document SBOM consumption guidelines

### 4. Advanced Metadata
- [ ] Include container image SBOMs
- [ ] Add source code repository information
- [ ] Include build reproducibility data
- [ ] Add deployment environment metadata

## SBOM Validation

### Automated Validation
```bash
# Validate SBOM format and structure
npx @cyclonedx/cyclonedx-cli validate --input-file sbom.json

# Check for required metadata
npx @cyclonedx/cyclonedx-cli analyze --input-file sbom.json

# Vulnerability analysis with SBOM
grype sbom:sbom.json
```

### Manual Review Process
1. **Completeness Check**: Verify all components are included
2. **Accuracy Verification**: Confirm versions and hashes
3. **License Review**: Validate license information
4. **Security Analysis**: Check for known vulnerabilities

## SBOM Storage and Access

### Current Storage
- **CI Artifacts**: SBOMs stored as GitHub Actions artifacts
- **Local Generation**: Available in project root as `sbom.json`

### Planned Improvements
- **Container Registry**: Attach SBOMs to container images
- **Release Assets**: Include SBOMs in GitHub releases
- **API Access**: Provide programmatic SBOM access
- **Historical Archive**: Maintain SBOM history for auditing

## Compliance and Standards

### Standards Alignment
- **NIST SP 800-218**: Secure Software Development Framework
- **CISA Minimum Elements**: All minimum SBOM elements included
- **SPDX 2.3**: License identifier compliance
- **CycloneDX 1.6**: Latest specification compliance

### Regulatory Requirements
- **Executive Order 14028**: Federal software supply chain requirements
- **EU Cyber Resilience Act**: Product security documentation
- **ISO/IEC 5962**: SPDX standard compliance

## Tools and Dependencies

### Primary Tools
- **@cyclonedx/cyclonedx-npm**: SBOM generation for Node.js
- **cosign**: SBOM signing and verification (planned)
- **grype**: Vulnerability scanning with SBOM input

### Supporting Tools
- **syft**: Alternative SBOM generation
- **SPDX tools**: License analysis and validation
- **CycloneDX CLI**: SBOM validation and analysis

## Future Enhancements

1. **Multi-format Support**: Generate SPDX and SWID formats
2. **Real-time Updates**: Dynamic SBOM updates during deployment
3. **Supply Chain Analysis**: Enhanced component risk assessment
4. **Integration APIs**: SBOM consumption by security tools

## References

- [CycloneDX Specification v1.6](https://cyclonedx.org/specification/overview/)
- [NIST SSDF SBOM Guidelines](https://www.nist.gov/itl/executive-order-improving-nations-cybersecurity/software-bill-materials)
- [CISA SBOM Minimum Elements](https://www.cisa.gov/sites/default/files/publications/SBOM_Minimum_Elements_Report.pdf)
- [Supply Chain Security Documentation](../../supply-chain.md)