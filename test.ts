import test from 'ava';

import atlantica, { HttpMethod, ResponseType } from './lib/index';

test('Get URL', async (t) => {
	const data = await atlantica('http://httpbin.org/get').send();

	t.is(data.statusCode, 200);
});

test('Post URL (option in function)', async (t) => {
	const data = await atlantica('http://httpbin.org/post', {
		method: 'post',
	}).send();

	t.is(data.statusCode, 200);
});

test('Post URL (option in .set)', async (t) => {
	const data = await atlantica('http://httpbin.org/post')
		.set({
			method: HttpMethod.POST,
		})
		.send();

	t.is(data.statusCode, 200);
});

test('Post URL (option in .method)', async (t) => {
	const data = await atlantica('http://httpbin.org/post')
		.method(HttpMethod.POST)
		.send();

	t.is(data.statusCode, 200);
});

test('Override method', async (t) => {
	const data = await atlantica('http://httpbin.org/post')
		.set({
			response: ResponseType.FULL,
			method: HttpMethod.GET,
		})
		.method(HttpMethod.POST)
		.send();

	t.is(data.statusCode, 200);
});

test('Post JSON', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.method(HttpMethod.POST)
		.body({
			foo: 'bar',
		})
		.response(ResponseType.JSON)
		.send();

	t.is(data.json.foo, 'bar');
});

test('Headers', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.headers({
			'X-Data': 'data',
		})
		.response(ResponseType.JSON)
		.send();

	t.is(data.headers['X-Data'], 'data');
});

test('Query', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query({
			foo: 'bar',
		})
		.response(ResponseType.JSON)
		.send();

	t.is(data.args.foo, 'bar');
});

test('text', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.response(ResponseType.TEXT)
		.send();

	t.truthy(typeof data === 'string');
});

test('Buffer', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.response(ResponseType.BUFFER)
		.send();

	t.truthy(data instanceof Buffer);
});

test('Blob', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.response(ResponseType.BLOB)
		.send();

	t.truthy(data instanceof Blob);
});

test('ArrayBuffer', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.response(ResponseType.ARRAY_BUFFER)
		.send();

	t.truthy(data instanceof ArrayBuffer);
});

test('Path', async (t) => {
	const data = await atlantica('http://httpbin.org/')
		.path('/get')
		.response(ResponseType.JSON)
		.send();

	t.is(data.url, 'http://httpbin.org/get');
});

test('Redirects disabled', async (t) => {
	const data = await atlantica('http://httpbin.org/absolute-redirect')
		.path('/1')
		.maxRedirects(0)
		.response(ResponseType.FULL)
		.send();

	t.is(data.statusCode, 302);
});

test('Redirects enabled', async (t) => {
	const data = await atlantica('http://httpbin.org/absolute-redirect')
		.path('/1')
		.maxRedirects(1)
		.response(ResponseType.FULL)
		.send();

	t.is(data.statusCode, 200);
});

test('Timeout', async (t) => {
	const data = atlantica('http://httpbin.org/anything').timeout(10).send();
	await t.throwsAsync(data, {
		instanceOf: Error,
		message: 'Timeout reached',
	});
});

test('Post shortcut', async (t) => {
	const data = await atlantica().post('http://httpbin.org/post');

	t.is(data.statusCode, 200);
});

test('Post string', async (t) => {
	const data = await atlantica()
		.body('Random string')
		.response(ResponseType.JSON)
		.post('http://httpbin.org/post');

	t.is(data.data, 'Random string');
});

test('Get shortcut (path)', async (t) => {
	const data = await atlantica('http://httpbin.org/').get('/anything');

	t.is(data.statusCode, 200);
});

test('Post buffer', async (t) => {
	const data = await atlantica()
		.body(Buffer.from(JSON.stringify({ main: 'Random string' })))
		.response(ResponseType.JSON)
		.post('http://httpbin.org/post');

	t.is(data.data, JSON.stringify({ main: 'Random string' }));
});

test('500 Non-Error', async (t) => {
	const data = await atlantica('http://httpbin.org/status/500', {
		throwErrors: false,
	}).send();

	t.is(data.statusCode, 500);
});

test('G-zip', async (t) => {
	const data = await atlantica('http://httpbin.org/gzip', {
		compression: true,
	})
		.response(ResponseType.JSON)
		.send();

	t.is(data.gzipped, true);
});

test('Deflate', async (t) => {
	const data = await atlantica('http://httpbin.org/deflate', {
		compression: true,
	})
		.response(ResponseType.JSON)
		.send();

	t.is(data.deflated, true);
});

test('Brotli', async (t) => {
	const data = await atlantica('http://httpbin.org/brotli', {
		compression: true,
	})
		.response(ResponseType.JSON)
		.send();

	t.is(data.brotli, true);
});

test('No compression', async (t) => {
	const data = await atlantica('http://httpbin.org/deflate', {
		compression: false,
	})
		.response(ResponseType.TEXT)
		.send();

	t.not(data, 'deflate');
});

test.skip('Maximum size', async (t) => {
	// TODO: Fix this test
	const request = atlantica('http://httpbin.org/image/png', {
		maxSize: 1,
	}).set({
		response: ResponseType.BUFFER,
	});

	await t.throwsAsync(
		async () => {
			await request.send();
		},
		{ message: 'Body over maximum size' }
	);
});

test.skip('404 Error', async (t) => {
	// TODO: Fix this test
	const request = atlantica('http://httpbin.org/status/404');

	await t.throwsAsync(
		async () => {
			await request.send();
		},
		{ message: 'The request failed with a non-200 status code' }
	);
});

// TODO: Write more tests
