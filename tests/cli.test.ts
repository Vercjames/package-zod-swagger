import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

describe('CLI', () => {
  const cliPath = path.resolve(__dirname, '../packages/zod-swagger/dist/package/cli.js');
  const testOutputDir = path.resolve(__dirname, './test-output');

  beforeAll(async () => {
    // Ensure test output directory exists
    try {
      await fs.mkdir(testOutputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  afterAll(async () => {
    // Clean up test output directory
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  const runCLI = (args: string[]): Promise<{ code: number; stdout: string; stderr: string }> => {
    return new Promise((resolve) => {
      const child = spawn('node', [cliPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          code: code || 0,
          stdout,
          stderr
        });
      });
    });
  };

  describe('help', () => {
    it('should show help when no arguments provided', async () => {
      const result = await runCLI([]);
      
      expect(result.stdout).toContain('Usage: zod-swagger');
      expect(result.stdout).toContain('Generate TypeScript interfaces, types, enums, and Zod schemas from OpenAPI documents');
    });

    it('should show help with --help flag', async () => {
      const result = await runCLI(['--help']);
      
      expect(result.stdout).toContain('Usage: zod-swagger');
      expect(result.stdout).toContain('Generate TypeScript interfaces, types, enums, and Zod schemas from OpenAPI documents');
    });
  });

  describe('generate command', () => {
    it('should generate files from Petstore API', async () => {
      const result = await runCLI([
        'generate',
        '-i', 'https://petstore.swagger.io/v2/swagger.json',
        '-o', testOutputDir
      ]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Starting code generation');
      expect(result.stdout).toContain('OpenAPI specification loaded successfully');
      expect(result.stdout).toContain('Code generation completed');

      // Check if files were generated
      const files = await fs.readdir(testOutputDir);
      expect(files).toContain('types.ts');
      expect(files).toContain('interfaces.ts');
      expect(files).toContain('schemas.ts');
      expect(files).toContain('api.ts');
    });

    it('should fail with invalid input URL', async () => {
      const result = await runCLI([
        'generate',
        '-i', 'https://invalid-url.com/spec.json',
        '-o', testOutputDir
      ]);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Error:');
    });

    it('should fail without input specification', async () => {
      const result = await runCLI([
        'generate',
        '-o', testOutputDir
      ]);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Input specification is required');
    });
  });

  describe('init command', () => {
    const testConfigPath = path.resolve(__dirname, './zod-swagger.config.js');

    afterEach(async () => {
      // Clean up config file after each test
      try {
        await fs.unlink(testConfigPath);
      } catch (error) {
        // File might not exist
      }
    });

    it('should initialize configuration file', async () => {
      const result = await runCLI([
        'init',
        '-i', 'https://petstore.swagger.io/v2/swagger.json',
        '-o', './generated'
      ]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('zod-swagger configuration initialized');
      expect(result.stdout).toContain('Created zod-swagger.config.js');

      // Check if config file was created
      const configExists = await fs.access(testConfigPath).then(() => true).catch(() => false);
      expect(configExists).toBe(true);

      // Check config content
      const configContent = await fs.readFile(testConfigPath, 'utf-8');
      expect(configContent).toContain('https://petstore.swagger.io/v2/swagger.json');
      expect(configContent).toContain('./generated');
    });

    it('should use default values when not provided', async () => {
      const result = await runCLI(['init']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('zod-swagger configuration initialized');

      // Check if config file was created with defaults
      const configExists = await fs.access(testConfigPath).then(() => true).catch(() => false);
      expect(configExists).toBe(true);

      const configContent = await fs.readFile(testConfigPath, 'utf-8');
      expect(configContent).toContain('https://petstore.swagger.io/v2/swagger.json');
      expect(configContent).toContain('./generated');
    });
  });

  describe('version', () => {
    it('should show version with --version flag', async () => {
      const result = await runCLI(['--version']);
      
      expect(result.stdout).toContain('0.1.0');
    });
  });
}); 