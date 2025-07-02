# Next.js Example with zod-swagger

This example demonstrates how to use `zod-swagger` with a Next.js application to generate TypeScript types, interfaces, and Zod schemas from the Petstore OpenAPI specification.

## Features

- ⚡ Next.js 14 with App Router
- 📊 Generated types from OpenAPI specification
- ✅ Runtime validation with Zod schemas
- 🔗 API client generation
- 🎨 Modern UI with Tailwind CSS
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

This will create the following files in `generated/`:
- `types.ts` - TypeScript type definitions
- `interfaces.ts` - TypeScript interfaces
- `enums.ts` - TypeScript enums
- `schemas.ts` - Zod validation schemas
- `api.ts` - Generated API client

### 3. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Features

### 🐾 Pet Management
- View all available pets from the Petstore API
- Create new pets with form validation
- Real-time status updates
- Photo URL management

### 🔒 Type Safety
- Full TypeScript support with generated types
- Runtime validation using Zod schemas
- Compile-time error checking
- IntelliSense support for API responses

### 🎨 Modern UI
- Responsive design with Tailwind CSS
- Real-time form validation
- Loading states and error handling
- Clean, accessible interface

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
// Validate form data with generated Zod schema
const validatedPet = schemas.PetSchema.parse(newPet);
```

### Response Validation
```typescript
// Validate API response
const validatedPets = schemas.PetSchema.array().parse(response.data);
```

### Using Generated API Client
```typescript
const petstoreClient = new ApiClient('https://petstore.swagger.io/v2');
const response = await petstoreClient.getPetFindByStatus('available');
```

### Type-Safe State Management
```typescript
const [pets, setPets] = useState<types.Pet[]>([]);
const [newPet, setNewPet] = useState<Partial<types.Pet>>({
  name: '',
  photoUrls: [''],
  status: 'available'
});
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

### Linting
```bash
npm run lint
```

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page component
├── generated/               # Generated files (after running types:generate)
│   ├── api.ts              # Generated API client
│   ├── enums.ts            # Generated enums
│   ├── interfaces.ts       # Generated interfaces
│   ├── schemas.ts          # Generated Zod schemas
│   └── types.ts            # Generated TypeScript types
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── next.config.js          # Next.js configuration
```

## Learn More

- [zod-swagger Documentation](../../packages/zod-swagger/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAPI Specification](https://swagger.io/specification/) 