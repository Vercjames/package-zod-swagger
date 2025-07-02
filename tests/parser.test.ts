import { OpenAPIParser } from '../packages/zod-swagger/package/parser';
import { OpenAPIV3 } from 'openapi-types';

describe('OpenAPIParser', () => {
  let parser: OpenAPIParser;

  beforeEach(() => {
    parser = new OpenAPIParser();
  });

  describe('loadSpec', () => {
    it('should load OpenAPI spec from URL', async () => {
      const spec = await parser.loadSpec('https://petstore.swagger.io/v2/swagger.json');
      
      expect(spec).toBeDefined();
      expect(spec.openapi).toBeDefined();
      expect(spec.info).toBeDefined();
      expect(spec.paths).toBeDefined();
    });

    it('should throw error for invalid URL', async () => {
      await expect(parser.loadSpec('https://invalid-url.com/spec.json'))
        .rejects.toThrow('Failed to load OpenAPI spec');
    });
  });

  describe('getSchemas', () => {
    it('should return schemas from loaded spec', async () => {
      await parser.loadSpec('https://petstore.swagger.io/v2/swagger.json');
      const schemas = parser.getSchemas();
      
      expect(Array.isArray(schemas)).toBe(true);
      expect(schemas.length).toBeGreaterThan(0);
      
      // Check if Pet schema exists
      const petSchema = schemas.find(s => s.name === 'Pet');
      expect(petSchema).toBeDefined();
      expect(petSchema?.schema).toBeDefined();
    });

    it('should return empty array when no schemas', () => {
      const schemas = parser.getSchemas();
      expect(schemas).toEqual([]);
    });
  });

  describe('getPaths', () => {
    it('should return paths from loaded spec', async () => {
      await parser.loadSpec('https://petstore.swagger.io/v2/swagger.json');
      const paths = parser.getPaths();
      
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
      
      // Check if pet endpoints exist
      const petPaths = paths.filter(p => p.path.includes('/pet'));
      expect(petPaths.length).toBeGreaterThan(0);
    });

    it('should return empty array when no paths', () => {
      const paths = parser.getPaths();
      expect(paths).toEqual([]);
    });
  });

  describe('getComponents', () => {
    it('should return components from loaded spec', async () => {
      await parser.loadSpec('https://petstore.swagger.io/v2/swagger.json');
      const components = parser.getComponents();
      
      expect(components).toBeDefined();
      expect(components.schemas).toBeDefined();
      expect(typeof components.schemas).toBe('object');
    });

    it('should return empty components when no components', () => {
      const components = parser.getComponents();
      expect(components).toEqual({
        schemas: {},
        parameters: {},
        responses: {},
        requestBodies: {}
      });
    });
  });
}); 