const { initializeDatabase } = require('./index');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migration...');
    
    await initializeDatabase();
    
    console.log('✅ Database migration completed successfully!');
    console.log('🚀 Application is ready to run.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };