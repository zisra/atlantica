import typeOf from '../util/typeOf.js';

export default class {
	constructor(options) {
		this.headers = new Map();
		if (options) this.add(options);

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

	clear() {
		this.headers = new Map();

		return this;
	}

	toJSON() {
		return Object.fromEntries(this.headers);
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
