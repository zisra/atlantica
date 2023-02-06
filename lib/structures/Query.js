import typeOf from '../util/typeOf.js';

export default class {
	constructor(options) {
		this.query = new Map();
		if (options) this.add(options);

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

	clear() {
		this.query = new Map();

		return this;
	}

	toJSON() {
		return Object.fromEntries(this.query);
	}

	toString() {
		const queryJSON = this.toJSON();
		let query = [];

		for (let item in queryJSON) {
			query.push(
				`${encodeURIComponent(item)}=${encodeURIComponent(
					queryJSON[item]
				)}`
			);
		}

		if (query.length === 0) return '';
		return '?' + query.join('&');
	}
}
