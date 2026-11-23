import { Fragment } from 'react';
import { parseInlineTokens, parseMarkdownBlocks } from '../utils/markdown';

interface MarkdownRendererProps {
  content: string;
}

function renderInline(text: string) {
  const tokens = parseInlineTokens(text);
  return tokens.map((token, idx) => {
    if (token.type === 'bold') {
      return (
        <strong key={idx} className="font-semibold text-zinc-950 dark:text-zinc-100">
          {token.value}
        </strong>
      );
    }
    if (token.type === 'italic') {
      return (
        <em key={idx} className="italic text-zinc-800 dark:text-zinc-200">
          {token.value}
        </em>
      );
    }
    if (token.type === 'code') {
      return (
        <code
          key={idx}
          className="font-mono text-[0.875em] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
        >
          {token.value}
        </code>
      );
    }
    if (token.type === 'link') {
      return (
        <a
          key={idx}
          href={token.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {token.label}
        </a>
      );
    }
    return <Fragment key={idx}>{token.value}</Fragment>;
  });
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px] sm:text-base">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h2
                key={index}
                className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight pt-2"
              >
                {renderInline(block.text)}
              </h2>
            );
          }
          if (block.level === 2) {
            return (
              <h3
                key={index}
                className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight pt-2"
              >
                {renderInline(block.text)}
              </h3>
            );
          }
          return (
            <h4
              key={index}
              className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-200 pt-1"
            >
              {renderInline(block.text)}
            </h4>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={index}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-4 text-zinc-800 dark:text-zinc-200 italic"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === 'code') {
          return (
            <div
              key={index}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden"
            >
              {block.lang ? (
                <div className="px-4 py-2 text-xs font-mono text-zinc-400 border-b border-zinc-800">
                  {block.lang}
                </div>
              ) : null}
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        if (block.type === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul';
          return (
            <Tag
              key={index}
              className={`space-y-2 pl-5 ${
                block.ordered ? 'list-decimal' : 'list-disc'
              }`}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-zinc-700 dark:text-zinc-300">
                  {renderInline(item)}
                </li>
              ))}
            </Tag>
          );
        }

        return (
          <p key={index} className="text-zinc-700 dark:text-zinc-300 leading-[1.7]">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
