import { Blob } from 'node:buffer';

export default class {
	body: Buffer;
	contentType: string;

	constructor(body: Buffer, contentTypeHeader: string) {
		this.body = body;
		this.contentType = contentTypeHeader;
	}

	get buffer(): Buffer {
		return this.body;
	}

	get text(): string {
		return this.body.toString('utf8');
	}

	get json(): object {
		return JSON.parse(this.body.toString('utf8'));
	}

	get arrayBuffer(): ArrayBuffer {
		return new Uint8Array(this.body).buffer;
	}

	get blob(): Blob {
		return new Blob([this.body], {
			type: this.contentType,
		});
	}
}
