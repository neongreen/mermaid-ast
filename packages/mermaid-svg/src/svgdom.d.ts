/**
 * Type declarations for svgdom
 */

declare module 'svgdom' {
  interface SVGWindow extends Window {
    document: Document;
  }

  export function createSVGWindow(): SVGWindow;
  export function createSVGDocument(): Document;
}
