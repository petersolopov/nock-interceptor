const InterceptedRequest = require('./InterceptedRequest');

const createFakeRequest = (interceptCb, protocol) => (options, requestCb) => {
  return new InterceptedRequest({ options, requestCb, interceptCb, protocol });
};

const createFakeGet = (interceptCb, protocol) => (options, requestCb) => {
  const req = new InterceptedRequest({ options, requestCb, interceptCb, protocol });
  req.end();
  return req;
};

module.exports = {
  createFakeGet,
  createFakeRequest
};
