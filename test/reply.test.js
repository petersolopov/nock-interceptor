const http = require('http');
const interceptor = require('../index');

test('reply', done => {
  interceptor.activate(({ method, headers, body, url, req }, reply) => {
    expect(method).toBe('GET');
    expect(url).toBe('http://www.google.com:3000/intercepted');
    reply({ status: 200, body: 'hi!' });
  });

  const options = {
    hostname: 'www.google.com',
    path: '/intercepted',
    port: 3000,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  const req = http.request(options, res => {
    const { statusCode } = res;
    let body = [];
    res.on('data', chunk => body.push(chunk));
    res.on('end', () => {
      body = Buffer.concat(body).toString();
      expect(statusCode).toBe('200');
      expect(body).toBe('hi!');
      done();
    });
  });
  req.end();
});
