# Express.js Example with zod-swagger

This example demonstrates how to use `zod-swagger` with an Express.js application to generate TypeScript types, interfaces, and Zod schemas from the Petstore OpenAPI specification.

## Features

- 🚀 Express.js server with TypeScript
- 📊 Generated types from OpenAPI specification
- ✅ Runtime validation with Zod schemas
- 🔗 API client generation
- 🐾 Petstore API integration

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Types

Generate TypeScript types, interfaces, and Zod schemas from the Petstore OpenAPI specification:

```bash
npm run types:generate
```

This will create the following files in `src/generated/`:
- `types.ts` - TypeScript type definitions
- `interfaces.ts` - TypeScript interfaces
- `enums.ts` - TypeScript enums
- `schemas.ts` - Zod validation schemas
- `api.ts` - Generated API client

### 3. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /health
Health check endpoint

### GET /pets
Fetch all available pets from the Petstore API

### POST /pets
Create a new pet (with request validation)

### GET /pets/:petId
Fetch a specific pet by ID

## Generated Files

The `types:generate` script creates the following files:

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
export class ApiClient {
  async getPetFindByStatus(status: string): Promise<AxiosResponse<any>> {
    return this.client.get('/pet/findByStatus', { params: { status } });
  }
  
  async postPet(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/pet', data);
  }
}
```

## Usage Examples

### Request Validation
```typescript
// Validate incoming request body
const petData = schemas.PetSchema.parse(req.body);
```

### Response Validation
```typescript
// Validate API response
const pets = schemas.PetSchema.array().parse(response.data);
```

### Using Generated API Client
```typescript
const petstoreClient = new ApiClient('https://petstore.swagger.io/v2');
const response = await petstoreClient.getPetFindByStatus('available');
```

## Configuration

You can customize the generation by modifying the script in `package.json`:

```json
{
  "scripts": {
    "types:generate": "zod-swagger generate -i https://petstore.swagger.io/v2/swagger.json -o ./src/generated"
  }
}
```

Or create a `zod-swagger.config.js` file:

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

## Development

### Watch Mode
To automatically regenerate types when the OpenAPI spec changes:

```bash
npm run types:watch
```

### Build for Production
```bash
npm run build
npm start
```

## Learn More

- [zod-swagger Documentation](../../packages/zod-swagger/README.md)
- [Express.js Documentation](https://expressjs.com/)
- [Zod Documentation](https://zod.dev/)
- [OpenAPI Specification](https://swagger.io/specification/) 