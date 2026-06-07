import { Spectral, Document } from '@stoplight/spectral-core';
import { oas3Rules } from '@stoplight/spectral-rulesets';
import { parse } from 'yaml';
import { ValidationResult, ValidationError, ValidationWarning, ValidationInfo } from '../types/index';

export class SpectralService {
  private spectral: Spectral;

  constructor() {
    this.spectral = new Spectral();
  }

  async setupRuleset(rulesetUrl?: string): Promise<void> {
    if (rulesetUrl) {
      try {
        const response = await fetch(rulesetUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ruleset: ${response.statusText}`);
        }
        const rulesetConfig = await response.json();
        this.spectral.setRules(rulesetConfig);
      } catch (error) {
        console.error('Error loading custom ruleset, falling back to defaults:', error);
        this.spectral.setRules(oas3Rules);
      }
    } else {
      this.spectral.setRules(oas3Rules);
    }
  }

  async validateOAS(oasContent: string, format: 'json' | 'yaml'): Promise<ValidationResult> {
    try {
      // Parse OAS content
      let parsedOAS: any;

      if (format === 'yaml') {
        parsedOAS = parse(oasContent);
      } else {
        parsedOAS = JSON.parse(oasContent);
      }

      // Validate that it's a valid OpenAPI spec
      if (!parsedOAS || typeof parsedOAS !== 'object') {
        throw new Error('Invalid OpenAPI specification: content must be a valid object');
      }

      // Create document for Spectral
      const document = new Document(parsedOAS, { uri: 'openapi.yaml' });

      // Run validation
      const results = await this.spectral.run(document);

      // Process results
      return this.processResults(results);
    } catch (error) {
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private processResults(results: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const infos: ValidationInfo[] = [];

    results.forEach((result) => {
      const issue = {
        code: result.code || 'unknown',
        message: result.message || 'No message provided',
        path: result.path || [],
        range: result.range ? this.parseRange(result.range) : undefined,
      };

      if (result.severity === 'error') {
        errors.push({ ...issue, severity: 'error' });
      } else if (result.severity === 'warn') {
        warnings.push({ ...issue, severity: 'warning' });
      } else if (result.severity === 'info') {
        infos.push({ ...issue, severity: 'info' });
      }
    });

    const summary = {
      totalIssues: results.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      infoCount: infos.length,
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      infos,
      summary,
    };
  }

  private parseRange(range: any) {
    if (range) {
      return {
        start: {
          line: range.start?.line ?? 0,
          character: range.start?.character ?? 0,
        },
        end: {
          line: range.end?.line ?? 0,
          character: range.end?.character ?? 0,
        },
      };
    }
    return undefined;
  }
}
