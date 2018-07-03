const http = require('http');
const https = require('https');

const httpRequest = http.request;
const httpsRequest = https.request;
const httpGet = http.get;
const httpsGet = https.get;

module.exports = {
  httpRequest,
  httpsRequest,
  httpGet,
  httpsGet
};
