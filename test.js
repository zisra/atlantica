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

test('arrayBuffer', async (t) => {
	const data = await atlantica('http://httpbin.org/anything')
		.query((h) => h.set('foo', 'bar').set('delete', 'delete me'))
		.query((h) => h.remove('delete'))
		.response('arrayBuffer')
		.send();

	t.truthy(data instanceof ArrayBuffer);
});
