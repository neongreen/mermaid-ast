/**
 * Unit tests for theming
 */

import { describe, expect, it } from 'bun:test';
import { defaultTheme } from '../../src/themes/default.js';
import type { Theme } from '../../src/types.js';

describe('Default Theme', () => {
  it('should have all required properties', () => {
    expect(defaultTheme.background).toBeDefined();
    expect(defaultTheme.nodeFill).toBeDefined();
    expect(defaultTheme.nodeStroke).toBeDefined();
    expect(defaultTheme.nodeStrokeWidth).toBeDefined();
    expect(defaultTheme.nodeTextColor).toBeDefined();
    expect(defaultTheme.edgeStroke).toBeDefined();
    expect(defaultTheme.edgeStrokeWidth).toBeDefined();
    expect(defaultTheme.edgeTextColor).toBeDefined();
    expect(defaultTheme.fontFamily).toBeDefined();
    expect(defaultTheme.fontSize).toBeDefined();
    expect(defaultTheme.nodePadding).toBeDefined();
    expect(defaultTheme.nodeMinWidth).toBeDefined();
    expect(defaultTheme.nodeMinHeight).toBeDefined();
  });

  it('should have valid color values', () => {
    // Colors should be valid hex or named colors
    expect(defaultTheme.nodeFill).toMatch(/^#[0-9a-fA-F]{6}$|^[a-z]+$/);
    expect(defaultTheme.nodeStroke).toMatch(/^#[0-9a-fA-F]{6}$|^[a-z]+$/);
    expect(defaultTheme.edgeStroke).toMatch(/^#[0-9a-fA-F]{6}$|^[a-z]+$/);
    expect(defaultTheme.nodeTextColor).toMatch(/^#[0-9a-fA-F]{6}$|^[a-z]+$/);
    expect(defaultTheme.edgeTextColor).toMatch(/^#[0-9a-fA-F]{6}$|^[a-z]+$/);
  });

  it('should have positive stroke widths', () => {
    expect(defaultTheme.nodeStrokeWidth).toBeGreaterThan(0);
    expect(defaultTheme.edgeStrokeWidth).toBeGreaterThan(0);
  });

  it('should have positive font size', () => {
    expect(defaultTheme.fontSize).toBeGreaterThan(0);
  });

  it('should have a valid font family', () => {
    expect(defaultTheme.fontFamily.length).toBeGreaterThan(0);
  });

  it('should have positive padding and minimum dimensions', () => {
    expect(defaultTheme.nodePadding).toBeGreaterThan(0);
    expect(defaultTheme.nodeMinWidth).toBeGreaterThan(0);
    expect(defaultTheme.nodeMinHeight).toBeGreaterThan(0);
  });
});

describe('Custom Theme', () => {
  it('should allow overriding individual properties', () => {
    const customTheme: Theme = {
      ...defaultTheme,
      nodeFill: '#ff0000',
      nodeStroke: '#00ff00',
    };

    expect(customTheme.nodeFill).toBe('#ff0000');
    expect(customTheme.nodeStroke).toBe('#00ff00');
    // Other properties should remain from default
    expect(customTheme.fontSize).toBe(defaultTheme.fontSize);
  });

  it('should allow completely custom theme', () => {
    const customTheme: Theme = {
      background: '#0f0f0f',
      nodeFill: '#1a1a2e',
      nodeStroke: '#16213e',
      nodeStrokeWidth: 2,
      nodeTextColor: '#e94560',
      edgeStroke: '#0f3460',
      edgeStrokeWidth: 2,
      edgeTextColor: '#e94560',
      fontFamily: 'Courier New, monospace',
      fontSize: 16,
      nodePadding: 10,
      nodeMinWidth: 60,
      nodeMinHeight: 40,
    };

    expect(customTheme.nodeFill).toBe('#1a1a2e');
    expect(customTheme.fontFamily).toBe('Courier New, monospace');
    expect(customTheme.fontSize).toBe(16);
  });
});
