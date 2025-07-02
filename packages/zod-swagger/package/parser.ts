import axios from 'axios';
import { OpenAPIV3 } from 'openapi-types';
import { SchemaInfo, PathInfo, ComponentInfo } from './types';

export class OpenAPIParser {
  private spec: OpenAPIV3.Document | null = null;

  async loadSpec(input: string): Promise<OpenAPIV3.Document> {
    try {
      let specContent: string;

      if (input.startsWith('http://') || input.startsWith('https://')) {
        // Fetch from URL
        const response = await axios.get(input);
        specContent = response.data;
      } else {
        // Read from file
        const fs = await import('fs/promises');
        specContent = await fs.readFile(input, 'utf-8');
      }

      // Parse JSON or YAML
      if (input.endsWith('.json') || specContent.trim().startsWith('{')) {
        this.spec = JSON.parse(specContent);
      } else {
        // Assume YAML
        const yaml = await import('js-yaml');
        this.spec = yaml.load(specContent) as OpenAPIV3.Document;
      }

      return this.spec;
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error}`);
    }
  }

  getSchemas(): SchemaInfo[] {
    if (!this.spec?.components?.schemas) {
      return [];
    }

    return Object.entries(this.spec.components.schemas).map(([name, schema]) => ({
      name,
      schema,
      required: false,
      description: schema.description
    }));
  }

  getPaths(): PathInfo[] {
    if (!this.spec?.paths) {
      return [];
    }

    const paths: PathInfo[] = [];

    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'] as const;
      
      methods.forEach(method => {
        const operation = pathItem[method];
        if (operation) {
          paths.push({
            path,
            method,
            operation,
            parameters: pathItem.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {}
          });
        }
      });
    });

    return paths;
  }

  getComponents(): ComponentInfo {
    if (!this.spec?.components) {
      return {
        schemas: {},
        parameters: {},
        responses: {},
        requestBodies: {}
      };
    }

    return {
      schemas: this.spec.components.schemas || {},
      parameters: this.spec.components.parameters || {},
      responses: this.spec.components.responses || {},
      requestBodies: this.spec.components.requestBodies || {}
    };
  }

  getSpec(): OpenAPIV3.Document | null {
    return this.spec;
  }
} 