const http = require('http');
const { makeReply, makeRealRequest, optionsToURL, parseRawHeaders } = require('./utils');
const url = require('url');
const { format } = url;

class InterceptedRequest extends http.ClientRequest {
  constructor({ options, requestCb, interceptCb, protocol = 'http:' }) {
    const objOptions = typeof options === 'string' ? url.parse(options) : options;

    const newOptions = {
      ...objOptions,
      agent: undefined,
      createConnection: () => null
    };

    super(newOptions, requestCb);

    this.options = { ...options };

    // addition property which do not exist in ClientRequest class
    this.__interceptCb = interceptCb;
    this.__writtenBody = [];
    this.__settedHeaders = [];

    this.__protocol = protocol;
  }

  setHeader(key, value) {
    super.setHeader(key, value);

    // .setHeader is invoked in ClientRequest constructor so need check the existence
    if (!this.__settedHeaders) return;

    this.__settedHeaders.push({ key, value });
  }

  write(chunk, encoding, callback) {
    super.write(chunk, encoding, callback);
    if (!chunk) return;

    this.__writtenBody.push({ chunk, encoding });
  }

  end(chunk, encoding, callback) {
    super.end(chunk, encoding, callback);

    // call all callbacks?
    if (chunk) {
      this.__writtenBody.push({ chunk, encoding });
    }

    const { body, contentLength } = this.__writtenBody.reduce(
      (acc, { chunk, encoding }) => {
        const len = typeof chunk === 'string' ? Buffer.byteLength(chunk, encoding) : chunk.length;
        const buffer = Buffer.from(chunk, encoding);

        return {
          body: acc.body ? Buffer.concat([acc.body, buffer]) : buffer,
          contentLength: len + acc.contentLength
        };
      },
      { body: null, contentLength: 0 }
    );
    const method = this.method;

    const headers = parseRawHeaders(this._header);

    // TODO make immutable
    delete headers['Transfer-Encoding'];
    if (!headers['Content-Length']) {
      headers['Content-Length'] = String(contentLength);
    }

    const protocol = this.__protocol;
    const url = format(optionsToURL({ ...this.options, protocol }));
    const options = this.options;
    const interceptedRequest = this;
    const settedHeaders = this.__settedHeaders;
    const writtenBody = this.__writtenBody;

    this.__interceptCb(
      { method, headers, body, url, interceptedRequest },
      makeReply(interceptedRequest),
      makeRealRequest({ interceptedRequest, options, settedHeaders, writtenBody, protocol })
    );
  }
}

module.exports = InterceptedRequest;
