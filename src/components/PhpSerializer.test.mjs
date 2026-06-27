/**
 * Standalone logic tests for PHP serializer/unserializer (issue #8).
 * Run: node --experimental-vm-modules src/components/PhpSerializer.test.mjs
 */
import { TextEncoder, TextDecoder } from 'util';

function serializeValue(value) {
  if (value === null || value === undefined) return 'N;';
  if (typeof value === 'boolean') return `b:${value ? '1' : '0'};`;
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      if (isNaN(value)) return 'd:NAN;';
      return value > 0 ? 'd:INF;' : 'd:-INF;';
    }
    if (Number.isInteger(value)) return `i:${value};`;
    return `d:${value};`;
  }
  if (typeof value === 'string') {
    const byteLength = new TextEncoder().encode(value).length;
    return `s:${byteLength}:"${value}";`;
  }
  if (Array.isArray(value)) {
    const elements = value.map((v, i) => `${serializeValue(i)}${serializeValue(v)}`).join('');
    return `a:${value.length}:{${elements}}`;
  }
  if (typeof value === 'object') {
    const { __class, ...props } = value;
    if (__class && typeof __class === 'string') {
      const entries = Object.entries(props);
      const elems = entries.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
      const byteLen = new TextEncoder().encode(__class).length;
      return `O:${byteLen}:"${__class}":${entries.length}:{${elems}}`;
    }
    const entries = Object.entries(value);
    const elems = entries.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
    return `a:${entries.length}:{${elems}}`;
  }
  throw new Error(`Unsupported type: ${typeof value}`);
}

function unserializeValue(input) {
  if (input.startsWith('N;')) return { value: null, rest: input.slice(2) };
  if (input.startsWith('b:')) {
    if (input.length < 4) throw new Error('Invalid boolean');
    return { value: input[2] === '1', rest: input.slice(4) };
  }
  if (input.startsWith('i:')) {
    const end = input.indexOf(';');
    if (end === -1) throw new Error('Invalid integer');
    return { value: parseInt(input.slice(2, end), 10), rest: input.slice(end + 1) };
  }
  if (input.startsWith('d:')) {
    const end = input.indexOf(';');
    if (end === -1) throw new Error('Invalid double');
    const n = input.slice(2, end);
    if (n === 'INF') return { value: Infinity, rest: input.slice(end + 1) };
    if (n === '-INF') return { value: -Infinity, rest: input.slice(end + 1) };
    if (n === 'NAN') return { value: NaN, rest: input.slice(end + 1) };
    return { value: parseFloat(n), rest: input.slice(end + 1) };
  }
  if (input.startsWith('s:')) {
    const colonPos = input.indexOf(':', 2);
    if (colonPos === -1) throw new Error('Invalid string');
    const byteLength = parseInt(input.slice(2, colonPos), 10);
    if (input[colonPos + 1] !== '"') throw new Error('String must start with quote');
    const startPos = colonPos + 2;
    const bytes = new Uint8Array(byteLength);
    let byteIdx = 0, charIdx = startPos;
    while (byteIdx < byteLength && charIdx < input.length) {
      const code = input.codePointAt(charIdx);
      if (code < 0x80) { bytes[byteIdx++] = code; charIdx++; }
      else if (code < 0x800) { bytes[byteIdx++] = 0xc0|(code>>6); bytes[byteIdx++] = 0x80|(code&0x3f); charIdx++; }
      else if (code < 0x10000) { bytes[byteIdx++] = 0xe0|(code>>12); bytes[byteIdx++] = 0x80|((code>>6)&0x3f); bytes[byteIdx++] = 0x80|(code&0x3f); charIdx++; }
      else { bytes[byteIdx++] = 0xf0|(code>>18); bytes[byteIdx++] = 0x80|((code>>12)&0x3f); bytes[byteIdx++] = 0x80|((code>>6)&0x3f); bytes[byteIdx++] = 0x80|(code&0x3f); charIdx += 2; }
    }
    const value = new TextDecoder().decode(bytes);
    if (input[charIdx] !== '"' || input[charIdx+1] !== ';') throw new Error('String end mismatch');
    return { value, rest: input.slice(charIdx + 2) };
  }
  if (input.startsWith('a:')) {
    const colonPos = input.indexOf(':', 2);
    const length = parseInt(input.slice(2, colonPos), 10);
    let rest = input.slice(colonPos + 1).slice(1); // skip {
    const result = {};
    let seq = true;
    for (let i = 0; i < length; i++) {
      const kr = unserializeValue(rest);
      const vr = unserializeValue(kr.rest);
      rest = vr.rest;
      result[kr.value] = vr.value;
      if (kr.value !== i) seq = false;
    }
    rest = rest.slice(1); // skip }
    if (length === 0 || seq) return { value: Array.from({ length }, (_, i) => result[i]), rest };
    return { value: result, rest };
  }
  if (input.startsWith('O:')) {
    const firstColon = input.indexOf(':', 2);
    const qs = input.indexOf('"', firstColon);
    const qe = input.indexOf('"', qs + 1);
    const className = input.slice(qs + 1, qe);
    const afterClass = input.slice(qe + 1);
    const pce = afterClass.indexOf(':', 1);
    const propCount = parseInt(afterClass.slice(1, pce), 10);
    let rest = afterClass.slice(pce + 1).slice(1); // skip {
    const result = { __class: className };
    for (let i = 0; i < propCount; i++) {
      const kr = unserializeValue(rest);
      const vr = unserializeValue(kr.rest);
      rest = vr.rest;
      result[String(kr.value)] = vr.value;
    }
    rest = rest.slice(1); // skip }
    return { value: result, rest };
  }
  throw new Error(`Unsupported: ${JSON.stringify(input.slice(0, 20))}`);
}

let pass = 0, fail = 0;
function eq(a, b, label) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa === sb) { console.log(`  \u2713 ${label}`); pass++; }
  else { console.error(`  \u2717 ${label}\n    got:      ${sa}\n    expected: ${sb}`); fail++; }
}

console.log('=== serialize ===');
eq(serializeValue(null), 'N;', 'null');
eq(serializeValue(true), 'b:1;', 'bool true');
eq(serializeValue(false), 'b:0;', 'bool false');
eq(serializeValue(42), 'i:42;', 'int 42');
eq(serializeValue(-7), 'i:-7;', 'int -7');
eq(serializeValue(3.14), 'd:3.14;', 'float');
eq(serializeValue(Infinity), 'd:INF;', 'INF');
eq(serializeValue(-Infinity), 'd:-INF;', '-INF');
eq(serializeValue(NaN), 'd:NAN;', 'NaN');
eq(serializeValue('hello'), 's:5:"hello";', 'ascii string');
eq(serializeValue([1, 2]), 'a:2:{i:0;i:1;i:1;i:2;}', 'array');
eq(serializeValue([]), 'a:0:{}', 'empty array');
eq(serializeValue({ a: 1 }), 'a:1:{s:1:"a";i:1;}', 'assoc');
eq(
  serializeValue({ __class: 'MyClass', prop: 'val' }),
  'O:7:"MyClass":1:{s:4:"prop";s:3:"val";}',
  'PHP object'
);

console.log('\n=== unserialize ===');
eq(unserializeValue('N;').value, null, 'null');
eq(unserializeValue('b:1;').value, true, 'bool true');
eq(unserializeValue('b:0;').value, false, 'bool false');
eq(unserializeValue('i:42;').value, 42, 'int');
eq(unserializeValue('d:3.14;').value, 3.14, 'double');
eq(unserializeValue('d:INF;').value, Infinity, 'INF');
eq(unserializeValue('d:-INF;').value, -Infinity, '-INF');
const nanVal = unserializeValue('d:NAN;').value;
(isNaN(nanVal) ? (console.log('  \u2713 NAN'), pass++) : (console.error('  \u2717 NAN'), fail++));
eq(unserializeValue('s:5:"hello";').value, 'hello', 'string');
eq(unserializeValue('a:0:{}').value, [], 'empty array');
eq(unserializeValue('a:2:{i:0;i:10;i:1;i:20;}').value, [10, 20], 'seq array');
eq(
  unserializeValue('a:2:{s:3:"foo";s:3:"bar";s:3:"baz";i:1;}').value,
  { foo: 'bar', baz: 1 },
  'assoc array'
);
eq(
  unserializeValue('O:8:"stdClass":1:{s:4:"prop";i:1;}').value,
  { __class: 'stdClass', prop: 1 },
  'PHP object O:'
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
