export interface ValidationRequest {
  oasContent: string;
  oasFormat: 'json' | 'yaml';
  rulesetUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  infos: ValidationInfo[];
  summary: ValidationSummary;
}

export interface ValidationError {
  code: string;
  message: string;
  path: string[];
  range?: Range;
  severity: 'error';
}

export interface ValidationWarning {
  code: string;
  message: string;
  path: string[];
  range?: Range;
  severity: 'warning';
}

export interface ValidationInfo {
  code: string;
  message: string;
  path: string[];
  range?: Range;
  severity: 'info';
}

export interface Range {
  start: { line: number; character: number };
  end: { line: number; character: number };
}

export interface ValidationSummary {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}
