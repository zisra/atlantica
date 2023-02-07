import ResponseType from '../constants/ResponseType.js';
import ResponseTypes from './ResponseTypes.js';

export default class {
	constructor(res, req, options) {
		this.res = res;
		this.responseType = options.responseType ?? 'full';
		this.req = req;
		this.headers = res.headers;
		this.statusCode = res.statusCode;
		this.statusMessage = res.statusMessage;
		this.res = res;
		this.contentTypeHeader = options.contentTypeHeader;
		this.body = Buffer.alloc(0);
	}

	addChunk(chunk) {
		this.body = Buffer.concat([this.body, chunk]);
	}

	toJSON() {
		if (this.responseType === 'full') {
			return {
				httpResponse: this.res,
				headers: this.headers,
				statusCode: this.statusCode,
				statusMessage: this.statusMessage,
				body: new ResponseTypes(this.body, this.contentTypeHeader),
			};
		} else if (ResponseType[this.responseType]) {
			return new ResponseTypes(this.body, this.contentTypeHeader)[
				this.responseType
			];
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
