/**
 * Block Diagram Parser
 *
 * Parses block-beta diagram syntax into BlockAST using the vendored JISON parser.
 */

// @ts-expect-error - JISON parser has no types
import blockParser from '../vendored/parsers/block.js';
import {
  type BlockAST,
  type BlockApplyClass,
  type BlockApplyStyles,
  type BlockClassDef,
  type BlockColumnSetting,
  type BlockComposite,
  type BlockEdge,
  type BlockEdgeType,
  type BlockElement,
  type BlockNode,
  type BlockNodeShape,
  type BlockSpace,
  createEmptyBlockAST,
} from '../types/block.js';

/**
 * Maps JISON type strings to BlockNodeShape
 */
function typeStrToShape(typeStr: string | undefined): BlockNodeShape {
  if (!typeStr) return 'square';

  // Normalize the type string
  const normalized = typeStr.trim();

  // Map based on the shape delimiters
  if (
    normalized === '[]' ||
    (normalized.startsWith('[') &&
      normalized.endsWith(']') &&
      !normalized.includes('(') &&
      !normalized.includes('[|') &&
      !normalized.includes('[['))
  ) {
    return 'square';
  }
  if (normalized === '(())' || (normalized.startsWith('((') && normalized.endsWith('))'))) {
    return 'circle';
  }
  if (normalized === '((()))' || (normalized.startsWith('(((') && normalized.endsWith(')))'))) {
    return 'doublecircle';
  }
  if (
    normalized === '()' ||
    (normalized.startsWith('(') && normalized.endsWith(')') && !normalized.startsWith('(('))
  ) {
    return 'round';
  }
  if (normalized === '{{}}' || (normalized.startsWith('{{') && normalized.endsWith('}}'))) {
    return 'hexagon';
  }
  if (normalized === '{}' || (normalized.startsWith('{') && normalized.endsWith('}'))) {
    return 'diamond';
  }
  if (normalized === '([])' || (normalized.startsWith('([') && normalized.endsWith('])'))) {
    return 'stadium';
  }
  if (normalized === '[[]]' || (normalized.startsWith('[[') && normalized.endsWith(']]'))) {
    return 'subroutine';
  }
  if (normalized === '[()]' || (normalized.startsWith('[(') && normalized.endsWith(')]'))) {
    return 'cylinder';
  }
  if (normalized === '>]' || (normalized.startsWith('>') && normalized.endsWith(']'))) {
    return 'asymmetric';
  }
  if (normalized.startsWith('[/') && normalized.endsWith('\\]')) {
    return 'trapezoid';
  }
  if (normalized.startsWith('[\\') && normalized.endsWith('/]')) {
    return 'trapezoid-alt';
  }
  if (normalized.startsWith('[/') && normalized.endsWith(']')) {
    return 'lean-right';
  }
  if (normalized.startsWith('[\\') && normalized.endsWith(']')) {
    return 'lean-left';
  }
  if (normalized.startsWith('<[') && normalized.endsWith(']>')) {
    return 'block-arrow';
  }

  return 'square';
}

/**
 * Maps edge type strings to BlockEdgeType
 */
function edgeStrToEdgeType(edgeStr: string): BlockEdgeType {
  const trimmed = edgeStr.trim();

  if (trimmed.includes('===') || trimmed.includes('==>') || trimmed.includes('<==')) {
    return 'thick';
  }
  if (trimmed.includes('-.') || trimmed.includes('.-')) {
    return 'dotted';
  }
  if (trimmed.includes('~~~')) {
    return 'invisible';
  }
  if (
    trimmed.includes('-->') ||
    trimmed.includes('<--') ||
    trimmed.includes('--x') ||
    trimmed.includes('x--') ||
    trimmed.includes('--o') ||
    trimmed.includes('o--')
  ) {
    return 'arrow';
  }
  if (trimmed.includes('---')) {
    return 'open';
  }

  return 'arrow';
}

/**
 * Creates the yy object for the JISON parser
 */
function createBlockYY(ast: BlockAST) {
  let idCounter = 0;

  return {
    getLogger: () => ({
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    }),

    generateId: () => {
      return `block_${++idCounter}`;
    },

    setHierarchy: (elements: unknown[]) => {
      processElements(elements, ast);
    },

    typeStr2Type: (typeStr: string): string => {
      // This is used by the parser to determine node type
      // We'll handle this in our processing
      return typeStr || 'square';
    },

    edgeStrToEdgeData: (edgeStr: string): string => {
      // Return the edge type for arrow end
      return edgeStrToEdgeType(edgeStr);
    },

    setAccTitle: (title: string) => {
      ast.accTitle = title?.trim();
    },

    getAccTitle: () => ast.accTitle,

    setAccDescription: (descr: string) => {
      ast.accDescr = descr?.trim();
    },

    getAccDescription: () => ast.accDescr,

    setDiagramTitle: () => {},
    getDiagramTitle: () => '',

    clear: () => {
      ast.elements = [];
      ast.classDefs.clear();
      ast.classAssignments.clear();
      ast.styleAssignments.clear();
      idCounter = 0;
    },
  };
}

/**
 * Process raw elements from the parser into our AST structure
 */
function processElements(rawElements: unknown[], ast: BlockAST): void {
  if (!Array.isArray(rawElements)) return;

  for (const raw of rawElements) {
    if (!raw || typeof raw !== 'object') continue;

    const elem = raw as Record<string, unknown>;

    // Handle column setting
    if (elem.type === 'column-setting') {
      const columnSetting: BlockColumnSetting = {
        type: 'column-setting',
        columns: typeof elem.columns === 'number' ? elem.columns : -1,
      };
      ast.elements.push(columnSetting);
      continue;
    }

    // Handle space block
    if (elem.type === 'space') {
      const space: BlockSpace = {
        id: String(elem.id || `space_${ast.elements.length}`),
        type: 'space',
        width: typeof elem.width === 'number' ? elem.width : 1,
      };
      ast.elements.push(space);
      continue;
    }

    // Handle composite block
    if (elem.type === 'composite') {
      const composite: BlockComposite = {
        id: String(elem.id || `composite_${ast.elements.length}`),
        type: 'composite',
        label: elem.label ? String(elem.label) : undefined,
        children: [],
      };
      if (Array.isArray(elem.children)) {
        const childAst = createEmptyBlockAST();
        processElements(elem.children, childAst);
        composite.children = childAst.elements;
      }
      ast.elements.push(composite);
      continue;
    }

    // Handle edge
    if (elem.type === 'edge' && elem.start && elem.end) {
      const edge: BlockEdge = {
        id: String(elem.id || `edge_${ast.elements.length}`),
        start: String(elem.start),
        end: String(elem.end),
        label: elem.label ? String(elem.label) : undefined,
        edgeType: (elem.arrowTypeEnd as BlockEdgeType) || 'arrow',
      };
      ast.elements.push(edge);
      continue;
    }

    // Handle classDef
    if (elem.type === 'classDef') {
      const classDef: BlockClassDef = {
        type: 'classDef',
        id: String(elem.id || ''),
        css: String(elem.css || ''),
      };
      ast.classDefs.set(classDef.id, classDef.css);
      ast.elements.push(classDef);
      continue;
    }

    // Handle applyClass
    if (elem.type === 'applyClass') {
      const applyClass: BlockApplyClass = {
        type: 'applyClass',
        id: String(elem.id || ''),
        styleClass: String(elem.styleClass || ''),
      };
      // Store the assignment
      for (const nodeId of applyClass.id.split(',').map((s) => s.trim())) {
        ast.classAssignments.set(nodeId, applyClass.styleClass);
      }
      ast.elements.push(applyClass);
      continue;
    }

    // Handle applyStyles
    if (elem.type === 'applyStyles') {
      const applyStyles: BlockApplyStyles = {
        type: 'applyStyles',
        id: String(elem.id || ''),
        stylesStr: String(elem.stylesStr || ''),
      };
      // Store the assignment
      for (const nodeId of applyStyles.id.split(',').map((s) => s.trim())) {
        ast.styleAssignments.set(nodeId, applyStyles.stylesStr);
      }
      ast.elements.push(applyStyles);
      continue;
    }

    // Handle node (default case - has id but no special type or is a regular node type)
    if (elem.id) {
      const node: BlockNode = {
        id: String(elem.id),
        label: elem.label ? String(elem.label) : undefined,
        shape: typeStrToShape(elem.typeStr as string | undefined),
        widthInColumns: typeof elem.widthInColumns === 'number' ? elem.widthInColumns : 1,
        directions: Array.isArray(elem.directions) ? elem.directions : undefined,
      };
      ast.elements.push(node);
    }
  }
}

/**
 * Detects if the input is a block diagram
 */
export function isBlockDiagram(input: string): boolean {
  const trimmed = input.trim();
  return (
    trimmed.startsWith('block-beta') ||
    trimmed.startsWith('block\n') ||
    trimmed.startsWith('block\r') ||
    trimmed === 'block'
  );
}

/**
 * Parses block diagram syntax into BlockAST
 */
export function parseBlock(input: string): BlockAST {
  const ast = createEmptyBlockAST();

  // Normalize input
  let normalizedInput = input.trim();

  // Ensure proper header
  if (!normalizedInput.startsWith('block-beta') && !normalizedInput.startsWith('block')) {
    normalizedInput = `block-beta\n${normalizedInput}`;
  }

  // Ensure newline after header if needed
  if (
    normalizedInput.startsWith('block-beta') &&
    !normalizedInput.startsWith('block-beta\n') &&
    !normalizedInput.startsWith('block-beta\r')
  ) {
    normalizedInput = normalizedInput.replace('block-beta', 'block-beta\n');
  }
  if (
    normalizedInput.startsWith('block\n') === false &&
    normalizedInput.startsWith('block\r') === false &&
    normalizedInput.startsWith('block-beta') === false
  ) {
    if (normalizedInput.startsWith('block')) {
      normalizedInput = normalizedInput.replace(/^block/, 'block\n');
    }
  }

  // Set up parser
  blockParser.yy = createBlockYY(ast);

  try {
    blockParser.parse(normalizedInput);
  } catch (e) {
    // If parsing fails, return empty AST
    console.error('Block diagram parsing error:', e);
  }

  return ast;
}
