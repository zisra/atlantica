import type { ResponseDataFormat } from '../types/ResponseDataFormat';

export default class RequestError extends Error {
	data: ResponseDataFormat;

	constructor(data: ResponseDataFormat) {
		super('The request failed with a non-200 status code.');
		this.name = 'RequestError';
		this.data = data;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			stack: this.stack,
			...this.data,
		};
	}
}
