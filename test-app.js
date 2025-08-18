const http = require('http');

console.log('🧪 Testing Application Testing Suite...');

// Test server connectivity
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.token) {
            resolve('✅ Server is responding and authentication works');
          } else {
            reject('❌ Server responded but no token received');
          }
        } catch (e) {
          reject('❌ Invalid JSON response from server');
        }
      });
    });

    req.on('error', (err) => {
      reject(`❌ Server connection failed: ${err.message}`);
    });

    req.write(JSON.stringify({
      username: 'admin',
      password: 'password123'
    }));
    req.end();
  });
};

// Test client connectivity
const testClient = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 200) {
        resolve('✅ Client is responding');
      } else {
        reject(`❌ Client responded with status ${res.statusCode}`);
      }
    });

    req.on('error', (err) => {
      reject(`❌ Client connection failed: ${err.message}`);
    });

    req.end();
  });
};

// Run tests
const runTests = async () => {
  console.log('\n🔧 Testing Backend Server...');
  try {
    const serverResult = await testServer();
    console.log(serverResult);
  } catch (error) {
    console.log(error);
  }

  console.log('\n📱 Testing Frontend Client...');
  try {
    const clientResult = await testClient();
    console.log(clientResult);
  } catch (error) {
    console.log(error);
  }

  console.log('\n🎯 Application Status:');
  console.log('📱 Frontend: http://localhost:3000');
  console.log('🔧 Backend: http://localhost:5000');
  console.log('🔑 Login: admin / password123');
  console.log('\n✨ Application Testing Suite is ready!');
};

runTests();