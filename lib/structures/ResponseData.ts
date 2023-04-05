import ResponseType from '../types/ResponseType';
import ResponseTypes from './ResponseTypes';
import RequestError from './RequestError';
import type { ResponseDataFormat } from '../types/ResponseDataFormat';
import type { IncomingMessage } from 'node:http';
import type { RequestOptions as HttpRequestOptions } from 'node:http';
import type { RequestOptions as HttpsRequestOptions } from 'node:https';

const getResponseType = (str: string) =>
	Object.values(ResponseType).find(
		(value: string) => value === str
	) as ResponseType;

export default class {
	res: IncomingMessage;
	responseType: ResponseType | string;
	req: HttpRequestOptions | HttpsRequestOptions;
	headers: object;
	statusCode: number;
	statusMessage: string;
	contentTypeHeader: string;
	body: Buffer;
	hasError: boolean;
	constructor(
		res: IncomingMessage,
		requestOptions: HttpRequestOptions | HttpsRequestOptions,
		{
			responseType,
			contentTypeHeader,
			hasError,
		}: {
			responseType?: ResponseType | string;
			contentTypeHeader?: string;
			hasError?: boolean;
		}
	) {
		this.res = res;
		this.responseType = responseType;
		this.req = requestOptions;
		this.headers = res.headers;
		this.statusCode = res.statusCode;
		this.statusMessage = res.statusMessage;
		this.res = res;
		this.contentTypeHeader = contentTypeHeader;
		this.body = Buffer.alloc(0);
		this.hasError = hasError;
	}

	addChunk(chunk: Buffer) {
		this.body = Buffer.concat([this.body, chunk]);
	}

	toJSON() {
		const result: ResponseDataFormat = {
			httpResponse: this.res,
			headers: this.headers,
			statusCode: this.statusCode,
			statusMessage: this.statusMessage,
			body: new ResponseTypes(this.body, this.contentTypeHeader),
		};

		if (this.hasError) {
			throw new RequestError(result);
		} else {
			if (this.responseType === ResponseType.FULL) {
				if (this.hasError) {
					throw new RequestError(result);
				} else {
					return result;
				}
			} else if (getResponseType(this.responseType)) {
				const result: ResponseTypes = new ResponseTypes(
					this.body,
					this.contentTypeHeader
				)[getResponseType(this.responseType)];
				return result;
			} else {
				throw new Error('Invalid response type');
			}
		}
	}

	size() {
		return Buffer.byteLength(this.body);
	}

	data = () => {
		return this.body;
	};
}
