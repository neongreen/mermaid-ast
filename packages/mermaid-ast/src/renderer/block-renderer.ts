/**
 * Block Diagram Renderer
 *
 * Renders BlockAST back to Mermaid block-beta diagram syntax.
 */

import type { Doc } from './doc.js';
import { indent, render, when } from './doc.js';
import type {
  BlockAST,
  BlockApplyClass,
  BlockApplyStyles,
  BlockClassDef,
  BlockColumnSetting,
  BlockComposite,
  BlockEdge,
  BlockElement,
  BlockNode,
  BlockNodeShape,
  BlockSpace,
} from '../types/block.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Maps BlockNodeShape to opening/closing delimiters
 */
function getShapeDelimiters(shape: BlockNodeShape): [string, string] {
  switch (shape) {
    case 'square':
      return ['[', ']'];
    case 'round':
      return ['(', ')'];
    case 'circle':
      return ['((', '))'];
    case 'doublecircle':
      return ['(((', ')))'];
    case 'diamond':
      return ['{', '}'];
    case 'hexagon':
      return ['{{', '}}'];
    case 'stadium':
      return ['([', '])'];
    case 'subroutine':
      return ['[[', ']]'];
    case 'cylinder':
      return ['[(', ')]'];
    case 'asymmetric':
      return ['>', ']'];
    case 'trapezoid':
      return ['[/', '\\]'];
    case 'trapezoid-alt':
      return ['[\\', '/]'];
    case 'lean-right':
      return ['[/', ']'];
    case 'lean-left':
      return ['[\\', ']'];
    case 'block-arrow':
      return ['<[', ']>'];
    default:
      return ['[', ']'];
  }
}

/**
 * Maps BlockEdgeType to edge string
 */
function getEdgeString(edgeType: string): string {
  switch (edgeType) {
    case 'arrow':
      return '-->';
    case 'open':
      return '---';
    case 'dotted':
      return '-.->';
    case 'thick':
      return '==>';
    case 'invisible':
      return '~~~';
    default:
      return '-->';
  }
}

/**
 * Renders a single block node
 */
function renderNode(node: BlockNode): Doc {
  const [open, close] = getShapeDelimiters(node.shape);
  const label = node.label || node.id;
  
  let result = `${node.id}${open}"${label}"${close}`;
  
  // Add directions for block arrows
  if (node.shape === 'block-arrow' && node.directions && node.directions.length > 0) {
    result = `${node.id}<["${label}"]>(${node.directions.join(', ')})`;
  }
  
  // Add width if not default
  if (node.widthInColumns > 1) {
    result += `:${node.widthInColumns}`;
  }
  
  return result;
}

/**
 * Renders a space block
 */
function renderSpace(space: BlockSpace): Doc {
  if (space.width === 1) {
    return 'space';
  }
  return `space:${space.width}`;
}

/**
 * Renders a column setting
 */
function renderColumnSetting(setting: BlockColumnSetting): Doc {
  if (setting.columns === -1) {
    return 'columns auto';
  }
  return `columns ${setting.columns}`;
}

/**
 * Renders a class definition
 */
function renderClassDef(classDef: BlockClassDef): Doc {
  return `classDef ${classDef.id} ${classDef.css}`;
}

/**
 * Renders a class application
 */
function renderApplyClass(applyClass: BlockApplyClass): Doc {
  return `class ${applyClass.id} ${applyClass.styleClass}`;
}

/**
 * Renders a style application
 */
function renderApplyStyles(applyStyles: BlockApplyStyles): Doc {
  return `style ${applyStyles.id} ${applyStyles.stylesStr}`;
}

/**
 * Renders an edge
 */
function renderEdge(edge: BlockEdge): Doc {
  const edgeStr = getEdgeString(edge.edgeType);
  if (edge.label) {
    // Edge with label uses different syntax
    const startEdge = edgeStr.substring(0, 2); // '--' or '==' or '-.'
    const endEdge = edgeStr.substring(2); // '>' or '-' or '>'
    return `${edge.start} ${startEdge}"${edge.label}"${endEdge} ${edge.end}`;
  }
  return `${edge.start} ${edgeStr} ${edge.end}`;
}

/**
 * Renders a composite block
 */
function renderComposite(composite: BlockComposite, options: RenderOptions): Doc {
  const header = composite.label 
    ? `block:${composite.id}["${composite.label}"]`
    : `block:${composite.id}`;
  
  const children = composite.children.map(child => renderElement(child, options));
  
  return [
    header,
    indent(children),
    'end',
  ];
}

/**
 * Renders a single element
 */
function renderElement(element: BlockElement, options: RenderOptions): Doc {
  // Type guards based on properties
  if ('type' in element) {
    switch (element.type) {
      case 'space':
        return renderSpace(element as BlockSpace);
      case 'composite':
        return renderComposite(element as BlockComposite, options);
      case 'column-setting':
        return renderColumnSetting(element as BlockColumnSetting);
      case 'classDef':
        return renderClassDef(element as BlockClassDef);
      case 'applyClass':
        return renderApplyClass(element as BlockApplyClass);
      case 'applyStyles':
        return renderApplyStyles(element as BlockApplyStyles);
    }
  }
  
  // Check for edge (has start and end)
  if ('start' in element && 'end' in element) {
    return renderEdge(element as BlockEdge);
  }
  
  // Default: node
  if ('shape' in element) {
    return renderNode(element as BlockNode);
  }
  
  return '';
}

/**
 * Renders a BlockAST to Mermaid block-beta diagram syntax
 */
export function renderBlock(ast: BlockAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  
  const doc: Doc = [
    'block-beta',
    when(ast.accTitle, `accTitle: ${ast.accTitle}`),
    when(ast.accDescr, `accDescr: ${ast.accDescr}`),
    indent(ast.elements.map(element => renderElement(element, opts))),
  ];
  
  return render(doc, opts.indent);
}