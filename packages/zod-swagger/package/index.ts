export { OpenAPIParser } from './parser';
export { CodeGenerator } from './generator';
export type {
  ZodSwaggerConfig,
  GeneratedFile,
  SchemaInfo,
  PathInfo,
  ComponentInfo,
  GenerationResult
} from './types';

// Main function for programmatic usage
export async function generateFromOpenAPI(config: {
  input: string;
  output: string;
  format?: 'typescript' | 'javascript';
  includeExamples?: boolean;
  includeSchemas?: boolean;
  includePaths?: boolean;
  includeComponents?: boolean;
  template?: string;
}) {
  const parser = new OpenAPIParser();
  const spec = await parser.loadSpec(config.input);
  
  const schemas = parser.getSchemas();
  const paths = parser.getPaths();
  const components = parser.getComponents();
  
  const generator = new CodeGenerator(schemas, paths, components);
  return generator.generate();
} 