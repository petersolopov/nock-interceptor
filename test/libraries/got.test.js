const interceptor = require('../../lib/interceptor');
const got = require('got');

test('intercept fetch request', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('GET');
    expect(body).toBeNull();
    expect(url).toBe('http://httpbin.org/post');
    interceptor.destroy();
    done();
  });
  got('http://httpbin.org/post');
});
