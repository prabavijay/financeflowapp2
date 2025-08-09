#!/usr/bin/env node

// Finance Flow Database Setup Script
// Creates PostgreSQL database and runs schema
// Reference: ../ENVIRONMENT_NOTES.md

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration from ENVIRONMENT_NOTES.md
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'finance',
  user: process.env.DB_USER || 'luxmiuser',
  password: process.env.DB_PASSWORD || 'luxmi'
};

// Superuser configuration for database creation
const SUPER_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // Connect to default postgres database
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'luxmi' // From ENVIRONMENT_NOTES.md
};

async function createDatabaseAndUser() {
  const client = new Client(SUPER_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL as superuser');

    // Check if database exists
    const dbResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_CONFIG.database]
    );

    if (dbResult.rows.length === 0) {
      console.log(`📦 Creating database '${DB_CONFIG.database}'...`);
      await client.query(`CREATE DATABASE ${DB_CONFIG.database}`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database '${DB_CONFIG.database}' already exists`);
    }

    // Check if user exists
    const userResult = await client.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [DB_CONFIG.user]
    );

    if (userResult.rows.length === 0) {
      console.log(`👤 Creating user '${DB_CONFIG.user}'...`);
      await client.query(`CREATE USER ${DB_CONFIG.user} WITH PASSWORD '${DB_CONFIG.password}'`);
      console.log('✅ User created successfully');
    } else {
      console.log(`✅ User '${DB_CONFIG.user}' already exists`);
    }

    // Grant privileges
    console.log(`🔐 Granting privileges to '${DB_CONFIG.user}'...`);
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${DB_CONFIG.database} TO ${DB_CONFIG.user}`);
    await client.query(`GRANT ALL ON SCHEMA public TO ${DB_CONFIG.user}`);
    console.log('✅ Privileges granted successfully');

  } catch (error) {
    console.error('❌ Error creating database/user:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function runSchema() {
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log(`✅ Connected to database '${DB_CONFIG.database}'`);

    // Read and execute schema
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = await readFile(schemaPath, 'utf8');
    
    console.log('📋 Running database schema...');
    await client.query(schema);
    console.log('✅ Database schema created successfully');

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    console.log(`\n✅ Database setup complete! (${tablesResult.rows.length} tables created)`);

  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function testConnection() {
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Testing database connection...');
    
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Test user count
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users in database:', userCount.rows[0].count);
    
    console.log('✅ Database connection test successful');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('\n🚀 Finance Flow Database Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`🗄️  Database: ${DB_CONFIG.database}`);
  console.log(`👤 User: ${DB_CONFIG.user}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Create database and user
    console.log('📋 Step 1: Create database and user');
    await createDatabaseAndUser();
    
    // Step 2: Run schema
    console.log('\n📋 Step 2: Create database schema');
    await runSchema();
    
    // Step 3: Test connection
    console.log('\n📋 Step 3: Test database connection');
    await testConnection();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend server: npm run dev');
    console.log('   2. Start frontend: npm run dev (in parent directory)');
    console.log('   3. Test API endpoints at http://localhost:3001');
    console.log('\n🔗 Connection string:');
    console.log(`   postgresql://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    
  } catch (error) {
    console.error('\n💥 Database setup failed!');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your .env file configuration');
    console.log('   3. Verify superuser credentials');
    process.exit(1);
  }
}

// Run the setup
main();