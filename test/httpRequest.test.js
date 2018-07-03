const interceptor = require('../lib/interceptor');
const http = require('http');
const fs = require('fs');

test('intercept post request', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('POST');
    expect(body.equals(Buffer.from('hi1hi2hi31'))).toBeTruthy();
    expect(url).toBe('http://www.google.com/upload');
    interceptor.destroy();
    done();
  });

  const postData1 = 'hi1';
  const postData2 = Buffer.from('hi2');
  const postData3 = 'hi3';

  const options = {
    hostname: 'www.google.com',
    port: 80,
    path: '/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData1) * 3
    }
  };

  const req = http.request(options);

  // write data to request body
  req.write(postData1);
  req.write(postData2);
  req.write(postData3);
  req.end('1');
});

test('intercept request with custom header', done => {
  interceptor.activate(({ method, headers, body, url, req }) => {
    expect(method).toBe('POST');
    expect(body.equals(Buffer.from('key2=value日本'))).toBeTruthy();
    expect(headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength('key2=value日本').toString(),
        'Set-Cookie': 'type=ninja,language=javascript'
      })
    );
    expect(url).toBe('http://www.google.com:3000/intercepted');
    interceptor.destroy();
    done();
  });
  const postData1 = 'key2';
  const postData2 = Buffer.from('=value日本');

  const options = {
    hostname: 'www.google.com',
    path: '/intercepted',
    port: 3000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  const req = http.request(options);
  req.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
  req.write(postData1);
  req.write(postData2);
  req.end();
});

test('intercept stream request. pipe() works', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('POST');
    expect(url).toBe('http://www.google.com:3000/intercepted');
    const file = fs.readFileSync(__dirname + '/img/nodejs.png');
    expect(file.equals(body)).toBeTruthy();
    interceptor.destroy();
    done();
  });
  const options = {
    hostname: 'www.google.com',
    path: '/intercepted',
    port: 3000,
    method: 'POST'
  };
  const req = http.request(options);
  const stream = fs.createReadStream(__dirname + '/img/nodejs.png');
  stream.pipe(req);
});
