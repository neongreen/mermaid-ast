/**
 * SVG context management using svgdom and svg.js
 *
 * Provides a server-side SVG canvas that works without a browser.
 */

import { registerWindow, SVG, type Svg } from '@svgdotjs/svg.js';
import { createSVGWindow } from 'svgdom';

/**
 * SVG context for server-side rendering
 */
export interface SvgContext {
  /** The root SVG element */
  canvas: Svg;

  /** Get the SVG string output */
  toSvg(): string;

  /** Clean up resources */
  dispose(): void;
}

/**
 * Create a new SVG context for server-side rendering
 */
export function createSvgContext(width: number, height: number): SvgContext {
  // Create a virtual DOM window
  const window = createSVGWindow();
  const document = window.document;

  // Register the window with svg.js
  registerWindow(window, document);

  // Create the SVG canvas
  const canvas = SVG(document.documentElement) as Svg;
  canvas.size(width, height);
  canvas.attr('xmlns', 'http://www.w3.org/2000/svg');

  return {
    canvas,

    toSvg(): string {
      return canvas.svg();
    },

    dispose(): void {
      // Clean up if needed
      canvas.clear();
    },
  };
}

/**
 * Measure text dimensions using svgdom
 *
 * This creates a temporary SVG context to measure text.
 */
export function measureText(
  text: string,
  fontSize: number,
  fontFamily: string
): { width: number; height: number } {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);

  const canvas = SVG(document.documentElement) as Svg;
  const textEl = canvas.text(text).font({
    family: fontFamily,
    size: fontSize,
  });

  // Get the bounding box
  const bbox = textEl.bbox();

  return {
    width: bbox.width,
    height: bbox.height,
  };
}
