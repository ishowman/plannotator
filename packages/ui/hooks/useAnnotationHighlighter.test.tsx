import { describe, expect, test } from 'bun:test';
import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { useAnnotationHighlighter } from './useAnnotationHighlighter';
import { AnnotationType, type Annotation } from '../types';

const hasDom = typeof document !== 'undefined';

function Harness({
  mode,
  onAdd,
}: {
  mode: 'redline' | 'selection';
  onAdd: (ann: Annotation) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useAnnotationHighlighter({
    containerRef,
    annotations: [],
    selectedAnnotationId: null,
    mode,
    onAddAnnotation: onAdd,
  });

  return (
    <div ref={containerRef}>
      <p data-block-id="block-1">
        Formula{' '}
        <span
          className="math-inline math-annotatable"
          data-math-tex="E = mc^2"
          data-math-display="false"
        >
          E = mc^2
        </span>
      </p>
    </div>
  );
}

describe('useAnnotationHighlighter math annotations', () => {
  test.skipIf(!hasDom)('redline mode annotates an inline formula as a whole math target', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const annotations: Annotation[] = [];

    await act(async () => {
      root.render(<Harness mode="redline" onAdd={(ann) => annotations.push(ann)} />);
    });

    const math = host.querySelector<HTMLElement>('.math-annotatable');
    expect(math).toBeTruthy();

    await act(async () => {
      math!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      math!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(annotations).toHaveLength(1);
    expect(annotations[0].type).toBe(AnnotationType.DELETION);
    expect(annotations[0].blockId).toBe('block-1');
    expect(annotations[0].originalText).toBe('E = mc^2');
    expect(math!.dataset.mathAnnotation).toBe('true');
    expect(math!.classList.contains('annotation-highlight')).toBe(true);
    expect(math!.classList.contains('math-inline-annotation')).toBe(true);
    expect(math!.classList.contains('deletion')).toBe(true);

    act(() => {
      root.unmount();
    });
    host.remove();
  });
});
