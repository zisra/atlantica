import { join, isAbsolute } from 'node:path';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

import typeOf from '../util/typeOf.js';
import ResponseData from './ResponseData.js';
import Query from './Query.js';
import Headers from './Headers.js';

export default class {
	constructor(url, options) {
		this.options = { ...options };

		if (url) this.options.url = new URL(url);
		this.set(options);
		return this;
	}

	set(options) {
		if (options?.url) this.options.url = new URL(options.url);
		if (options?.path)
			this.options.url.pathname = join(
				this.options.url.pathname,
				options.path
			);
		if (options?.query) this.options.query = options.query;
		if (options?.method) this.options.method = options.method;
		if (options?.body) this.options.body = options.body;
		if (options?.headers) {
			this.options.headers = options.headers;
		} else {
			this.options.headers = {};
		}
		if (options?.timeout) this.options.timeout = options.timeout;
		if (options?.response) this.options.response = options.response;
		if (options?.maxRedirects || options?.maxRedirects === 0)
			this.options.maxRedirects = options.maxRedirects;
		if (options?.maxSize || options?.maxSize === 0)
			this.options.maxSize = options.maxSize;
		if (options?.rootOptions)
			this.options.rootOptions = options.rootOptions;
		return this;
	}

	get(url, options) {
		this.options.method = 'get';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	head(url, options) {
		this.options.method = 'head';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	post(url, options) {
		this.options.method = 'post';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	put(url, options) {
		this.options.method = 'put';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	delete(url, options) {
		this.options.method = 'delete';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	connect(url, options) {
		this.options.method = 'connect';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	options(url, options) {
		this.options.method = 'options';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	trace(url, options) {
		this.options.method = 'trace';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	patch(url, options) {
		this.options.method = 'patch';
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
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
			this.options.query = option(new Query(this.options.query)).toJSON();
		}
		return this;
	}

	method(option) {
		this.options.method = option;
		return this;
	}

	body(option) {
		this.options.body = option;
		return this;
	}

	headers(option) {
		if (typeOf(option) === 'object') {
			this.options.headers = { ...option, ...this.options.headers };
		} else if (typeOf(option) === 'function') {
			this.options.headers = option(
				new Headers(this.options.headers)
			).toJSON();
		}
		return this;
	}

	timeout(option) {
		this.options.timeout = option;
		return this;
	}

	response(option) {
		this.options.response = option;
		return this;
	}

	maxRedirects(option) {
		this.options.maxRedirects = option;
		return this;
	}

	maxSize(option) {
		this.options.maxSize = option;
		return this;
	}

	rootOptions(option) {
		this.options.rootOptions = option;
		return this;
	}

	send() {
		return new Promise((resolve, reject) => {
			if (this.options.body) {
				if (!this.options.headers['content-type']) {
					if (typeOf(this.options.body) === 'object') {
						this.options.body = JSON.stringify(this.options.body);
						this.options.headers['content-type'] =
							'application/json';
					}
				}

				if (!this.options.headers['content-length']) {
					this.options.headers['content-length'] = Buffer.byteLength(
						this.options.body
					);
				}
			}

			const url = this.options.url;
			if (!url) throw new Error('No URL provided to the request');

			let options = {
				hostname: url.hostname.replace('[', '').replace(']', ''),
				port: url.port,
				path: `${url.pathname}${
					this.options.query
						? new Query(this.options.query).toString()
						: ''
				}`,
				method: this.options.method
					? this.options.method.toUpperCase()
					: 'GET',
				headers: this.options.headers,
				...this.options.rootOptions,
			};

			let response;
			let request;
			let redirects = 0;

			const resHandler = (res) => {
				if (
					res.statusCode >= 300 &&
					res.statusCode < 400 &&
					res.headers.location &&
					redirects < (this.options.maxRedirects ?? 5)
				) {
					const redirectUrl = new URL(res.headers.location);

					options.hostname = redirectUrl.hostname;
					options.port = redirectUrl.port;
					options.path = redirectUrl.pathname;

					redirects++;
					createRequest(options, resHandler);
					return;
				}

				if (this.options.response == 'stream') {
					resolve(res);
				} else {
					response = new ResponseData(res, options, {
						responseType: this.options.response ?? 'full',
						contentTypeHeader: res.headers['content-type'],
					});

					res.on('error', (error) => {
						reject(error);
					});

					res.on('aborted', () => {
						reject(new Error('Server aborted request'));
					});

					res.on('data', (chunk) => {
						response.addChunk(chunk);

						const byteLength = response.size();
						if (byteLength > this.options.maxSize) {
							throw new Error('Body over maximum size');
						}
					});

					res.on('end', () => {
						resolve(response.toJSON());
					});
				}
			};

			const createRequest = (options, resHandler) => {
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

				if (this.options.body) {
					request.write(this.options.body);
				}

				request.on('error', (error) => {
					reject(error);
				});

				request.end();
			};

			createRequest(options, resHandler);
		});
	}
}
