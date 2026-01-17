/**
 * Text rendering utilities
 */

import type { Svg, Text } from '@svgdotjs/svg.js';
import type { Theme } from '../types.js';

export interface TextOptions {
  /** Font family */
  fontFamily?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Text color */
  fill?: string;
  /** Text anchor: start, middle, end */
  anchor?: 'start' | 'middle' | 'end';
  /** Dominant baseline */
  dominantBaseline?: 'auto' | 'middle' | 'hanging';
}

/**
 * Render text with default styling
 */
export function renderText(
  canvas: Svg,
  text: string,
  x: number,
  y: number,
  theme: Theme,
  options: TextOptions = {}
): Text {
  const textEl = canvas
    .text(text)
    .font({
      family: options.fontFamily ?? theme.fontFamily,
      size: options.fontSize ?? theme.fontSize,
      anchor: options.anchor ?? 'middle',
    })
    .fill(options.fill ?? theme.nodeTextColor);

  // Position the text
  if (options.anchor === 'middle') {
    textEl.center(x, y);
  } else {
    textEl.move(x, y);
  }

  return textEl;
}

/**
 * Render centered text within a bounding box
 */
export function renderCenteredText(
  canvas: Svg,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: Theme,
  options: TextOptions = {}
): Text {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return renderText(canvas, text, centerX, centerY, theme, {
    ...options,
    anchor: 'middle',
  });
}

/**
 * Wrap text to fit within a maximum width
 * Returns an array of lines
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  _fontFamily: string
): string[] {
  // Simple word-based wrapping
  // Note: This is approximate since we don't have exact text metrics
  const avgCharWidth = fontSize * 0.6; // Approximate average character width
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  if (text.length <= maxCharsPerLine) {
    return [text];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
