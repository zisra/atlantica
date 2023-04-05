import type { RequestOptions as HttpRequestOptions } from 'node:http';

import HttpMethod from './HttpMethod';
import ResponseType from './ResponseType';

export type AllowedHttpMethods =
	| HttpMethod
	| 'get'
	| 'head'
	| 'post'
	| 'put'
	| 'delete'
	| 'connect'
	| 'options'
	| 'trace'
	| 'patch';
export type AllowedResponseTypes =
	| ResponseType
	| 'stream'
	| 'json'
	| 'text'
	| 'buffer'
	| 'arrayBuffer'
	| 'blob'
	| 'full';

export type RequestOptions = {
	url?: string;
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
