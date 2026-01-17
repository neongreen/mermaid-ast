/**
 * Unit tests for text rendering
 */

import { describe, expect, it } from 'bun:test';
import { createSvgContext, measureText } from '../../src/svg-context.js';
import { defaultTheme } from '../../src/themes/default.js';

describe('Text Measurement', () => {
  it('should return positive dimensions for text', () => {
    const { width, height } = measureText(
      'Hello World',
      defaultTheme.fontSize,
      defaultTheme.fontFamily
    );

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  it('should return larger width for longer text', () => {
    const short = measureText('Hi', defaultTheme.fontSize, defaultTheme.fontFamily);
    const long = measureText('Hello World', defaultTheme.fontSize, defaultTheme.fontFamily);

    expect(long.width).toBeGreaterThan(short.width);
  });

  it('should return larger height for larger font size', () => {
    const small = measureText('Test', 12, defaultTheme.fontFamily);
    const large = measureText('Test', 24, defaultTheme.fontFamily);

    expect(large.height).toBeGreaterThan(small.height);
  });

  it('should handle empty string', () => {
    const { width, height } = measureText('', defaultTheme.fontSize, defaultTheme.fontFamily);

    // Empty string should have zero or minimal width
    expect(width).toBeGreaterThanOrEqual(0);
    expect(height).toBeGreaterThanOrEqual(0);
  });

  it('should handle special characters', () => {
    const { width, height } = measureText(
      'Hello → World',
      defaultTheme.fontSize,
      defaultTheme.fontFamily
    );

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});

describe('SVG Context', () => {
  it('should create a valid SVG context', () => {
    const ctx = createSvgContext(800, 600);

    expect(ctx).toBeDefined();
    expect(ctx.canvas).toBeDefined();
    expect(ctx.toSvg).toBeDefined();
  });

  it('should generate valid SVG string', () => {
    const ctx = createSvgContext(800, 600);
    const svg = ctx.toSvg();

    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should support adding elements', () => {
    const ctx = createSvgContext(200, 200);

    ctx.canvas.rect(50, 50).fill('#ff0000');

    const svg = ctx.toSvg();
    expect(svg).toContain('<rect');
    expect(svg).toContain('#ff0000');
  });

  it('should support adding text', () => {
    const ctx = createSvgContext(200, 200);

    ctx.canvas.text('Hello').move(10, 10);

    const svg = ctx.toSvg();
    expect(svg).toContain('Hello');
  });
});
