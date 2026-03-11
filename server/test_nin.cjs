const https = require('https');

const data = JSON.stringify({ number: "12345678901" });

const options = {
    hostname: 'api.everify.com.ng',
    port: 443,
    path: '/nin/',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer 3e1a36c2e2e912c354e714da6637eb98b19572e5f693fb7a62403dd95d24d101',
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error("Connection Error:", error);
});

req.write(data);
req.end();
