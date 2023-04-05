import Request from './structures/Request';
import type { RequestOptions } from './types/RequestOptions';
import ResponseType from './types/ResponseType';
import HttpMethod from './types/HttpMethod';

export default (url?: string, options?: RequestOptions): Request => {
	return new Request(url, options);
};

export { HttpMethod };
export { ResponseType };
export { Request };
