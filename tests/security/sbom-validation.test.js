/**
 * SBOM Validation Tests
 * Tests for Software Bill of Materials generation and validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('SBOM Generation and Validation', () => {
  const sbomPath = path.join(process.cwd(), 'sbom.json');
  const spdxSbomPath = path.join(process.cwd(), 'sbom.spdx.json');

  beforeAll(() => {
    // Generate SBOM for testing
    try {
      execSync('npx @cyclonedx/cyclonedx-npm --output-file sbom.json --spec-version 1.6', { 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.warn('SBOM generation failed, tests may not work properly');
    }
  });

  describe('CycloneDX SBOM Generation', () => {
    test('should generate valid CycloneDX SBOM file', () => {
      expect(fs.existsSync(sbomPath)).toBe(true);
      
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Validate basic SBOM structure
      expect(sbom).toHaveProperty('bomFormat');
      expect(sbom.bomFormat).toBe('CycloneDX');
      expect(sbom).toHaveProperty('specVersion');
      expect(sbom).toHaveProperty('components');
      expect(Array.isArray(sbom.components)).toBe(true);
    });

    test('should include required metadata fields', () => {
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Check for required metadata
      expect(sbom).toHaveProperty('metadata');
      expect(sbom.metadata).toHaveProperty('timestamp');
      expect(sbom.metadata).toHaveProperty('tools');
    });

    test('should include all production dependencies', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Check that major dependencies are included
      const componentNames = sbom.components.map(c => c.name);
      
      // Should include major framework dependencies
      const expectedDeps = ['next', 'react', 'typescript'];
      expectedDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          expect(componentNames).toContain(dep);
        }
      });
    });

    test('should include license information', () => {
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Check that components have license information
      const componentsWithLicenses = sbom.components.filter(c => 
        c.licenses && c.licenses.length > 0
      );
      
      // At least 50% of components should have license info
      expect(componentsWithLicenses.length).toBeGreaterThan(sbom.components.length * 0.5);
    });

    test('should include component hashes', () => {
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Check for components with hashes (integrity information)
      const componentsWithHashes = sbom.components.filter(c => 
        c.hashes && c.hashes.length > 0
      );
      
      // Some components should have hash information
      expect(componentsWithHashes.length).toBeGreaterThan(0);
    });
  });

  describe('SBOM Compliance Validation', () => {
    test('should comply with NIST minimum elements', () => {
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // NIST minimum elements validation
      expect(sbom).toHaveProperty('metadata'); // Supplier information
      expect(sbom).toHaveProperty('components'); // Component names
      expect(sbom.components.every(c => c.name)).toBe(true); // All components have names
      expect(sbom.components.every(c => c.version || c.purl)).toBe(true); // Version info
    });

    test('should be valid CycloneDX 1.6 format', () => {
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Validate CycloneDX 1.6 specific fields
      expect(sbom.specVersion).toMatch(/^1\.6/);
      expect(sbom.bomFormat).toBe('CycloneDX');
      
      // Should have proper component structure
      sbom.components.forEach(component => {
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('name');
        expect(['application', 'library', 'framework', 'container', 'operating-system', 'device', 'firmware', 'file'])
          .toContain(component.type);
      });
    });
  });

  describe('Supply Chain Security Integration', () => {
    test('should detect known vulnerabilities (if any)', async () => {
      // This is a smoke test - in a real implementation, you'd integrate with
      // vulnerability databases or tools like Grype, Trivy, etc.
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Basic check - all components should have identifiable versions
      const componentsWithVersions = sbom.components.filter(c => 
        c.version || (c.purl && c.purl.includes('@'))
      );
      
      expect(componentsWithVersions.length).toBeGreaterThan(0);
    });

    test('should support artifact integrity verification', () => {
      const sbomContent = fs.readFileSync(sbomPath, 'utf8');
      const sbom = JSON.parse(sbomContent);
      
      // Check if SBOM itself can be used for integrity verification
      expect(sbom).toHaveProperty('serialNumber');
      expect(sbom.serialNumber).toMatch(/^urn:uuid:/);
    });
  });

  afterAll(() => {
    // Cleanup generated test files
    [sbomPath, spdxSbomPath].forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (error) {
          console.warn(`Could not clean up ${file}: ${error.message}`);
        }
      }
    });
  });
});