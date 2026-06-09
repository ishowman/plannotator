import { describe, test, expect } from 'bun:test';
import { InlineMarkdown, trimUrlTail } from './InlineMarkdown';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

describe('trimUrlTail', () => {
  test('trims trailing period', () => {
    expect(trimUrlTail('https://foo.com.')).toBe('https://foo.com');
  });

  test('trims trailing comma / semicolon / question mark', () => {
    expect(trimUrlTail('https://foo.com,')).toBe('https://foo.com');
    expect(trimUrlTail('https://foo.com;')).toBe('https://foo.com');
    expect(trimUrlTail('https://foo.com?')).toBe('https://foo.com?'.replace(/\?$/, ''));
  });

  test('keeps closing paren when it balances an opener', () => {
    expect(trimUrlTail('https://en.wikipedia.org/wiki/Function_(mathematics)')).toBe(
      'https://en.wikipedia.org/wiki/Function_(mathematics)',
    );
  });

  test('trims unbalanced closing paren', () => {
    expect(trimUrlTail('https://foo.com/path)')).toBe('https://foo.com/path');
  });

  test('keeps closing bracket when balanced', () => {
    expect(trimUrlTail('https://foo.com/[a]')).toBe('https://foo.com/[a]');
  });

  test('trims unbalanced closing bracket', () => {
    expect(trimUrlTail('https://foo.com]')).toBe('https://foo.com');
  });

  test('trims stacked punctuation', () => {
    expect(trimUrlTail('https://foo.com).')).toBe('https://foo.com');
  });

  test('leaves URL alone when no trailing punctuation', () => {
    expect(trimUrlTail('https://foo.com/path')).toBe('https://foo.com/path');
  });
});

describe('InlineMarkdown math', () => {
  test('renders inline math with KaTeX markup', () => {
    const html = renderToStaticMarkup(createElement(InlineMarkdown, { text: 'Area is $A=\\pi r^2$.' }));
    expect(html).toContain('katex');
    expect(html).toContain('math-inline');
    expect(html).toContain('mord mathnormal');
  });

  test('does not render escaped dollar-delimited text as math', () => {
    const html = renderToStaticMarkup(createElement(InlineMarkdown, { text: 'Price is \\$5$ today' }));
    expect(html).not.toContain('katex');
    expect(html).toContain('$5$ today');
  });

  test('does not treat spaced dollar text as inline math', () => {
    const html = renderToStaticMarkup(createElement(InlineMarkdown, { text: 'Keep $ not math $ here' }));
    expect(html).not.toContain('katex');
    expect(html).toContain('$ not math $ here');
  });

  test('leaves double-dollar text to the block parser', () => {
    const html = renderToStaticMarkup(createElement(InlineMarkdown, { text: '$$x$$' }));
    expect(html).not.toContain('katex');
    expect(html).toContain('$$x$$');
  });
});
