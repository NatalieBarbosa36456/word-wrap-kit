# word-wrap-kit

Wraps text to a character width respecting word boundaries, for email bodies and terminal display.

## Usage

```js
import { wrap, lines, wrapWords } from 'word-wrap-kit';

wrap('the quick brown fox jumps', 10);
// => 'the quick\nbrown fox\njumps'

lines('the quick brown fox jumps', 10);
// => ['the quick', 'brown fox', 'jumps']

wrapWords(['the', 'quick', 'brown', 'fox'], 10);
// => ['the quick', 'brown fox']
```

## Why

Email and terminal display both need hard line breaks at a fixed width, but breaking in the middle of a word produces unreadable output. This library does one thing: greedy line packing that never splits a token.

Greedy wrapping minimizes line count; it does not minimize visual raggedness. That trade-off is deliberate — readers scan top-to-bottom and line count matters more than right-margin alignment.

## Edge cases you will hit

- **Words longer than the width are not broken.** A 20-character token at width 10 overflows onto its own line as-is. If you need character-level breaking (RFC 3676 flowed format, forced MIME breaks), pre-split before calling `wrap`.
- **Only U+0020 SPACE is a word separator.** Tabs and newlines inside the input are preserved verbatim as part of the surrounding token — they are not treated as break points and are not normalized away. Run of spaces are kept: `"a  b"` stays `"a  b"` within its line.
- **`width` must be a positive integer.** Non-integer or non-positive values throw `RangeError`.
- **Empty input returns `""` from `wrap` and `[]` from `lines`** — not a single empty line.

## Exports

- `wrap(text: string, width: number): string`
- `lines(text: string, width: number): string[]`
- `wrapWords(words: string[], width: number): string[]`

Output uses `\n` as the line separator regardless of platform.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

