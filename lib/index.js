import Request from './structures/Request.js';

export default (url, options) => {
	return new Request(url, options);
};
