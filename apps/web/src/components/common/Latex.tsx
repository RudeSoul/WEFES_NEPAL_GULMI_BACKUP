import React from 'react';

import katex from 'katex';

import 'katex/dist/katex.min.css';

export interface LatexProps {
  /**
   * Pure LaTeX math string to render (e.g. "ET_c", "P", "S_t", "\frac{a}{b}").
   * Takes precedence over children if provided.
   */
  math?: string;

  /**
   * Child content. Can be:
   * 1. Pure math string (e.g. <Latex>ET_c</Latex>)
   * 2. Mixed text containing $inline$ or $$block$$ math delimiters
   *    (e.g. <Latex>Evapotranspiration ($ET_c$) for Madane</Latex>)
   * 3. Any standard React nodes (non-string nodes pass through)
   */
  children?: React.ReactNode;

  /**
   * If true, renders equation in block display mode (centered on its own line).
   * Defaults to false (inline mode).
   */
  block?: boolean;

  /**
   * Additional CSS classes applied to the root wrapper.
   */
  className?: string;
}

/**
 * Parses mixed text containing $...$ or $$...$$ delimiters and converts
 * matched LaTeX math expressions into KaTeX HTML nodes.
 */
function parseMixedContent(text: string): React.ReactNode[] {
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const isDisplay = Boolean(match[1]);
    const mathFormula = match[1] || match[2];

    try {
      const renderedHtml = katex.renderToString(mathFormula.trim(), {
        displayMode: isDisplay,
        throwOnError: true,
        strict: 'ignore',
      });

      elements.push(
        <span
          key={`katex-${match.index}`}
          className={isDisplay ? 'block my-1 text-center font-normal' : 'inline-block align-baseline font-normal'}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );
    } catch {
      elements.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
}

/**
 * Recursively scans React children nodes (strings, arrays, React elements).
 * Any string containing $...$ or $$...$$ delimiters is parsed into KaTeX nodes.
 */
function processChildren(node: React.ReactNode): React.ReactNode {
  if (node === null || node === undefined || typeof node === 'boolean' || typeof node === 'number') {
    return node;
  }
  if (typeof node === 'string') {
    if (/\$\$[\s\S]+?\$\$|\$[^$]+\$/.test(node)) {
      return parseMixedContent(node);
    }
    return node;
  }
  if (Array.isArray(node)) {
    return React.Children.map(node, (child) => processChildren(child));
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props && props.children !== undefined) {
      return React.cloneElement(node, {
        ...props,
        children: processChildren(props.children),
      });
    }
    return node;
  }
  return node;
}

/**
 * Latex Component
 * Renders LaTeX mathematical formulas using KaTeX.
 * Supports inline/block math, pure math syntax, and mixed text/JSX with $...$ delimiters.
 */
export const Latex: React.FC<LatexProps> = ({ math, children, block = false, className = '' }) => {
  // If math prop is explicitly provided, render pure math formula
  if (math !== undefined) {
    try {
      const html = katex.renderToString(math, {
        displayMode: block,
        throwOnError: true,
        strict: 'ignore',
      });

      if (block) {
        return (
          <div className={`my-2 text-center font-normal ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
        );
      }

      return (
        <span
          className={`inline-block align-baseline font-normal ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <span className={className}>{math}</span>;
    }
  }

  // If children is a string, check if it contains mixed math delimiters or pure math
  if (typeof children === 'string') {
    const hasDelimiters = /\$\$[\s\S]+?\$\$|\$[^$]+\$/.test(children);

    if (hasDelimiters) {
      const parsed = parseMixedContent(children);
      return <span className={className}>{parsed}</span>;
    }

    // Pure math string inside <Latex>children</Latex>
    try {
      const html = katex.renderToString(children, {
        displayMode: block,
        throwOnError: true,
        strict: 'ignore',
      });

      if (block) {
        return (
          <div className={`my-2 text-center font-normal ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
        );
      }

      return (
        <span
          className={`inline-block align-baseline font-normal ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <span className={className}>{children}</span>;
    }
  }

  // If children contains elements, arrays, or fragments, recursively process mixed delimiters
  if (children !== undefined && children !== null) {
    const processed = processChildren(children);
    if (block) {
      return <div className={`my-2 text-center font-normal ${className}`}>{processed}</div>;
    }
    return <span className={className}>{processed}</span>;
  }

  return null;
};

export default Latex;
