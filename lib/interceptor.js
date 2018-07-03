const http = require('http');
const https = require('https');
const realRequests = require('./realRequests');
const { createFakeGet, createFakeRequest } = require('./fakeRequests');

const httpsProtocol = 'https:';

function activate(cb) {
  http.get = createFakeGet(cb);
  http.request = createFakeRequest(cb);
  https.get = createFakeGet(cb, httpsProtocol);
  https.request = createFakeRequest(cb, httpsProtocol);
}

function destroy() {
  http.get = realRequests.httpGet;
  http.request = realRequests.httpRequest;
  https.get = realRequests.httpsGet;
  https.request = realRequests.httpsRequest;
}

module.exports = {
  activate,
  destroy
};
