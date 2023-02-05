import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

const typeOf = (obj) => {
	return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
};

class Request {
	constructor(url, options) {
		this.options = { ...options };

		if (url) this.options.url = new URL(url);
		if (options?.url) this.options.url = new URL(options.url);

		this.options.query = options?.query;
		if (options?.path)
			this.options.url.pathname = join(this.options.url.pathname, options.path);
		this.options.method = options?.method;
		this.options.headers = options?.headers ?? {};
		this.options.body = options?.body;
		this.options.timeout = options?.timeout;
		this.options.maxRedirects = options?.maxRedirects; // TODO: Implement redirects
		this.options.response = options?.response;
		this.options.maxSize = options?.maxSize;
		return this;
	}

	set(options) {
		if (options?.url) this.options.url = new URL(options.url);

		this.options.query = options?.query;
		if (options?.path)
			this.options.url.pathname = join(this.options.url.pathname, options.path);
		this.options.method = options?.method;
		this.options.headers = options?.headers ?? {};
		this.options.body = options?.body;
		this.options.timeout = options?.timeout;
		this.options.maxRedirects = options?.maxRedirects;
		this.options.response = options?.response;
		this.options.maxSize = options?.maxSize;
		return this;
	}

	url(option) {
		this.options.url = new URL(option);

		return this;
	}

	path(option) {
		this.options.url.pathname = join(this.options.url.pathname, option);

		return this;
	}

	query(option) {
		if (typeOf(option) === 'object') {
			this.options.query = { ...option, ...this.options.query };
		} else if (typeOf(option) === 'function') {
			this.options.query = { ...option, ...option(new Query(this)).toJSON() };
		}
		return this;
	}

	body(option) {
		this.options.body = option;

		return this;
	}

	timeout(option) {
		this.options.timeout = option;
		return this;
	}

	maxRedirects(option) {
		this.options.maxRedirects = option;
		return this;
	}

	response(option) {
		this.options.response = option;

		return this;
	}

	maxSize(option) {
		this.options.maxSize = option;

		return this;
	}

	headers(option) {
		if (typeOf(option) === 'object') {
			this.options.headers = { ...option, ...this.options.headers };
		} else if (typeOf(option) === 'function') {
			this.options.headers = {
				...option,
				...option(new Headers(this)).toJSON(),
			};
		}
		return this;
	}

	send() {
		return new Promise((resolve, reject) => {
			if (this.options.body) {
				if (!this.options.headers.hasOwnProperty('content-type')) {
					if (typeOf(this.options.body) === 'object') {
						this.options.body = JSON.stringify(this.options.body);
						this.options.headers['content-type'] = 'application/json';
					}
				}

				if (!this.options.headers.hasOwnProperty('content-length')) {
					this.options.headers['content-length'] = Buffer.byteLength(
						this.options.body
					);
				}
			}

			const url = this.options.url;

			if (!url) throw new Error('No URL provided to the request');

			const options = {
				hostname: url.hostname.replace('[', '').replace(']', ''),
				port: url.port,
				path: `${url.pathname}${
					this.options.query ? new Query(this.options.query) : ''
				}`,
				method: this.options.method ? this.options.method.toUpperCase() : 'GET',
				headers: this.options.headers,
			};

			let response;
			let request;

			const resHandler = (stream) => {
				if (this.options.response == 'stream') {
					resolve(stream);
				} else {
					response = new ResponseData(stream, options, {
						responseType: this.options.response ?? 'full',
						contentTypeHeader: stream.headers['content-type'],
					});

					stream.on('error', (error) => {
						reject(error);
					});

					stream.on('aborted', () => {
						reject(new Error('Server aborted request'));
					});

					stream.on('data', (chunk) => {
						response.addChunk(chunk);

						const byteLength = response.size();
						if (byteLength > this.options.maxSize) {
							throw new Error(
								'Body over maximum size: ' + this.options.maxSize
							);
						}
					});

					stream.on('end', () => {
						resolve(response.toJSON());
					});
				}
			};

			if (url.protocol === 'http:') {
				request = httpRequest(options, resHandler);
			} else if (url.protocol === 'https:') {
				request = httpsRequest(options, resHandler);
			}

			if (this.options.timeout) {
				request.setTimeout(this.options.timeout, () => {
					request.abort();

					if (this.options.response !== 'stream') {
						reject(new Error('Timeout reached'));
					}
				});
			}

			request.on('error', (error) => {
				reject(error);
			});

			if (this.options.body) request.write(this.options.body);

			request.end();
		});
	}
}

class Headers {
	constructor() {
		this.headers = new Map();

		return this;
	}

	add(options) {
		if (typeOf(options) === 'object') {
			for (let item in options) {
				this.headers.set(item, options[item]);
			}
		} else {
			throw new Error('Invalid headers');
		}

		return this;
	}

	remove(name) {
		this.headers.delete(name);

		return this;
	}

	set(...options) {
		if (typeOf(options[0]) === 'object') {
			this.headers.set(options[0].name, options[0].value);
		} else if (typeOf(options[0]) === 'string') {
			this.headers.set(options[0], options[1]);
		} else {
			throw new Error('Invalid headers');
		}

		return this;
	}

	clear(name) {
		this.headers = new Map();

		return this;
	}

	toJSON() {
		return Object.fromEntries(this.headers);
	}

	get(name) {
		return this.headers.get(name);
	}

	toString() {
		const JSONHeaders = this.toJSON();
		let headers = [];
		for (let item in JSONHeaders) {
			headers.push(`${item}: ${JSONHeaders[item]}`);
		}
		return headers.join('\r');
	}
}

class Query {
	constructor() {
		this.query = new Map();

		return this;
	}

	add(options) {
		if (typeOf(options) === 'object') {
			for (let item in options) {
				this.query.set(item, options[item]);
			}
		} else {
			throw new Error('Invalid query');
		}

		return this;
	}

	remove(name) {
		this.query.delete(name);

		return this;
	}

	set(...options) {
		if (typeOf(options[0]) === 'object') {
			this.query.set(options[0].name, options[0].value);
		} else if (typeOf(options[0]) === 'string') {
			this.query.set(options[0], options[1]);
		} else {
			throw new Error('Invalid query');
		}

		return this;
	}

	clear(name) {
		this.query = new Map();

		return this;
	}

	toJSON() {
		return Object.fromEntries(this.query);
	}

	get(name) {
		return this.query.get(name);
	}

	toString() {
		const queryJSON = this.toJSON();
		let query = [];

		for (let item in queryJSON) {
			query.push(`${item}=${queryJSON[item]}`);
		}

		if (query.length === 0) return '';
		return '?' + query.join('&');
	}
}

class ResponseData {
	constructor(res, req, options) {
		this.res = res;
		this.responseType = options.responseType ?? 'full';
		this.req = req;
		this.headers = res.headers;
		this.statusCode = res.statusCode;
		this.statusMessage = res.statusMessage;
		this.res = res;
		this.contentTypeHeader = options.contentTypeHeader;
		this.body = options.responseType === 'bufferArray' ? [] : Buffer.alloc(0);
	}

	addChunk(chunk) {
		if (this.responseType === 'bufferArray') {
			this.body.push(chunk);
		} else {
			this.body = Buffer.concat([this.body, chunk]);
		}
	}

	toJSON() {
		if (this.responseType === 'full') {
			return {
				res: this.res,
				req: this.req,
				headers: this.headers,
				statusCode: this.statusCode,
				statusMessage: this.statusMessage,
				body: this.body,
			};
		} else if (this.responseType === 'json') {
			return JSON.parse(this.body);
		} else if (this.responseType === 'text') {
			return this.body.toString('utf8');
		} else if (this.responseType === 'buffer') {
			return Buffer.from(this.body, 'utf8');
		} else if (this.responseType === 'arrayBuffer') {
			return new Uint8Array(this.body).buffer;
		} else if (this.responseType === 'bufferArray') {
			return this.body;
		} else if (this.responseType === 'blob') {
			return new Blob(this.body, {
				type: this.contentTypeHeader.split(';')[0],
			});
		} else {
			throw new Error('Invalid response type');
		}
	}

	size() {
		return Buffer.byteLength(this.body);
	}

	data = () => {
		return this.body;
	};
}
export { Request, Headers, Query, ResponseData };
