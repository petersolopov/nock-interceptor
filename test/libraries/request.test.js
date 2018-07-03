const interceptor = require('../../lib/interceptor');
const request = require('request');

test('intercept request', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('POST');
    expect(body.equals(Buffer.from('{"foo":"bar"}'))).toBeTruthy();
    expect(url).toBe('http://www.google.com/');
    interceptor.destroy();
    done();
  });
  request.post({ url: 'http://www.google.com/', body: { foo: 'bar' }, json: true });
});

test('intercept https', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('GET');
    expect(body).toBeNull();
    expect(url).toBe('https://google.com:443/');
    interceptor.destroy();
    done();
  });
  request('https://google.com/');
});
