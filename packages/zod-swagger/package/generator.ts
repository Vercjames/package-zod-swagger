import { OpenAPIV3 } from 'openapi-types';
import { SchemaInfo, PathInfo, ComponentInfo, GeneratedFile, GenerationResult } from './types';

export class CodeGenerator {
  private schemas: SchemaInfo[] = [];
  private paths: PathInfo[] = [];
  private components: ComponentInfo;

  constructor(schemas: SchemaInfo[], paths: PathInfo[], components: ComponentInfo) {
    this.schemas = schemas;
    this.paths = paths;
    this.components = components;
  }

  generate(): GenerationResult {
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Generate types file
      const typesContent = this.generateTypes();
      files.push({
        name: 'types.ts',
        content: typesContent,
        path: 'types.ts'
      });

      // Generate enums file
      const enumsContent = this.generateEnums();
      if (enumsContent.trim()) {
        files.push({
          name: 'enums.ts',
          content: enumsContent,
          path: 'enums.ts'
        });
      }

      // Generate interfaces file
      const interfacesContent = this.generateInterfaces();
      files.push({
        name: 'interfaces.ts',
        content: interfacesContent,
        path: 'interfaces.ts'
      });

      // Generate Zod schemas file
      const zodContent = this.generateZodSchemas();
      files.push({
        name: 'schemas.ts',
        content: zodContent,
        path: 'schemas.ts'
      });

      // Generate API client file
      const apiContent = this.generateAPIClient();
      files.push({
        name: 'api.ts',
        content: apiContent,
        path: 'api.ts'
      });

    } catch (error) {
      errors.push(`Generation failed: ${error}`);
    }

    return {
      files,
      schemas: this.schemas,
      paths: this.paths,
      components: this.components,
      errors,
      warnings
    };
  }

  private generateTypes(): string {
    const types: string[] = [];
    
    types.push('// Generated types from OpenAPI specification');
    types.push('// This file is auto-generated, do not edit manually');
    types.push('');

    // Generate type aliases for primitive types
    types.push('// Type aliases');
    types.push('export type ApiResponse<T> = {');
    types.push('  data: T;');
    types.push('  message?: string;');
    types.push('  success: boolean;');
    types.push('};');
    types.push('');

    // Generate types from schemas
    this.schemas.forEach(schema => {
      const typeName = this.toPascalCase(schema.name);
      const typeContent = this.schemaToType(schema.schema, typeName);
      types.push(typeContent);
      types.push('');
    });

    return types.join('\n');
  }

  private generateEnums(): string {
    const enums: string[] = [];
    
    enums.push('// Generated enums from OpenAPI specification');
    enums.push('// This file is auto-generated, do not edit manually');
    enums.push('');

    this.schemas.forEach(schema => {
      if (schema.schema.enum) {
        const enumName = this.toPascalCase(schema.name);
        enums.push(`export enum ${enumName} {`);
        schema.schema.enum.forEach((value, index) => {
          const key = typeof value === 'string' ? value.toUpperCase() : `VALUE_${index}`;
          enums.push(`  ${key} = ${JSON.stringify(value)},`);
        });
        enums.push('}');
        enums.push('');
      }
    });

    return enums.join('\n');
  }

  private generateInterfaces(): string {
    const interfaces: string[] = [];
    
    interfaces.push('// Generated interfaces from OpenAPI specification');
    interfaces.push('// This file is auto-generated, do not edit manually');
    interfaces.push('');

    this.schemas.forEach(schema => {
      if (schema.schema.type === 'object' || schema.schema.properties) {
        const interfaceName = this.toPascalCase(schema.name);
        const interfaceContent = this.schemaToInterface(schema.schema, interfaceName);
        interfaces.push(interfaceContent);
        interfaces.push('');
      }
    });

    return interfaces.join('\n');
  }

  private generateZodSchemas(): string {
    const schemas: string[] = [];
    
    schemas.push('import { z } from \'zod\';');
    schemas.push('');
    schemas.push('// Generated Zod schemas from OpenAPI specification');
    schemas.push('// This file is auto-generated, do not edit manually');
    schemas.push('');

    this.schemas.forEach(schema => {
      const schemaName = this.toPascalCase(schema.name);
      const zodSchema = this.schemaToZod(schema.schema, schemaName);
      schemas.push(zodSchema);
      schemas.push('');
    });

    return schemas.join('\n');
  }

  private generateAPIClient(): string {
    const client: string[] = [];
    
    client.push('import axios, { AxiosInstance, AxiosResponse } from \'axios\';');
    client.push('import { z } from \'zod\';');
    client.push('');
    client.push('// Generated API client from OpenAPI specification');
    client.push('// This file is auto-generated, do not edit manually');
    client.push('');

    // Import generated types and schemas
    client.push('// Import generated types and schemas');
    client.push('import * as schemas from \'./schemas\';');
    client.push('import * as types from \'./types\';');
    client.push('');

    // Generate API client class
    client.push('export class ApiClient {');
    client.push('  private client: AxiosInstance;');
    client.push('');
    client.push('  constructor(baseURL: string, config?: any) {');
    client.push('    this.client = axios.create({');
    client.push('      baseURL,');
    client.push('      ...config');
    client.push('    });');
    client.push('  }');
    client.push('');

    // Generate methods for each path
    this.paths.forEach(path => {
      const methodName = this.generateMethodName(path.path, path.method);
      const methodContent = this.generateAPIMethod(path, methodName);
      client.push(methodContent);
      client.push('');
    });

    client.push('}');

    return client.join('\n');
  }

  private schemaToType(schema: OpenAPIV3.SchemaObject, name: string): string {
    if (schema.type === 'string') {
      return `export type ${name} = string;`;
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return `export type ${name} = number;`;
    } else if (schema.type === 'boolean') {
      return `export type ${name} = boolean;`;
    } else if (schema.type === 'array') {
      const itemType = schema.items ? this.getTypeFromSchema(schema.items) : 'any';
      return `export type ${name} = ${itemType}[];`;
    } else if (schema.type === 'object' || schema.properties) {
      return this.schemaToInterface(schema, name);
    } else if (schema.enum) {
      const enumValues = schema.enum.map(v => JSON.stringify(v)).join(' | ');
      return `export type ${name} = ${enumValues};`;
    }
    
    return `export type ${name} = any;`;
  }

  private schemaToInterface(schema: OpenAPIV3.SchemaObject, name: string): string {
    const properties: string[] = [];
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propSchema]) => {
        const propType = this.getTypeFromSchema(propSchema);
        const isRequired = schema.required?.includes(propName) ?? false;
        const optional = isRequired ? '' : '?';
        properties.push(`  ${propName}${optional}: ${propType};`);
      });
    }

    return `export interface ${name} {\n${properties.join('\n')}\n}`;
  }

  private schemaToZod(schema: OpenAPIV3.SchemaObject, name: string): string {
    if (schema.type === 'string') {
      return `export const ${name}Schema = z.string();`;
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return `export const ${name}Schema = z.number();`;
    } else if (schema.type === 'boolean') {
      return `export const ${name}Schema = z.boolean();`;
    } else if (schema.type === 'array') {
      const itemSchema = schema.items ? this.getZodFromSchema(schema.items) : 'z.any()';
      return `export const ${name}Schema = z.array(${itemSchema});`;
    } else if (schema.type === 'object' || schema.properties) {
      return this.schemaToZodObject(schema, name);
    } else if (schema.enum) {
      const enumValues = schema.enum.map(v => JSON.stringify(v));
      return `export const ${name}Schema = z.enum([${enumValues.join(', ')}]);`;
    }
    
    return `export const ${name}Schema = z.any();`;
  }

  private schemaToZodObject(schema: OpenAPIV3.SchemaObject, name: string): string {
    const properties: string[] = [];
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propSchema]) => {
        const propZod = this.getZodFromSchema(propSchema);
        const isRequired = schema.required?.includes(propName) ?? false;
        properties.push(`  ${propName}: ${propZod}${isRequired ? '' : '.optional()'},`);
      });
    }

    return `export const ${name}Schema = z.object({\n${properties.join('\n')}\n});`;
  }

  private getTypeFromSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
    if ('$ref' in schema) {
      const refName = this.getRefName(schema.$ref);
      return this.toPascalCase(refName);
    }

    if (schema.type === 'string') {
      return 'string';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return 'number';
    } else if (schema.type === 'boolean') {
      return 'boolean';
    } else if (schema.type === 'array') {
      const itemType = schema.items ? this.getTypeFromSchema(schema.items) : 'any';
      return `${itemType}[]`;
    } else if (schema.type === 'object' || schema.properties) {
      return 'object';
    }

    return 'any';
  }

  private getZodFromSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
    if ('$ref' in schema) {
      const refName = this.getRefName(schema.$ref);
      return `${this.toPascalCase(refName)}Schema`;
    }

    if (schema.type === 'string') {
      return 'z.string()';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return 'z.number()';
    } else if (schema.type === 'boolean') {
      return 'z.boolean()';
    } else if (schema.type === 'array') {
      const itemZod = schema.items ? this.getZodFromSchema(schema.items) : 'z.any()';
      return `z.array(${itemZod})`;
    } else if (schema.type === 'object' || schema.properties) {
      return 'z.object({})'; // Simplified for now
    }

    return 'z.any()';
  }

  private generateMethodName(path: string, method: string): string {
    const cleanPath = path.replace(/[{}]/g, '').replace(/\//g, '_');
    return `${method}${this.toPascalCase(cleanPath)}`;
  }

  private generateAPIMethod(path: PathInfo, methodName: string): string {
    const params = path.parameters.map(p => p.name).join(', ');
    const hasBody = !!path.requestBody;
    
    return `  async ${methodName}(${params}${hasBody ? ', data?: any' : ''}): Promise<AxiosResponse<any>> {
    return this.client.${path.method}('${path.path}'${hasBody ? ', data' : ''});
  }`;
  }

  private getRefName(ref: string): string {
    return ref.split('/').pop() || 'Unknown';
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/^[0-9]/, '_$&');
  }
} 