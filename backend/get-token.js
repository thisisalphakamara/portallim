const https = require('https');
const http = require('http');

function login() {
  const postData = JSON.stringify({
    email: 'system.admin@limkokwing.edu.sl',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('Login successful!');
          console.log('Token:', result.token);
          console.log('\nUse this token in your Authorization header as:');
          console.log(`Authorization: Bearer ${result.token}`);
        } else {
          console.log('Login failed:', result);
        }
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(postData);
  req.end();
}

login();
