const EventEmitter = require('events');
const http = require('http');

class MockedResponse extends http.IncomingMessage {
  constructor({ status = 200, body, headers }) {
    super(new EventEmitter());
    this.statusCode = status.toString();
    this.headers = headers;
    this.body =
      typeof body === 'object' ? Buffer.from(JSON.stringify(body)) : Buffer.from(body.toString());
  }
}

module.exports = MockedResponse;
