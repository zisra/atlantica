import test from 'ava';

import atlantica from './lib/index.js';
import { Blob } from 'node:buffer';

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
			method: 'post',
		})
		.send();

	t.is(data.statusCode, 200);
});

test('Post URL (option in .method)', async (t) => {
	const data = await atlantica('http://httpbin.org/post')
		.method('post')
		.send();

	t.is(data.statusCode, 200);
});

test('Override method', async (t) => {
	const data = await atlantica('http://httpbin.org/get')
		.set({
			method: 'post',
		})
		.method('get')
		.send();

	t.is(data.statusCode, 200);
});

test('Post JSON', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.method('post')
		.body({
			foo: 'bar',
		})
		.response('json')
		.send();

	t.is(data.json.foo, 'bar');
});

test('Headers', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.headers({
			'X-Data': 'data',
		})
		.response('json')
		.send();

	t.is(data.headers['X-Data'], 'data');
});

test('Headers constructor', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.headers((h) => h.set('X-Data', 'data').set('X-Delete', 'delete me'))
		.headers((h) => h.remove('X-Delete'))
		.response('json')
		.send();

	t.is(data.headers['X-Data'], 'data');
	t.falsy(data.headers['X-Delete']);
});

test('Query', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query({
			foo: 'bar',
		})
		.response('json')
		.send();

	t.is(data.args.foo, 'bar');
});

test('Query constructor', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query((h) => h.set('foo', 'bar').set('delete', 'delete me'))
		.query((h) => h.remove('delete'))
		.response('json')
		.send();

	t.is(data.args.foo, 'bar');
	t.falsy(data.args.delete);
});

test('Text', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query((h) => h.set('foo', 'bar').set('delete', 'delete me'))
		.query((h) => h.remove('delete'))
		.response('text')
		.send();

	t.truthy(typeof data === 'string');
});

test('Buffer', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query((h) => h.set('foo', 'bar').set('delete', 'delete me'))
		.query((h) => h.remove('delete'))
		.response('buffer')
		.send();

	t.truthy(data instanceof Buffer);
});

test('Blob', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query((h) => h.set('foo', 'bar').set('delete', 'delete me'))
		.query((h) => h.remove('delete'))
		.response('blob')
		.send();

	t.truthy(data instanceof Blob);
});

test('ArrayBuffer', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query((h) => h.set('foo', 'bar').set('delete', 'delete me'))
		.query((h) => h.remove('delete'))
		.response('arrayBuffer')
		.send();

	t.truthy(data instanceof ArrayBuffer);
});

test('Path', async (t) => {
	const data = await atlantica('http://httpbin.org/')
		.path('/get')
		.response('json')
		.send();

	t.is(data.url, 'http://httpbin.org/get');
});

test('Redirects disabled', async (t) => {
	const data = await atlantica('http://httpbin.org/absolute-redirect')
		.path('/1')
		.maxRedirects(0)
		.response('full')
		.send();

	t.is(data.statusCode, 302);
});

test('Redirects enabled', async (t) => {
	const data = await atlantica('http://httpbin.org/absolute-redirect')
		.path('/1')
		.maxRedirects(1)
		.response('full')
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
		.response('json')
		.post('http://httpbin.org/post');

	t.is(data.data, 'Random string');
});

test('Post buffer', async (t) => {
	const data = await atlantica()
		.body(Buffer.from('Random string'))
		.response('json')
		.post('http://httpbin.org/post');

	t.is(data.data, 'Random string');
});

test.skip('Maximum size', async (t) => {
	const data = atlantica('http://httpbin.org/image/png').maxSize(1).send();
	await t.throwsAsync(data);
});

test('Get shortcut (path)', async (t) => {
	const data = await atlantica('http://httpbin.org/').get('/anything');

	t.is(data.statusCode, 200);
});
