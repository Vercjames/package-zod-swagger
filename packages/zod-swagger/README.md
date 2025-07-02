# zod-swagger

Generate TypeScript interfaces, types, enums, and Zod schemas from OpenAPI documents.

[![npm version](https://badge.fury.io/js/zod-swagger.svg)](https://badge.fury.io/js/zod-swagger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **CLI Tool** - Generate types from command line
- 📊 **TypeScript Support** - Full type safety with generated interfaces
- ✅ **Zod Integration** - Runtime validation with generated schemas
- 🔗 **API Client Generation** - Auto-generated API client classes
- 📝 **Multiple Outputs** - Types, interfaces, enums, and schemas
- 🎯 **OpenAPI 3.0 Support** - Compatible with latest OpenAPI specifications
- ⚡ **Fast Generation** - Efficient parsing and code generation
- 🔧 **Configurable** - Customizable output and generation options

## Installation

```bash
npm install zod-swagger
```

Or install globally:

```bash
npm install -g zod-swagger
```

## Quick Start

### 1. Initialize Configuration

```bash
npx zod-swagger init
```

This creates a `zod-swagger.config.js` file with default settings.

### 2. Generate Types

```bash
npx zod-swagger generate
```

This will generate TypeScript files from your OpenAPI specification.

### 3. Use Generated Types

```typescript
import { ApiClient } from './generated/api';
import * as schemas from './generated/schemas';
import * as types from './generated/types';

// Initialize API client
const client = new ApiClient('https://api.example.com');

// Use generated types
const pet: types.Pet = {
  name: 'Fluffy',
  photoUrls: ['https://example.com/fluffy.jpg'],
  status: 'available'
};

// Validate with Zod schemas
const validatedPet = schemas.PetSchema.parse(pet);

// Make API calls
const response = await client.getPetPetId(123);
```

## CLI Usage

### Generate Command

```bash
zod-swagger generate [options]
```

**Options:**
- `-i, --input <input>` - OpenAPI specification URL or file path
- `-o, --output <output>` - Output directory for generated files
- `-f, --format <format>` - Output format (typescript|javascript)
- `--include-examples` - Include example data in generated files
- `--include-schemas` - Include schema definitions (default: true)
- `--include-paths` - Include API path definitions (default: true)
- `--include-components` - Include component definitions (default: true)
- `--template <template>` - Custom template path

### Init Command

```bash
zod-swagger init [options]
```

**Options:**
- `-i, --input <input>` - Default OpenAPI specification URL or file path
- `-o, --output <output>` - Default output directory (default: ./generated)

### Examples

```bash
# Generate from URL
zod-swagger generate -i https://petstore.swagger.io/v2/swagger.json -o ./src/generated

# Generate from local file
zod-swagger generate -i ./openapi.json -o ./types

# Initialize with custom settings
zod-swagger init -i https://api.example.com/openapi.json -o ./src/types
```

## Configuration

### Configuration File

Create a `zod-swagger.config.js` file in your project root:

```javascript
module.exports = {
  input: 'https://petstore.swagger.io/v2/swagger.json',
  output: './src/generated',
  format: 'typescript',
  includeExamples: false,
  includeSchemas: true,
  includePaths: true,
  includeComponents: true
};
```

### Package.json Scripts

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "types:generate": "zod-swagger generate",
    "types:watch": "zod-swagger generate --watch"
  }
}
```

### Package.json Configuration

You can also configure zod-swagger in your `package.json`:

```json
{
  "zod-swagger": {
    "input": "https://petstore.swagger.io/v2/swagger.json",
    "output": "./src/generated",
    "format": "typescript"
  }
}
```

## Generated Files

The generator creates the following files:

### types.ts
```typescript
export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type Pet = {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: "available" | "pending" | "sold";
};
```

### interfaces.ts
```typescript
export interface Pet {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: "available" | "pending" | "sold";
}
```

### enums.ts
```typescript
export enum PetStatus {
  AVAILABLE = "available",
  PENDING = "pending",
  SOLD = "sold"
}
```

### schemas.ts
```typescript
import { z } from 'zod';

export const PetSchema = z.object({
  id: z.number().optional(),
  category: CategorySchema.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(TagSchema).optional(),
  status: z.enum(["available", "pending", "sold"]).optional(),
});
```

### api.ts
```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, config?: any) {
    this.client = axios.create({ baseURL, ...config });
  }

  async getPetPetId(petId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/pet/${petId}`);
  }

  async postPet(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/pet', data);
  }
}
```

## Programmatic Usage

You can also use zod-swagger programmatically:

```typescript
import { generateFromOpenAPI } from 'zod-swagger';

const result = await generateFromOpenAPI({
  input: 'https://petstore.swagger.io/v2/swagger.json',
  output: './src/generated',
  format: 'typescript'
});

console.log(`Generated ${result.files.length} files`);
```

## Examples

Check out the example projects in the `examples/` directory:

- [Express.js Example](../../examples/with-express/) - Server-side usage with Express
- [Next.js Example](../../examples/with-nextjs/) - Client-side usage with React/Next.js

## API Reference

### OpenAPIParser

```typescript
import { OpenAPIParser } from 'zod-swagger';

const parser = new OpenAPIParser();
const spec = await parser.loadSpec('https://api.example.com/openapi.json');
const schemas = parser.getSchemas();
const paths = parser.getPaths();
const components = parser.getComponents();
```

### CodeGenerator

```typescript
import { CodeGenerator } from 'zod-swagger';

const generator = new CodeGenerator(schemas, paths, components);
const result = generator.generate();
```

### Types

```typescript
import type {
  ZodSwaggerConfig,
  GeneratedFile,
  SchemaInfo,
  PathInfo,
  ComponentInfo,
  GenerationResult
} from 'zod-swagger';
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Testing

```bash
npm test
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Related Projects

- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [OpenAPI Types](https://github.com/metadevpro/openapi-types) - TypeScript types for OpenAPI
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive API documentation 