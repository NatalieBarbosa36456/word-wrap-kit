/**
 * Core wrapping implementation.
 *
 * Design decisions (stated plainly so the tests and README stay honest):
 *
 * 1. Word boundaries are defined by U+0020 SPACE only. Tabs, newlines, and other
 *    whitespace are NOT treated as separators — they are preserved verbatim as part
 * of the surrounding "word". This keeps the algorithm simple and predictable; a
 *    tab or a newline inside a token is the caller's concern, not ours. Existing
 *    newlines in the input are kept as-is within their token.
 *
 * 2. A single word longer than the target width is placed on its own line and is
 *    NOT broken. Hard-breaking long tokens is a different feature (email encoding,
 *    RFC 3676 flowed text) and we refuse to guess at it. Over-long words simply
 *    overflow; callers should pre-split them if they need character breaking.
 *
 * 3. Output uses \n as the line separator, regardless of platform. Email bodies and
 *    terminal output both expect \n; the caller can replace if needed.
 */

/**
 * Split text into tokens on single spaces, preserving empty tokens.
 *
 * Splitting on ' ' (not \s+) means runs of spaces are kept intact as part of the
 * surrounding tokens rather than being collapsed. This is deliberate: collapsing
 * whitespace is a normalization step that callers may or may not want, and
 * doing it here would make the wrapper's output depend on an implicit policy.
 * Empty strings between two spaces are kept so that "a  b" round-trips faithfully.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  if (text === '') return [];
  return text.split(' ');
}

/**
 * Greedy word-wrap: pack as many words as fit on each line.
 *
 * Greedy minimizes the number of lines but does not minimize raggedness; it is
 * the standard for email and terminal display where lines are read top-to-bottom
 * and visual balance is secondary to line count.
 *
 * Each line is built by appending words separated by single spaces, and a line is
 * "full" when appending the next word (plus its leading space) would exceed the
 * width. A word that alone exceeds the width still starts its own line.
 *
 * @param {string[]} words  Tokens produced by tokenize().
 * @param {number} width    Maximum line length in characters.
 * @returns {string[]}     Wrapped lines.
 */
export function wrapWords(words, width) {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('width must be a positive integer');
  }

  const out = [];
  let current = '';

  for (const word of words) {
    if (current === '') {
      current = word;
      continue;
    }
    // +1 accounts for the single space that would join current and word.
    if (current.length + 1 + word.length <= width) {
      current += ' ' + word;
    } else {
      out.push(current);
      current = word;
    }
  }

  if (current !== '') {
    out.push(current);
  }

  // An input of "" yields [] from tokenize, and we must return [] — not [""] —
  // so that join('\n') reproduces the empty string exactly.
  return out;
}

/**
 * Return the wrapped lines for a piece of text.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
export function lines(text, width) {
  return wrapWords(tokenize(text), width);
}

/**
 * Wrap text to a given width, returning a single string with \n separators.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
export function wrap(text, width) {
  return lines(text, width).join('\n');
}
