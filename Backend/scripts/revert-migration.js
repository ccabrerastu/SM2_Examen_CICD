#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Migration directory path
const migrationsDir = path.join(__dirname, '..', 'src', 'infrastructure', 'database', 'migrations');

console.log('Reverting migration and removing migration file...');

// First, revert the migration in the database
const revertCommand = 'typeorm-ts-node-commonjs migration:revert -d ormconfig.ts';

exec(revertCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error reverting migration: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }

  console.log(stdout);

  // Get the most recent migration file
  try {
    const files = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts'))
      .sort((a, b) => {
        // Extract timestamp from filename
        const timestampA = parseInt(a.split('-')[0]);
        const timestampB = parseInt(b.split('-')[0]);
        return timestampB - timestampA; // Sort in descending order (newest first)
      });

    if (files.length > 0) {
      const latestMigration = files[0];
      const migrationPath = path.join(migrationsDir, latestMigration);

      // Remove the migration file
      fs.unlinkSync(migrationPath);
      console.log(`Migration file removed: ${latestMigration}`);
      console.log('Migration reverted successfully and file deleted!');
    } else {
      console.log('No migration files found to delete.');
    }
  } catch (err) {
    console.error(`Error removing migration file: ${err.message}`);
  }
});
