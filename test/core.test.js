import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { wrap, wrapWords, lines, tokenize } from '../src/core.js';

describe('tokenize', () => {
  it('returns an empty array for empty input', () => {
    assert.deepEqual(tokenize(''), []);
  });

  it('splits on single spaces and preserves empty tokens', () => {
    assert.deepEqual(tokenize('a  b'), ['a', '', 'b']);
  });

  it('does not treat tabs as separators', () => {
    assert.deepEqual(tokenize('a\tb'), ['a\tb']);
  });
});

describe('wrap', () => {
  it('returns the empty string for empty input', () => {
    assert.equal(wrap('', 10), '');
  });

  it('fits within the width on a simple sentence', () => {
    const out = wrap('the quick brown fox', 10);
    for (const line of out.split('\n')) {
      assert.ok(line.length <= 10, `line too long: ${line}`);
    }
    assert.equal(out, 'the quick\nbrown fox');
  });

  it('produces the expected greedy packing', () => {
    assert.equal(
      wrap('aaaa bb cc dddd', 8),
      'aaaa bb\ncc dddd',
    );
  });

  it('handles width exactly equal to a single word', () => {
    assert.equal(wrap('hello', 5), 'hello');
  });

  it('handles width exactly equal to two joined words', () => {
    assert.equal(wrap('hi there', 8), 'hi there');
  });
});

describe('lines', () => {
  it('returns an empty array for empty input', () => {
    assert.deepEqual(lines('', 10), []);
  });

  it('returns each wrapped line as an array element', () => {
    assert.deepEqual(lines('the quick brown fox', 10), ['the quick', 'brown fox']);
  });
});

describe('wrapWords', () => {
  it('places an over-long word alone on its own line without breaking it', () => {
    // "intergalactic" is 12 chars; width 5 means it overflows, but we refuse
    // to hard-break it.
    const out = wrapWords(['short', 'intergalactic', 'ok'], 5);
    assert.deepEqual(out, ['short', 'intergalactic', 'ok']);
  });

  it('throws RangeError for non-positive width', () => {
    assert.throws(() => wrapWords(['a'], 0), RangeError);
    assert.throws(() => wrapWords(['a'], -1), RangeError);
    assert.throws(() => wrapWords(['a'], 2.5), RangeError);
  });

  it('throws RangeError for non-integer width', () => {
    assert.throws(() => wrapWords(['a'], 3.5), RangeError);
  });

  it('handles a single word that fits exactly', () => {
    assert.deepEqual(wrapWords(['hello'], 5), ['hello']);
  });

  it('does not add a trailing space when wrapping', () => {
    const out = wrapWords(['one', 'two', 'three'], 8);
    assert.deepEqual(out, ['one two', 'three']);
  });
});
