import { Request } from './lib/index.js';

const response = await new Request('https://www.google.com/')
	.response('blob')
	.timeout(61)
	.send();

console.log(response);
