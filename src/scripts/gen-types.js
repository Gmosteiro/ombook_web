#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Load .env from project src folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const apiUrl = process.env.API_URL;
if (!apiUrl) {
  console.error('ERROR: API_URL not set in .env');
  process.exit(1);
}

const cmd = `npx openapi-typescript "${apiUrl}/v3/api-docs" -o types/openapi.ts`;
console.log('Running:', cmd);
try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to generate types:', err.message || err);
  process.exit(1);
}
