import { Blob } from 'node:buffer';

export default class {
	constructor(body, contentTypeHeader) {
		this.body = body;
		this.contentType = contentTypeHeader;
	}

	get buffer() {
		return this.body;
	}

	get text() {
		return this.body.toString('utf8');
	}

	get json() {
		return JSON.parse(this.body.toString('utf8'));
	}

	get arrayBuffer() {
		return new Uint8Array(this.body).buffer;
	}

	get blob() {
		return new Blob(this.body, {
			type: this.contentType,
		});
	}
}
