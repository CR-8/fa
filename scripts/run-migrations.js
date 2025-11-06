#!/usr/bin/env node

/**
 * Supabase Migration Runner
 *
 * This script helps you run the database migrations for the FashionAI app.
 *
 * Prerequisites:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login to Supabase: supabase login
 * 3. Link your project: supabase link --project-ref YOUR_PROJECT_REF
 *
 * Usage:
 * node scripts/run-migrations.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Use the CORRECT migration file with profiles table and auth trigger
const migrationFile = path.join(__dirname, '..', 'supabase-auth-credits-migration.sql')

console.log('🚀 Starting Supabase migration...')
console.log('📌 Using: supabase-auth-credits-migration.sql (profiles + credits system)\n')

try {
  // Check if migration file exists
  if (!fs.existsSync(migrationFile)) {
    throw new Error('Migration file not found: supabase-auth-credits-migration.sql')
  }

  // Read the migration SQL
  const migrationSQL = fs.readFileSync(migrationFile, 'utf8')
  console.log('📄 Migration file loaded successfully')
  console.log(`   File size: ${(migrationSQL.length / 1024).toFixed(2)} KB`)
  console.log(`   Lines: ${migrationSQL.split('\n').length}\n`)

  // Write to a temporary file for easy copying
  const tempFile = path.join(__dirname, '..', 'temp-migration-to-run.sql')
  fs.writeFileSync(tempFile, migrationSQL)
  console.log(`💾 Migration saved to: temp-migration-to-run.sql\n`)

  console.log('=' .repeat(70))
  console.log('📝 MANUAL MIGRATION STEPS:')
  console.log('=' .repeat(70))
  console.log('\n1. Go to Supabase Dashboard: https://supabase.com/dashboard')
  console.log('   Project: gnfrjpvkmnwjtwooluds')
  console.log('\n2. Click "SQL Editor" in the left sidebar')
  console.log('\n3. Click "New Query"')
  console.log('\n4. Copy contents of: supabase-auth-credits-migration.sql')
  console.log('   OR use the temp-migration-to-run.sql file')
  console.log('\n5. Paste into SQL Editor')
  console.log('\n6. Click "Run" (or press Ctrl+Enter)')
  console.log('\n7. Wait for "Success" message')
  console.log('\n8. Verify tables created:')
  console.log('   - profiles ✓')
  console.log('   - user_credits ✓')
  console.log('   - generation_history ✓')
  console.log('   - api_keys ✓')
  console.log('\n9. (Optional) Drop old table:')
  console.log('   DROP TABLE IF EXISTS user_profiles CASCADE;')
  console.log('\n' + '=' .repeat(70))
  console.log('\n✅ Migration file ready! Follow the steps above.')
  console.log('📖 See MIGRATION_GUIDE.md for detailed instructions and troubleshooting.\n')

} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}