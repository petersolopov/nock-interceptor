const interceptor = require('../../lib/interceptor');
const fetch = require('node-fetch');

test('intercept fetch request', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('POST');
    expect(body.equals(Buffer.from('a=1'))).toBeTruthy();
    expect(url).toBe('http://httpbin.org/post');
    interceptor.destroy();
    done();
  });
  fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' });
});
