const interceptor = require('../../lib/interceptor');
const axios = require('axios');

test('intercept axios request', done => {
  interceptor.activate(({ method, headers, body, url }) => {
    expect(method).toBe('POST');
    expect(body.equals(Buffer.from('{"foo":"bar"}'))).toBeTruthy();
    expect(url).toBe('http://bit.ly/2mTM3nY');
    interceptor.destroy();
    done();
  });
  axios({
    method: 'post',
    url: 'http://bit.ly/2mTM3nY',
    data: {
      foo: 'bar'
    }
  });
});
