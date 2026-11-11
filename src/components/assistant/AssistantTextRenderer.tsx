import React from 'react';
import { University } from '../../types';
import { UNIVERSITIES } from '../../data/mockData';

interface AssistantTextRendererProps {
  content: string;
  onSelectUniversity?: (vuz: University) => void;
  onClose?: () => void;
}

/**
 * Parses markdown-like text tokens:
 * - Bold: **text**
 * - Inline university links: [vuz:id:Name]
 */
export function renderTextWithCitations(
  text: string,
  onSelectUniversity?: (vuz: University) => void,
  onClose?: () => void
): React.ReactNode {
  const parts = text.split(/(\[vuz:[a-z0-9_-]+:[^\]]+\]|\*\*[^*]+\*\*)/g);

  return parts.map((token, tIdx) => {
    if (token.startsWith('[vuz:') && token.endsWith(']')) {
      const match = token.match(/\[vuz:([a-z0-9_-]+):([^\]]+)\]/);
      if (match) {
        const vuzId = match[1];
        const vuzName = match[2];
        const vuzObj = UNIVERSITIES.find((u) => u.id === vuzId);

        return (
          <button
            key={tIdx}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (vuzObj && onSelectUniversity) {
                onSelectUniversity(vuzObj);
                if (onClose) onClose();
              }
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 font-bold text-xs transition cursor-pointer border border-blue-300 dark:border-blue-700 hover:scale-105 transform active:scale-95"
            title={`Открыть подробную карточку: ${vuzName}`}
          >
            <span>🏛️</span>
            <span>{vuzName}</span>
          </button>
        );
      }
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={tIdx} className="font-bold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }

    return token;
  });
}

/**
 * Full Markdown-like text renderer supporting:
 * - Markdown tables (| col1 | col2 |)
 * - Headers (##, ###)
 * - Bullet points (•, *, -)
 * - Numbered lists (1., 2.)
 * - Inline citations and bolding
 */
export const AssistantTextRenderer: React.FC<AssistantTextRendererProps> = ({
  content,
  onSelectUniversity,
  onClose,
}) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Detect Markdown Table
    if (
      line.trim().startsWith('|') &&
      line.trim().endsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].includes('---')
    ) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim());

        const bodyLines = tableLines.slice(2);
        const rowCells = bodyLines.map((bLine) =>
          bLine
            .split('|')
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim())
        );

        elements.push(
          <div
            key={`table-${i}`}
            className="overflow-x-auto my-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                      {renderTextWithCitations(h, onSelectUniversity, onClose)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {rowCells.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-3.5 py-2.5 ${
                          cIdx === 0
                            ? 'font-semibold text-slate-900 dark:text-white bg-slate-50/40 dark:bg-slate-900/40'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {renderTextWithCitations(cell, onSelectUniversity, onClose)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Normal Line Parsing
    const isBullet =
      line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ');
    const isNumbered = /^\d+\.\s/.test(line.trim());
    const isHeader = line.trim().startsWith('###') || line.trim().startsWith('##');

    let cleanLine = line;
    if (isBullet) {
      cleanLine = line.replace(/^\s*[•\*\-]\s*/, '');
    } else if (isHeader) {
      cleanLine = line.replace(/^\s*#+\s*/, '');
    }

    const parsedContent = renderTextWithCitations(cleanLine, onSelectUniversity, onClose);

    if (isHeader) {
      elements.push(
        <h4 key={i} className="font-extrabold text-sm text-slate-900 dark:text-white mt-3 mb-1">
          {parsedContent}
        </h4>
      );
    } else if (isBullet) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1 my-0.5 text-xs sm:text-sm">
          <span className="text-blue-500 font-bold shrink-0">•</span>
          <span>{parsedContent}</span>
        </div>
      );
    } else if (isNumbered) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1 my-0.5 text-xs sm:text-sm">
          <span>{parsedContent}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={i} className={line.trim() === '' ? 'h-2' : 'my-0.5 text-xs sm:text-sm leading-relaxed'}>
          {parsedContent}
        </p>
      );
    }

    i++;
  }

  return <>{elements}</>;
};
