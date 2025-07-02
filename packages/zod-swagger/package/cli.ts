#!/usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { OpenAPIParser } from './parser';
import { CodeGenerator } from './generator';
import { ZodSwaggerConfig } from './types';

const program = new Command();

program
  .name('zod-swagger')
  .description('Generate TypeScript interfaces, types, enums, and Zod schemas from OpenAPI documents')
  .version('0.1.0');

program
  .command('generate')
  .description('Generate TypeScript files from OpenAPI specification')
  .option('-i, --input <input>', 'OpenAPI specification URL or file path')
  .option('-o, --output <output>', 'Output directory for generated files')
  .option('-f, --format <format>', 'Output format (typescript|javascript)', 'typescript')
  .option('--include-examples', 'Include example data in generated files')
  .option('--include-schemas', 'Include schema definitions', true)
  .option('--include-paths', 'Include API path definitions', true)
  .option('--include-components', 'Include component definitions', true)
  .option('--template <template>', 'Custom template path')
  .action(async (options) => {
    try {
      await generateFiles(options);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize zod-swagger configuration')
  .option('-i, --input <input>', 'Default OpenAPI specification URL or file path')
  .option('-o, --output <output>', 'Default output directory', './generated')
  .action(async (options) => {
    try {
      await initConfig(options);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

async function generateFiles(options: any) {
  const config: ZodSwaggerConfig = {
    input: options.input || getConfigValue('input'),
    output: options.output || getConfigValue('output') || './generated',
    format: options.format || 'typescript',
    includeExamples: options.includeExamples || false,
    includeSchemas: options.includeSchemas !== false,
    includePaths: options.includePaths !== false,
    includeComponents: options.includeComponents !== false,
    template: options.template
  };

  if (!config.input) {
    throw new Error('Input specification is required. Use --input option or configure in package.json.');
  }

  console.log('🚀 Starting code generation...');
  console.log(`📥 Input: ${config.input}`);
  console.log(`📤 Output: ${config.output}`);

  // Create output directory if it doesn't exist
  await fs.mkdir(config.output, { recursive: true });

  // Parse OpenAPI specification
  const parser = new OpenAPIParser();
  const spec = await parser.loadSpec(config.input);
  
  console.log('✅ OpenAPI specification loaded successfully');

  // Extract components
  const schemas = parser.getSchemas();
  const paths = parser.getPaths();
  const components = parser.getComponents();

  console.log(`📊 Found ${schemas.length} schemas, ${paths.length} paths`);

  // Generate code
  const generator = new CodeGenerator(schemas, paths, components);
  const result = generator.generate();

  // Write files
  for (const file of result.files) {
    const filePath = path.join(config.output, file.name);
    await fs.writeFile(filePath, file.content, 'utf-8');
    console.log(`📝 Generated: ${file.name}`);
  }

  // Report results
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  console.log(`\n✅ Code generation completed! Generated ${result.files.length} files.`);
  console.log(`📁 Output directory: ${path.resolve(config.output)}`);
}

async function initConfig(options: any) {
  const config = {
    input: options.input || 'https://petstore.swagger.io/v2/swagger.json',
    output: options.output || './generated',
    format: 'typescript',
    includeExamples: false,
    includeSchemas: true,
    includePaths: true,
    includeComponents: true
  };

  // Create zod-swagger.config.js
  const configContent = `module.exports = ${JSON.stringify(config, null, 2)};`;
  await fs.writeFile('zod-swagger.config.js', configContent, 'utf-8');

  // Update package.json scripts
  try {
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['types:generate'] = 'zod-swagger generate';
    packageJson.scripts['types:watch'] = 'zod-swagger generate --watch';
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    console.log('✅ Updated package.json scripts');
  } catch (error) {
    console.log('⚠️  Could not update package.json scripts');
  }

  console.log('✅ zod-swagger configuration initialized!');
  console.log('📝 Created zod-swagger.config.js');
  console.log('🚀 Run "npm run types:generate" to generate your first types');
}

function getConfigValue(key: string): string | undefined {
  try {
    // Try to load from zod-swagger.config.js
    const config = require(path.resolve('zod-swagger.config.js'));
    return config[key];
  } catch (error) {
    // Try to load from package.json
    try {
      const packageJson = require(path.resolve('package.json'));
      return packageJson['zod-swagger']?.[key];
    } catch (error) {
      return undefined;
    }
  }
}

// Handle default command
if (process.argv.length === 2) {
  program.help();
}

program.parse(); 