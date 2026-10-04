import { renderToString } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { Latex } from '../components/common/Latex';

describe('Latex component', () => {
  it('renders pure math via math prop', () => {
    const html = renderToString(<Latex math="ET_c" />);
    expect(html).toContain('katex');
    expect(html).toContain('c');
  });

  it('renders pure math via children string', () => {
    const html = renderToString(<Latex>P</Latex>);
    expect(html).toContain('katex');
    expect(html).toContain('P');
  });

  it('renders mixed string with $inline$ math delimiters', () => {
    const html = renderToString(<Latex>Precipitation baseline ($P$) and crop demand ($ET_c$)</Latex>);
    expect(html).toContain('Precipitation baseline');
    expect(html).toContain('katex');
    expect(html).toContain('crop demand');
  });

  it('renders block mode when requested', () => {
    const html = renderToString(<Latex math="A = R \cdot K \cdot LS \cdot C \cdot P" block />);
    expect(html).toContain('katex-display');
  });

  it('gracefully falls back to plain text on unparseable math without rendering error markers', () => {
    const html = renderToString(<Latex math="\\invalidCommand{abc" />);
    expect(html).not.toContain('katex-error');
    expect(html).toContain('\\invalidCommand{abc');
  });

  it('renders all formulas from SUBFILTER_METHODOLOGIES registry cleanly into KaTeX nodes', async () => {
    const { SUBFILTER_METHODOLOGIES } = await import('../features/map/subfilters');
    for (const [key, m] of Object.entries(SUBFILTER_METHODOLOGIES)) {
      if (m.formula) {
        const html = renderToString(<Latex>{m.formula}</Latex>);
        expect(html, `Formula failed for ${key}: ${m.formula}`).toContain('katex');
        expect(html, `Formula contained error for ${key}: ${m.formula}`).not.toContain('katex-error');
      }
      if (m.variables) {
        for (const v of m.variables) {
          if (v.symbol) {
            const html = renderToString(<Latex>{v.symbol}</Latex>);
            expect(html, `Variable symbol failed for ${key} symbol ${v.symbol}`).toContain('katex');
            expect(html, `Variable symbol contained error for ${key} symbol ${v.symbol}`).not.toContain('katex-error');
          }
        }
      }
    }
  });
});
