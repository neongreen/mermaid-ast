/**
 * Default theme for mermaid-svg
 */

import type { Theme } from '../types.js';

/**
 * Default theme configuration
 * Based on mermaid.js default theme colors
 */
export const defaultTheme: Theme = {
  // Background
  background: '#ffffff',

  // Node styling
  nodeFill: '#ECECFF',
  nodeStroke: '#9370DB',
  nodeStrokeWidth: 1,
  nodeTextColor: '#333333',

  // Edge styling
  edgeStroke: '#333333',
  edgeStrokeWidth: 2,
  edgeTextColor: '#333333',

  // Typography
  fontFamily: 'arial, sans-serif',
  fontSize: 14,

  // Sizing
  nodePadding: 8,
  nodeMinWidth: 50,
  nodeMinHeight: 30,
};

/**
 * Merge user theme with default theme
 */
export function mergeTheme(userTheme?: Partial<Theme>): Theme {
  if (!userTheme) {
    return { ...defaultTheme };
  }
  return { ...defaultTheme, ...userTheme };
}
