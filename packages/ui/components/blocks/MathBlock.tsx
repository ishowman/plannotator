import React, { useMemo } from 'react';
import katex from 'katex';
import type { Block } from '../../types';

type MathBlockProps = {
  block: Block;
};

export const renderMathToHtml = (tex: string, displayMode: boolean): string => (
  katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'warn',
    trust: false,
    output: 'html',
  })
);

export const MathBlock: React.FC<MathBlockProps> = ({ block }) => {
  const html = useMemo(() => renderMathToHtml(block.content, true), [block.content]);

  return (
    <div
      className="math-block my-5 overflow-x-auto py-2 text-foreground"
      data-block-id={block.id}
      data-block-type="math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
