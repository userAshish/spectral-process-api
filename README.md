# Spectral Process API

A Node.js Express API for validating OpenAPI Specification (OAS) files against Spectral rules.

## Features

- ✅ Validate OAS files (JSON and YAML formats)
- ✅ Support for custom Spectral rulesets
- ✅ File upload and raw content validation
- ✅ Detailed validation reports with errors, warnings, and info
- ✅ TypeScript for type safety
- ✅ RESTful API design
- ✅ Comprehensive error handling

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts                           # Main application entry point
├── types/
│   └── index.ts                      # TypeScript interfaces and types
├── services/
│   └── spectralService.ts            # Core Spectral validation logic
├── controllers/
│   └── validationController.ts       # Request handlers
├── middleware/
│   ├── uploadMiddleware.ts           # Multer file upload configuration
│   └── errorHandler.ts               # Global error handling
└── routes/
    └── validationRoutes.ts           # API route definitions
```

## API Endpoints

### 1. Validate OAS Content
**POST** `/api/validate/content`

Validate OpenAPI specification from raw JSON/YAML content.

**Request Body:**
```json
{
  "oasContent": "openapi: 3.0.0\\ninfo:\\n  title: My API\\n  version: 1.0.0",
  "oasFormat": "yaml",
  "rulesetUrl": "https://example.com/custom-ruleset.json"
}
```

**Parameters:**
- `oasContent` (required): OpenAPI specification as string
- `oasFormat` (optional): Format of content - `json` or `yaml` (default: `json`)
- `rulesetUrl` (optional): URL to custom Spectral ruleset

**Response:**
```json
{
  "isValid": false,
  "errors": [
    {
      "code": "missing-description",
      "message": "Description is required",
      "path": ["info"],
      "severity": "error",
      "range": {
        "start": { "line": 1, "character": 0 },
        "end": { "line": 1, "character": 10 }
      }
    }
  ],
  "warnings": [],
  "infos": [],
  "summary": {
    "totalIssues": 1,
    "errorCount": 1,
    "warningCount": 0,
    "infoCount": 0
  }
}
```

### 2. Validate OAS File
**POST** `/api/validate/file`

Validate OpenAPI specification from an uploaded file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Form Fields:
  - `file`: OpenAPI spec file (JSON or YAML, max 5MB)
  - `rulesetUrl` (optional): URL to custom ruleset

**cURL Examples:**
```bash
# Basic file upload
curl -X POST http://localhost:3000/api/validate/file \\
  -F "file=@openapi.yaml"

# With custom ruleset
curl -X POST http://localhost:3000/api/validate/file \\
  -F "file=@openapi.yaml" \\
  -F "rulesetUrl=https://example.com/custom-ruleset.json"
```

**Response:** Same format as `/api/validate/content`

### 3. Health Check
**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-07T10:30:00Z"
}
```

## Response Format

All validation responses follow this structure:

```typescript
{
  isValid: boolean;                    // Whether validation passed
  errors: ValidationError[];           // Critical errors
  warnings: ValidationWarning[];       // Non-critical warnings
  infos: ValidationInfo[];             // Informational messages
  summary: {
    totalIssues: number;               // Total violations found
    errorCount: number;                // Number of errors
    warningCount: number;              // Number of warnings
    infoCount: number;                 // Number of info messages
  };
}
```

## Configuration

### Environment Variables

```bash
PORT=3000                    # API server port (default: 3000)
NODE_ENV=development         # Environment (development, production)
```

## Usage Examples

### Node.js/TypeScript Client

```typescript
interface ValidationRequest {
  oasContent: string;
  oasFormat: 'json' | 'yaml';
  rulesetUrl?: string;
}

const validateOAS = async (oasContent: string, format: 'json' | 'yaml' = 'json') => {
  const response = await fetch('http://localhost:3000/api/validate/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oasContent,
      oasFormat: format,
    } as ValidationRequest),
  });

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`);
  }

  return response.json();
};

// Usage
const result = await validateOAS(openApiSpec, 'yaml');
console.log(`API is ${result.isValid ? 'valid' : 'invalid'}`);
console.log(`Found ${result.summary.errorCount} errors`);
```

### Python Client

```python
import requests
import json

def validate_oas(oas_content, oas_format='json'):
    url = 'http://localhost:3000/api/validate/content'
    payload = {
        'oasContent': oas_content,
        'oasFormat': oas_format
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
with open('openapi.yaml', 'r') as f:
    spec = f.read()

result = validate_oas(spec, 'yaml')
print(f"Valid: {result['isValid']}")
print(f"Errors: {result['summary']['errorCount']}")
```

### cURL

```bash
# Validate JSON content
curl -X POST http://localhost:3000/api/validate/content \\
  -H "Content-Type: application/json" \\
  -d '{
    "oasContent": "{\\"openapi\\":\\"3.0.0\\",\\"info\\":{\\"title\\":\\"Test\\",\\"version\\":\\"1.0\\"}}",
    "oasFormat": "json"
  }'

# Validate YAML file
curl -X POST http://localhost:3000/api/validate/file \\
  -F "file=@openapi.yaml"
```

## Default Ruleset

The API uses Spectral's default OpenAPI 3.x ruleset if no custom ruleset is provided. This includes rules for:

- Required fields validation
- Type checking
- Format validation
- Naming conventions
- Security definitions
- Server definitions
- Parameter validation

## Custom Rulesets

You can provide a custom ruleset URL to override the default rules. The ruleset must be a valid JSON file:

```bash
curl -X POST http://localhost:3000/api/validate/content \\
  -H "Content-Type: application/json" \\
  -d '{
    "oasContent": "...",
    "oasFormat": "yaml",
    "rulesetUrl": "https://example.com/my-ruleset.json"
  }'
```

## Error Handling

The API provides descriptive error messages:

```json
{
  "error": "Validation error",
  "message": "Invalid OpenAPI specification: content must be a valid object",
  "timestamp": "2026-06-07T10:30:00Z"
}
```

Common errors:
- `400 Bad Request`: Missing required fields or invalid format
- `413 Payload Too Large`: File exceeds 5MB limit
- `500 Internal Server Error`: Server-side processing error

## Testing

```bash
# Run tests
npm run test

# Run linting
npm run lint
```

## License

MIT

## Author

userAshish
