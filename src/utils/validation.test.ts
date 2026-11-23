import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateReadTime,
  formatDisplayDate,
  pickLang,
  sanitizeExternalUrl,
  slugify,
  validateContactInput,
  validatePostInput,
  validateProjectInput,
} from './validation';

test('slugify formats titles cleanly', () => {
  assert.equal(slugify('FastAPI & PostgreSQL Architecture!'), 'fastapi-postgresql-architecture');
  assert.equal(slugify("  O'zbekcha Loyiha 2026  "), 'ozbekcha-loyiha-2026');
});

test('estimateReadTime computes minimum 1 minute and scales with word count', () => {
  assert.equal(estimateReadTime('hello world'), 1);
  const longText = new Array(400).fill('word').join(' ');
  assert.equal(estimateReadTime(longText), 3);
});

test('sanitizeExternalUrl allows http/https and asset paths while blocking javascript/data schemes', () => {
  assert.equal(sanitizeExternalUrl('https://github.com/example'), 'https://github.com/example');
  assert.equal(sanitizeExternalUrl('/src/assets/images/demo.jpg'), '/src/assets/images/demo.jpg');
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>'), '');
});

test('pickLang prefers requested language with fallback', () => {
  assert.equal(pickLang('uz', 'Salom', 'Hello'), 'Salom');
  assert.equal(pickLang('en', 'Salom', 'Hello'), 'Hello');
  assert.equal(pickLang('en', 'Salom', ''), 'Salom');
});

test('formatDisplayDate formats Uzbek and English dates naturally', () => {
  assert.equal(formatDisplayDate('2026-11-23T12:00:00Z', 'uz'), '23-noyabr, 2026');
  assert.equal(formatDisplayDate('2026-11-23T12:00:00Z', 'en'), 'Nov 23, 2026');
});

test('validateContactInput rejects invalid inputs and accepts valid submissions', () => {
  const invalid = validateContactInput({
    senderName: 'A',
    senderEmail: 'not-an-email',
    subject: 'Hi',
    body: 'Short',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.senderName);
  assert.ok(invalid.errors.senderEmail);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.body);

  const valid = validateContactInput({
    senderName: 'Ali Valiyev',
    senderEmail: 'ali@example.com',
    subject: 'Yangi loyiha boyicha',
    body: 'Salom, bizga FastAPI va React asosida veb-ilova kerak edi.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateProjectInput and validatePostInput enforce required fields and safe URLs', () => {
  const badProject = validateProjectInput({
    slug: 'demo',
    titleUz: 'Loyiha',
    titleEn: 'Project',
    summaryUz: 'Qisqa',
    summaryEn: 'Short',
    detailsUz: 'Batafsil',
    detailsEn: 'Details',
    category: 'Web',
    techStack: 'React, FastAPI',
    liveUrl: 'javascript:void(0)',
  });
  assert.equal(badProject.valid, false);
  assert.ok(badProject.errors.liveUrl);

  const goodPost = validatePostInput({
    slug: 'ai-and-fastapi',
    titleUz: 'AI va FastAPI',
    titleEn: 'AI and FastAPI',
    excerptUz: 'Qisqa mazmun',
    excerptEn: 'Short excerpt',
    contentUz: '# Sarlavha\nMatn',
    contentEn: '# Heading\nContent',
    category: 'Backend',
  });
  assert.equal(goodPost.valid, true);
});
