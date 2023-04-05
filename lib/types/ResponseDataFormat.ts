import type ResponseTypes from '../structures/ResponseTypes';
import type { IncomingMessage } from 'node:http';

export type ResponseDataFormat = {
	httpResponse: IncomingMessage;
	headers: object;
	statusCode: number;
	statusMessage: string;
	body: ResponseTypes;
};
