const MockedResponse = require('./MockedResponse');
const { URL } = require('url');
const { httpRequest, httpsRequest } = require('./realRequests');

const makeReply = interceptedRequest => ({ status, body, headers }) => {
  const res = new MockedResponse({ status, body, headers });

  interceptedRequest.emit('response', res);
  res.emit('data', res.body);
  res.emit('end');
  interceptedRequest.emit('close');
};

const makeRealRequest = context => () => {
  const { interceptedRequest, options, settedHeaders, writtenBody, protocol } = context;
  return new Promise(resolve => {
    const request = protocol === 'http:' ? httpRequest : httpsRequest;
    const realRequest = request({ ...options });

    settedHeaders.forEach(({ key, value }) => {
      realRequest.setHeader(key, value);
    });

    writtenBody.forEach(({ chunk, encoding }) => {
      realRequest.write(chunk, encoding);
    });

    realRequest.end();

    realRequest.on('response', res => {
      const { statusCode: status, headers } = res;
      let body = [];
      res.on('data', chunk => body.push(chunk));
      res.on('end', () => {
        body = Buffer.concat(body).toString();
        resolve({ status, headers, body });
      });
    });

    // catch request error so that it does not kill the process
    // error on the intercepted request is caught outside
    realRequest.on('error', err => {});

    // emit events on intercepted queries that occur on the real request
    const realRequestEmit = realRequest.emit;
    realRequest.emit = (...args) => {
      interceptedRequest.emit.apply(interceptedRequest, args);
      return realRequestEmit.apply(realRequest, args);
    };
  });
};

const optionsToURL = options => {
  if (typeof options === 'string') return new URL(options);
  if (typeof options === 'URL') return options;

  const { protocol = 'http:', path = '/', host, hostname, port } = options;

  return {
    protocol,
    port: port === 80 ? '' : port,
    hostname: host || hostname || 'localhost',
    pathname: path
  };
};

const parseRawHeaders = rawHeaders => {
  const [requestLine, ...headersLines] = rawHeaders.split('\r\n');
  return headersLines.reduce((acc, line) => {
    if (!line) return acc;

    const [key, value] = line.split(': ');

    return {
      ...acc,
      [key]: value
    };
  }, {});
};
module.exports = {
  makeReply,
  makeRealRequest,
  optionsToURL,
  parseRawHeaders
};
