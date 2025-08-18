const { sequelize, testConnection } = require('./config');
const { 
  User, 
  TestScenario, 
  TestPlan, 
  TestCycle, 
  TestExecution, 
  Defect 
} = require('./index');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await testConnection();
    
    // Sync all models (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };