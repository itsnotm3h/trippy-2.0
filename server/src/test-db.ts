import sequelize from "./config/db";

const checkConnection = async () => {
  try {
    console.log('--- 🛡️ Trippy 2.0 Database Test ---');
    console.log('Attempting to authenticate...');

    // .authenticate() tests the connection by running a simple 'SELECT 1+1'
    await sequelize.authenticate();
    
    console.log('✅ Success! Connection established.');

    // Let's verify exactly which database and user we are using
    const [results]: any = await sequelize.query("SELECT USER() as user, DATABASE() as db");
    console.log(`👤 Logged in as: ${results[0].user}`);
    console.log(`📂 Database name: ${results[0].db}`);

  } catch (error: any) {
    console.error('❌ Connection Failed!');
    console.error('Error Code:', error.parent?.code || error.name);
    console.error('Message:', error.message);
    
    if (error.parent?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Tip: Check if your DB_PASSWORD in .env matches your MariaDB root password.');
    }
  } finally {
    // Always close the connection so the script can exit
    await sequelize.close();
    process.exit();
  }
};

checkConnection();