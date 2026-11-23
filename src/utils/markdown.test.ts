import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInlineTokens, parseMarkdownBlocks } from './markdown';

test('parseMarkdownBlocks parses headings, code blocks, blockquotes, lists, and paragraphs', () => {
  const sample = [
    '# Main Title',
    '',
    'Intro paragraph with **bold** text.',
    '',
    '## Architecture',
    '',
    '> Clean separation of concerns.',
    '',
    '- FastAPI backend',
    '- PostgreSQL storage',
    '',
    '```python',
    'from fastapi import FastAPI',
    'app = FastAPI()',
    '```',
  ].join('\n');

  const blocks = parseMarkdownBlocks(sample);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'heading');
  assert.equal(blocks[3].type, 'blockquote');
  assert.equal(blocks[4].type, 'list');
  if (blocks[4].type === 'list') {
    assert.equal(blocks[4].items.length, 2);
  }
  assert.equal(blocks[5].type, 'code');
  if (blocks[5].type === 'code') {
    assert.equal(blocks[5].lang, 'python');
  }
});

test('parseInlineTokens parses formatting and strips unsafe link protocols', () => {
  const tokens = parseInlineTokens(
    'Use `FastAPI` with **PostgreSQL** and visit [Docs](https://fastapi.tiangolo.com) or [XSS](javascript:alert(1)).'
  );
  assert.ok(tokens.some((t) => t.type === 'code' && t.value === 'FastAPI'));
  assert.ok(tokens.some((t) => t.type === 'bold' && t.value === 'PostgreSQL'));
  assert.ok(
    tokens.some(
      (t) =>
        t.type === 'link' &&
        t.label === 'Docs' &&
        t.href === 'https://fastapi.tiangolo.com/'
    )
  );
  assert.equal(
    tokens.some((t) => t.type === 'link' && t.label === 'XSS'),
    false
  );
});
