# zod-swagger

Generate TypeScript interfaces, types, enums, and Zod schemas from OpenAPI documents.

[![npm version](https://badge.fury.io/js/zod-swagger.svg)](https://badge.fury.io/js/zod-swagger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

```bash
# Install globally
npm install -g zod-swagger

# Initialize configuration
zod-swagger init

# Generate types from OpenAPI spec
zod-swagger generate
```

## 📦 What's Inside

This monorepo contains:

### Packages

- **`packages/zod-swagger`** - The main CLI tool and library
- **`packages/config-eslint`** - Shared ESLint configurations
- **`packages/config-typescript`** - Shared TypeScript configurations
- **`packages/ui`** - Shared UI components

### Examples

- **`examples/with-express`** - Express.js server using generated types
- **`examples/with-nextjs`** - Next.js app using generated types

### Apps

- **`apps/docs`** - Documentation site
- **`apps/web`** - Demo web application

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Generate types (using Petstore API)
npm run types:generate
```

### Available Scripts

- `npm run build` - Build all packages and applications
- `npm run dev` - Develop all packages and applications
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint all packages and applications
- `npm run format` - Format all code
- `npm run types:generate` - Generate types from Petstore API

## 📚 Documentation

- [Main Package Documentation](packages/zod-swagger/README.md) - Complete guide to using zod-swagger
- [Express.js Example](examples/with-express/README.md) - Server-side usage example
- [Next.js Example](examples/with-nextjs/README.md) - Client-side usage example

## 🧪 Testing

The project uses Jest for testing with comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
├── packages/
│   ├── zod-swagger/          # Main CLI tool and library
│   ├── config-eslint/        # Shared ESLint configs
│   ├── config-typescript/    # Shared TypeScript configs
│   └── ui/                   # Shared UI components
├── examples/
│   ├── with-express/         # Express.js example
│   └── with-nextjs/          # Next.js example
├── apps/
│   ├── docs/                 # Documentation site
│   └── web/                  # Demo web app
├── tests/                    # Test files
└── README.md                 # This file
```

## 🔧 Configuration

### Turborepo

This project uses [Turborepo](https://turbo.build/repo) for build orchestration. Configuration is in `turbo.json`.

### TypeScript

Shared TypeScript configurations are in `packages/config-typescript/`.

### ESLint

Shared ESLint configurations are in `packages/config-eslint/`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [OpenAPI Types](https://github.com/metadevpro/openapi-types) - TypeScript types for OpenAPI
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive API documentation
