import { OpenAPIV3 } from 'openapi-types';

export interface ZodSwaggerConfig {
  input: string; // URL or file path to OpenAPI spec
  output: string; // Output directory for generated files
  format?: 'typescript' | 'javascript';
  includeExamples?: boolean;
  includeSchemas?: boolean;
  includePaths?: boolean;
  includeComponents?: boolean;
  template?: string; // Custom template path
}

export interface GeneratedFile {
  name: string;
  content: string;
  path: string;
}

export interface SchemaInfo {
  name: string;
  schema: OpenAPIV3.SchemaObject;
  required: boolean;
  description?: string;
}

export interface PathInfo {
  path: string;
  method: string;
  operation: OpenAPIV3.OperationObject;
  parameters: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: OpenAPIV3.ResponsesObject;
}

export interface ComponentInfo {
  schemas: Record<string, OpenAPIV3.SchemaObject>;
  parameters: Record<string, OpenAPIV3.ParameterObject>;
  responses: Record<string, OpenAPIV3.ResponseObject>;
  requestBodies: Record<string, OpenAPIV3.RequestBodyObject>;
}

export interface GenerationResult {
  files: GeneratedFile[];
  schemas: SchemaInfo[];
  paths: PathInfo[];
  components: ComponentInfo;
  errors: string[];
  warnings: string[];
} 