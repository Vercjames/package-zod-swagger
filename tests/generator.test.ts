import { CodeGenerator } from '../packages/zod-swagger/package/generator';
import { SchemaInfo, PathInfo, ComponentInfo } from '../packages/zod-swagger/package/types';
import { OpenAPIV3 } from 'openapi-types';

describe('CodeGenerator', () => {
  let generator: CodeGenerator;
  let mockSchemas: SchemaInfo[];
  let mockPaths: PathInfo[];
  let mockComponents: ComponentInfo;

  beforeEach(() => {
    // Mock Pet schema
    const petSchema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        status: { 
          type: 'string',
          enum: ['available', 'pending', 'sold']
        },
        photoUrls: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['name', 'photoUrls']
    };

    mockSchemas = [
      {
        name: 'Pet',
        schema: petSchema,
        required: false,
        description: 'A pet in the store'
      }
    ];

    mockPaths = [
      {
        path: '/pet',
        method: 'post',
        operation: {
          summary: 'Add a new pet to the store',
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Pet' }
                }
              }
            }
          }
        },
        parameters: [],
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pet' }
              }
            }
          }
        }
      }
    ];

    mockComponents = {
      schemas: {
        Pet: petSchema
      },
      parameters: {},
      responses: {},
      requestBodies: {}
    };

    generator = new CodeGenerator(mockSchemas, mockPaths, mockComponents);
  });

  describe('generate', () => {
    it('should generate all required files', () => {
      const result = generator.generate();
      
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      
      const fileNames = result.files.map(f => f.name);
      expect(fileNames).toContain('types.ts');
      expect(fileNames).toContain('interfaces.ts');
      expect(fileNames).toContain('schemas.ts');
      expect(fileNames).toContain('api.ts');
    });

    it('should generate types file with correct content', () => {
      const result = generator.generate();
      const typesFile = result.files.find(f => f.name === 'types.ts');
      
      expect(typesFile).toBeDefined();
      expect(typesFile?.content).toContain('export type ApiResponse<T>');
      expect(typesFile?.content).toContain('export type Pet');
    });

    it('should generate enums file with correct content', () => {
      const result = generator.generate();
      const enumsFile = result.files.find(f => f.name === 'enums.ts');
      
      expect(enumsFile).toBeDefined();
      expect(enumsFile?.content).toContain('export enum Pet');
      expect(enumsFile?.content).toContain('AVAILABLE = "available"');
      expect(enumsFile?.content).toContain('PENDING = "pending"');
      expect(enumsFile?.content).toContain('SOLD = "sold"');
    });

    it('should generate interfaces file with correct content', () => {
      const result = generator.generate();
      const interfacesFile = result.files.find(f => f.name === 'interfaces.ts');
      
      expect(interfacesFile).toBeDefined();
      expect(interfacesFile?.content).toContain('export interface Pet');
      expect(interfacesFile?.content).toContain('id?: number');
      expect(interfacesFile?.content).toContain('name: string');
      expect(interfacesFile?.content).toContain('photoUrls: string[]');
    });

    it('should generate schemas file with correct content', () => {
      const result = generator.generate();
      const schemasFile = result.files.find(f => f.name === 'schemas.ts');
      
      expect(schemasFile).toBeDefined();
      expect(schemasFile?.content).toContain("import { z } from 'zod'");
      expect(schemasFile?.content).toContain('export const PetSchema');
      expect(schemasFile?.content).toContain('z.object({');
    });

    it('should generate API client file with correct content', () => {
      const result = generator.generate();
      const apiFile = result.files.find(f => f.name === 'api.ts');
      
      expect(apiFile).toBeDefined();
      expect(apiFile?.content).toContain('export class ApiClient');
      expect(apiFile?.content).toContain('postPet');
    });

    it('should handle empty schemas and paths', () => {
      const emptyGenerator = new CodeGenerator([], [], {
        schemas: {},
        parameters: {},
        responses: {},
        requestBodies: {}
      });
      
      const result = emptyGenerator.generate();
      expect(result.files).toBeDefined();
      expect(result.errors).toEqual([]);
    });
  });

  describe('schemaToType', () => {
    it('should convert string schema to type', () => {
      const schema: OpenAPIV3.SchemaObject = { type: 'string' };
      const result = generator['schemaToType'](schema, 'TestType');
      expect(result).toBe('export type TestType = string;');
    });

    it('should convert number schema to type', () => {
      const schema: OpenAPIV3.SchemaObject = { type: 'number' };
      const result = generator['schemaToType'](schema, 'TestType');
      expect(result).toBe('export type TestType = number;');
    });

    it('should convert boolean schema to type', () => {
      const schema: OpenAPIV3.SchemaObject = { type: 'boolean' };
      const result = generator['schemaToType'](schema, 'TestType');
      expect(result).toBe('export type TestType = boolean;');
    });

    it('should convert array schema to type', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: { type: 'string' }
      };
      const result = generator['schemaToType'](schema, 'TestType');
      expect(result).toBe('export type TestType = string[];');
    });

    it('should convert enum schema to type', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'string',
        enum: ['value1', 'value2']
      };
      const result = generator['schemaToType'](schema, 'TestType');
      expect(result).toBe('export type TestType = "value1" | "value2";');
    });
  });

  describe('schemaToZod', () => {
    it('should convert string schema to Zod', () => {
      const schema: OpenAPIV3.SchemaObject = { type: 'string' };
      const result = generator['schemaToZod'](schema, 'TestSchema');
      expect(result).toBe('export const TestSchemaSchema = z.string();');
    });

    it('should convert number schema to Zod', () => {
      const schema: OpenAPIV3.SchemaObject = { type: 'number' };
      const result = generator['schemaToZod'](schema, 'TestSchema');
      expect(result).toBe('export const TestSchemaSchema = z.number();');
    });

    it('should convert boolean schema to Zod', () => {
      const schema: OpenAPIV3.SchemaObject = { type: 'boolean' };
      const result = generator['schemaToZod'](schema, 'TestSchema');
      expect(result).toBe('export const TestSchemaSchema = z.boolean();');
    });

    it('should convert array schema to Zod', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: { type: 'string' }
      };
      const result = generator['schemaToZod'](schema, 'TestSchema');
      expect(result).toBe('export const TestSchemaSchema = z.array(z.string());');
    });

    it('should convert enum schema to Zod', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'string',
        enum: ['value1', 'value2']
      };
      const result = generator['schemaToZod'](schema, 'TestSchema');
      expect(result).toBe('export const TestSchemaSchema = z.enum(["value1", "value2"]);');
    });
  });
}); 