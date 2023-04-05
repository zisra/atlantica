import { join, isAbsolute } from 'node:path';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';
import { createGunzip, createInflate, createBrotliDecompress } from 'node:zlib';
import {
	stringify as stringifyQuery,
	ParsedUrlQueryInput,
} from 'node:querystring';
import ResponseData from './ResponseData';
import type {
	RequestOptions,
	AllowedHttpMethods,
	AllowedResponseTypes,
} from '../types/RequestOptions';
import ResponseType from '../types/ResponseType';
import HttpMethod from '../types/HttpMethod';
import type {
	RequestOptions as HttpRequestOptions,
	IncomingMessage,
	ClientRequest,
	OutgoingHttpHeaders,
} from 'node:http';
import type { Readable } from 'node:stream';
import type { RequestOptions as HttpsRequestOptions } from 'node:https';

type CompressionMethod = 'gzip' | 'deflate' | 'br';

const getHttpMethod = (str: string) =>
	Object.values(HttpMethod).find(
		(value: string) => value === str
	) as HttpMethod;

export default class {
	requestOptions: {
		url?: URL;
		path?: string;
		query?: object;
		method?: AllowedHttpMethods;
		body?: string | object | Buffer | ArrayBuffer;
		headers?: object;
		timeout?: number;
		response?: AllowedResponseTypes;
		maxRedirects?: number;
		maxSize?: number;
		throwErrors?: boolean;
		compression?: boolean;
		rootOptions?: HttpRequestOptions;
	};
	constructor(url?: string, options?: RequestOptions) {
		this.requestOptions = {
			headers: {},
			throwErrors: true,
			compression: true,
		};

		if (url) this.requestOptions.url = new URL(url);
		this.set(options);
		return this;
	}

	set(options: RequestOptions) {
		if (options?.url) this.url(options.url);
		if (options?.path) this.path(options.path);
		if (options?.query) this.query(options.query);
		if (options?.method) this.method(options.method);
		if (options?.body) this.body(options.body);
		if (options?.headers) this.headers(options.headers);
		if (options?.timeout) this.timeout(options.timeout);
		if (options?.response) this.response(options.response);
		if (options?.maxRedirects || options?.maxRedirects === 0)
			this.maxRedirects(options.maxRedirects);
		if (options?.maxSize || options?.maxSize === 0)
			this.maxSize(options.maxSize);
		if (options?.throwErrors === false) this.throwErrors(false);
		if (options?.compression === false) this.compression(false);
		return this;
	}

	get(url: string, options?: RequestOptions) {
		// HTTP/S GET method
		this.requestOptions.method = HttpMethod.GET;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	head(url: string, options?: RequestOptions) {
		// HTTP/S HEAD method
		this.requestOptions.method = HttpMethod.HEAD;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	post(url: string, options?: RequestOptions) {
		// HTTP/S POST method
		this.requestOptions.method = HttpMethod.POST;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	put(url: string, options?: RequestOptions) {
		// HTTP/S PUT method
		this.requestOptions.method = HttpMethod.PUT;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	delete(url: string, options?: RequestOptions) {
		// HTTP/S DELETE method
		this.requestOptions.method = HttpMethod.DELETE;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	connect(url: string, options?: RequestOptions) {
		// HTTP/S CONNECT method
		this.requestOptions.method = HttpMethod.CONNECT;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	options(url: string, options?: RequestOptions) {
		// HTTP/S OPTIONS method
		this.requestOptions.method = HttpMethod.OPTIONS;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	trace(url: string, options?: RequestOptions) {
		// HTTP/S TRACE method
		this.requestOptions.method = HttpMethod.TRACE;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}
	patch(url: string, options: RequestOptions) {
		// HTTP/S PATCH method
		this.requestOptions.method = HttpMethod.PATCH;
		this.set(options);
		if (isAbsolute(url)) {
			this.path(url);
		} else {
			this.url(url);
		}

		return this.send();
	}

	url(url: string) {
		this.requestOptions.url = new URL(url.toString());
		return this;
	}

	path(path: string) {
		this.requestOptions.url = new URL(
			join(this.requestOptions.url.toString(), path)
		);
		return this;
	}

	query(query: object, override?: boolean) {
		if (override) {
			this.requestOptions.query = query;
			return this;
		} else {
			this.requestOptions.query = {
				...query,
				...this.requestOptions.query,
			};
		}

		return this;
	}

	method(option: AllowedHttpMethods) {
		this.requestOptions.method = option;
		return this;
	}

	body(body: string | object | Buffer | ArrayBuffer | Blob) {
		this.requestOptions.body = body;
		return this;
	}

	headers(headers: object, override?: boolean) {
		if (override) {
			this.requestOptions.headers = headers;
		} else {
			this.requestOptions.headers = {
				...headers,
				...this.requestOptions.headers,
			};
		}

		return this;
	}

	timeout(timeout: number) {
		this.requestOptions.timeout = timeout;
		return this;
	}

	response(responseType: AllowedResponseTypes) {
		this.requestOptions.response = responseType;
		return this;
	}

	maxRedirects(maxRedirects: number) {
		this.requestOptions.maxRedirects = maxRedirects;
		return this;
	}

	throwErrors(throwErrors: boolean) {
		this.requestOptions.throwErrors = throwErrors;
		return this;
	}

	maxSize(maxSize: number) {
		this.requestOptions.maxSize = maxSize;
		return this;
	}

	compression(compression: boolean) {
		this.requestOptions.compression = compression;
		return this;
	}

	rootOptions(rootOptions: HttpRequestOptions | HttpsRequestOptions) {
		this.requestOptions.rootOptions = rootOptions;
		return this;
	}

	private hasContentTypeHeader() {
		return (
			this.requestOptions.headers['content-type'] ||
			this.requestOptions.headers['Content-Type']
		);
	}

	private hasAcceptEncodingHeader() {
		return (
			this.requestOptions.headers['accept-encoding'] ||
			this.requestOptions.headers['Accept-Encoding']
		);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	send(): Promise<any> {
		return new Promise((resolve, reject) => {
			if (this.requestOptions.compression) {
				const acceptedMethods: CompressionMethod[] =
					this.requestOptions.compression === true
						? ['gzip', 'deflate', 'br']
						: this.requestOptions.compression;
				if (!this.hasAcceptEncodingHeader())
					this.requestOptions.headers['Accept-Encoding'] =
						acceptedMethods.join(', ');
			}

			if (this.requestOptions.body) {
				if (this.requestOptions.body instanceof ArrayBuffer) {
					this.requestOptions.body = Buffer.from(
						this.requestOptions.body
					);
				} else if (this.requestOptions.body instanceof Buffer) {
					if (this.hasContentTypeHeader)
						this.requestOptions.headers['content-type'] =
							'application/octet-stream';
				} else if (typeof this.requestOptions.body === 'object') {
					this.requestOptions.body = Buffer.from(
						JSON.stringify(this.requestOptions.body),
						'utf8'
					);
					if (this.hasContentTypeHeader)
						this.requestOptions.headers['content-type'] =
							'application/json';
				} else if (typeof this.requestOptions.body === 'string') {
					this.requestOptions.body = Buffer.from(
						this.requestOptions.body,
						'utf8'
					);
					if (this.hasContentTypeHeader)
						this.requestOptions.headers['content-type'] =
							'text/plain';
				} else {
					reject(Error('Invalid body type provided'));
				}

				if (!this.requestOptions.headers['content-length']) {
					this.requestOptions.headers['content-length'] =
						Buffer.byteLength(
							this.requestOptions.body as Buffer
						).toString();
				}
			}

			let url: URL;
			if (typeof this.requestOptions.url === 'string') {
				url = new URL(this.requestOptions.url);
			} else if (this.requestOptions.url instanceof URL) {
				url = this.requestOptions.url;
			} else if (!this.requestOptions.url) {
				reject(new Error('No URL provided to the request'));
			}

			const options: HttpRequestOptions | HttpsRequestOptions = {
				hostname: url.hostname.replace('[', '').replace(']', ''),
				port: url.port,
				path: `${url.pathname}${
					this.requestOptions.query
						? `?${stringifyQuery(
								this.requestOptions.query as ParsedUrlQueryInput
						  )}`
						: ''
				}`,
				method: this.requestOptions.method
					? getHttpMethod(this.requestOptions.method)
					: HttpMethod.GET,
				headers: this.requestOptions.headers as OutgoingHttpHeaders,
				...this.requestOptions.rootOptions,
			};

			let response: ResponseData;
			let request: ClientRequest;
			let redirects = 0;

			const resHandler = (res: IncomingMessage) => {
				let stream: Readable = res;
				if (
					res.statusCode &&
					res.statusCode >= 300 &&
					res.statusCode < 400 &&
					res.headers.location &&
					redirects < (this.requestOptions.maxRedirects ?? 5)
				) {
					const redirectUrl = new URL(res.headers.location);

					options.hostname = redirectUrl.hostname;
					options.port = redirectUrl.port;
					options.path = redirectUrl.pathname;

					redirects++;
					createRequest(options, resHandler);
					return;
				}

				if (this.requestOptions.compression) {
					if (res.headers['content-encoding'] === 'gzip') {
						stream = res.pipe(createGunzip());
					} else if (res.headers['content-encoding'] === 'deflate') {
						stream = res.pipe(createInflate());
					} else if (res.headers['content-encoding'] === 'br') {
						stream = res.pipe(createBrotliDecompress());
					}
				}

				if (this.requestOptions.response === ResponseType.STREAM) {
					resolve(stream);
				} else {
					response = new ResponseData(res, options, {
						responseType:
							this.requestOptions.response ?? ResponseType.FULL,
						contentTypeHeader: res.headers['content-type'],
						hasError:
							this.requestOptions.throwErrors !== false &&
							(res.statusCode < 200 || res.statusCode > 400),
					});

					stream.on('error', (error: Error) => {
						if (this.throwErrors) reject(error);
					});

					stream.on('aborted', () => {
						reject(new Error('Server aborted request'));
					});

					stream.on('data', (chunk: Buffer) => {
						response.addChunk(chunk);

						const byteLength = response.size();
						if (byteLength > this.requestOptions.maxSize) {
							reject(new Error('Body over maximum size'));
						}
					});

					stream.on('end', () => {
						resolve(response.toJSON());
					});
				}
			};

			const createRequest = (
				options: HttpRequestOptions | HttpsRequestOptions,
				resHandler: (res: IncomingMessage) => void
			) => {
				if (url.protocol === 'http:') {
					request = httpRequest(options, resHandler);
				} else if (url.protocol === 'https:') {
					request = httpsRequest(options, resHandler);
				} else {
					reject(new Error('Invalid protocol'));
				}
				if (this.requestOptions.timeout) {
					request.setTimeout(this.requestOptions.timeout, () => {
						request.destroy();

						if (this.requestOptions.response !== 'stream') {
							reject(new Error('Timeout reached'));
						}
					});
				}

				if (this.requestOptions.body) {
					request.write(this.requestOptions.body);
				}

				request.on('error', (error: Error) => {
					if (this.requestOptions.throwErrors) reject(error);
				});

				request.end();
			};

			createRequest(options, resHandler);
		});
	}
}
