#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Get the migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required');
  console.log('Usage: npm run migration:generate <MigrationName>');
  process.exit(1);
}

// Build the typeorm command
const command = `typeorm-ts-node-commonjs migration:generate src/infrastructure/database/migrations/${migrationName} -d ormconfig.ts`;

console.log(`Generating migration: ${migrationName}`);
console.log(`Command: ${command}`);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }

  console.log(stdout);
  console.log(`Migration ${migrationName} generated successfully!`);
});
