import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Very small inline-markup parser: supports **bold**, *italic*, and $inline math$
 * inside paragraph/list text without pulling in a full markdown parser.
 */
function renderInline(text = '') {
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith('**')) {
      tokens.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      tokens.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('$')) {
      tokens.push(<InlineMath key={key++} math={token.slice(1, -1)} />);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

const headingClasses = {
  1: 'text-4xl font-bold tracking-tight text-gray-900',
  2: 'text-3xl font-bold tracking-tight text-gray-900',
  3: 'text-2xl font-semibold text-gray-900',
  4: 'text-xl font-semibold text-gray-900'
};

const calloutClasses = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-brand-50 text-brand-800 border-brand-200'
};

function NestedList({ items = [], ordered }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-1`}>
      {items.map((item, idx) => (
        <li key={idx}>
          {renderInline(item.text)}
          {item.items && item.items.length > 0 && (
            <ul className="list-disc pl-6 mt-1 space-y-1">
              {item.items.map((child, cIdx) => (
                <li key={cIdx}>{renderInline(child.text)}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </Tag>
  );
}

export default function BlockRenderer({ blocks = [] }) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedBlocks.map((block) => {
        const key = block._id;

        switch (block.type) {
          case 'header': {
            const level = block.data.level || 2;
            const Tag = `h${level}`;
            return (
              <Tag key={key} className={headingClasses[level] || headingClasses[2]}>
                {block.data.text}
              </Tag>
            );
          }

          case 'paragraph':
            return (
              <p key={key} className="text-base leading-7 text-gray-700">
                {renderInline(block.data.text)}
              </p>
            );

          case 'list':
            return <NestedList key={key} items={block.data.items} ordered={block.data.ordered} />;

          case 'callout':
            return (
              <div
                key={key}
                className={`border rounded-lg px-4 py-3 text-sm ${
                  calloutClasses[block.data.variant] || calloutClasses.info
                }`}
              >
                {renderInline(block.data.text)}
              </div>
            );

          case 'equation': {
            const { equation, displayMode } = block.data;
            return (
              <div key={key} className="my-2 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                {displayMode ? (
                  <BlockMath math={equation} />
                ) : (
                  <p className="flex items-center gap-2">
                    <InlineMath math={equation} />
                  </p>
                )}
              </div>
            );
          }

          case 'table': {
            const { headers = [], rows = [] } = block.data;
            return (
              <div key={key} className="overflow-x-auto my-2 border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'image':
            return (
              <figure key={key} className="my-2">
                <img src={block.data.url} alt={block.data.alt || ''} className="rounded-lg w-full object-cover" />
                {block.data.caption && (
                  <figcaption className="text-xs text-gray-500 mt-2">{block.data.caption}</figcaption>
                )}
              </figure>
            );

          default:
            return (
              <div key={key} className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded border">
                Unknown content block: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
}
