const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const http = require('http');
const interceptor = require('../index');

jest.setTimeout(30000);

let server = null;
let app = null;

beforeAll(() => {
  app = new Koa();
  app.use(bodyParser());
  server = app.listen(3000);
});

test('passthrough', done => {
  interceptor.activate(({ method, headers, body, url, req }, reply, passthrough) => {
    passthrough();
  });

  app.use(ctx => {
    expect(ctx.headers).toEqual(
      expect.objectContaining({
        'content-type': 'application/x-www-form-urlencoded',
        'set-cookie': ['type=ninja,language=javascript']
      })
    );
    ctx.body = ctx.request.body;
  });

  app.on('error', err => {
    throw new Error(err);
  });

  const postData1 = 'key2';
  const postData2 = Buffer.from('=value日本');

  const options = {
    hostname: 'localhost',
    path: '/intercepted',
    port: 3000,
    method: 'POST',
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
      expect(statusCode).toBe(200);
      expect(body).toBe('{"key2":"value日本"}');
      done();
    });
  });

  req.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
  req.write(postData1);
  req.write(postData2);
  req.end();
});

afterAll(() => {
  server.close();
});
