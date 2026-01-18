/**
 * Block Diagram Wrapper Class
 *
 * Provides a fluent API for creating and manipulating block-beta diagrams.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseBlock } from './parser/block-parser.js';
import { renderBlock } from './renderer/block-renderer.js';
import type {
  BlockAST,
  BlockApplyClass,
  BlockApplyStyles,
  BlockArrowDirection,
  BlockClassDef,
  BlockColumnSetting,
  BlockComposite,
  BlockEdge,
  BlockEdgeType,
  BlockElement,
  BlockNode,
  BlockNodeShape,
  BlockSpace,
} from './types/block.js';
import {
  createEmptyBlockAST,
  isBlockComposite,
  isBlockEdge,
  isBlockNode,
  isBlockSpace,
} from './types/block.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a node
 */
export interface AddBlockNodeOptions {
  /** Node label (defaults to id if not provided) */
  label?: string;
  /** Node shape */
  shape?: BlockNodeShape;
  /** Width in columns */
  widthInColumns?: number;
  /** Directions for block arrows */
  directions?: BlockArrowDirection[];
}

/**
 * Options for adding an edge
 */
export interface AddBlockEdgeOptions {
  /** Edge label */
  label?: string;
  /** Edge type */
  edgeType?: BlockEdgeType;
}

/**
 * Block diagram wrapper class
 */
export class Block extends DiagramWrapper<BlockAST> {
  private constructor(ast: BlockAST) {
    super(ast);
  }

  /**
   * Creates an empty block diagram
   */
  static create(): Block {
    return new Block(createEmptyBlockAST());
  }

  /**
   * Creates a Block from an existing AST
   */
  static from(ast: BlockAST): Block {
    return new Block(ast);
  }

  /**
   * Parses Mermaid block-beta syntax into a Block
   */
  static parse(text: string): Block {
    return new Block(parseBlock(text));
  }

  /**
   * Renders the block diagram to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderBlock(this.ast, options);
  }

  /**
   * Creates a deep clone of this diagram
   */
  clone(): Block {
    return Block.parse(this.render());
  }

  // ============ Column Operations ============

  /**
   * Sets the number of columns for the layout
   */
  setColumns(columns: number | 'auto'): this {
    // Remove any existing column settings
    this.ast.elements = this.ast.elements.filter(
      (e) => !('type' in e && e.type === 'column-setting')
    );

    // Add new column setting at the beginning
    const setting: BlockColumnSetting = {
      type: 'column-setting',
      columns: columns === 'auto' ? -1 : columns,
    };
    this.ast.elements.unshift(setting);

    return this;
  }

  /**
   * Gets the current column setting
   */
  getColumns(): number | 'auto' | undefined {
    const setting = this.ast.elements.find((e) => 'type' in e && e.type === 'column-setting') as
      | BlockColumnSetting
      | undefined;

    if (!setting) return undefined;
    return setting.columns === -1 ? 'auto' : setting.columns;
  }

  // ============ Node Operations ============

  /**
   * Adds a node to the diagram
   */
  addNode(id: string, options?: AddBlockNodeOptions): this {
    const node: BlockNode = {
      id,
      label: options?.label,
      shape: options?.shape || 'square',
      widthInColumns: options?.widthInColumns || 1,
      directions: options?.directions,
    };
    this.ast.elements.push(node);
    return this;
  }

  /**
   * Gets a node by id
   */
  getNode(id: string): BlockNode | undefined {
    return this.findNodes().find((n) => n.id === id);
  }

  /**
   * Finds all nodes in the diagram (including nested)
   */
  findNodes(): BlockNode[] {
    const nodes: BlockNode[] = [];
    const collectNodes = (elements: BlockElement[]) => {
      for (const elem of elements) {
        if (isBlockNode(elem)) {
          nodes.push(elem);
        } else if (isBlockComposite(elem)) {
          collectNodes(elem.children);
        }
      }
    };
    collectNodes(this.ast.elements);
    return nodes;
  }

  /**
   * Removes a node by id
   */
  removeNode(id: string): this {
    this.ast.elements = this.ast.elements.filter((e) => !isBlockNode(e) || e.id !== id);
    return this;
  }

  /**
   * Gets the number of nodes
   */
  get nodeCount(): number {
    return this.findNodes().length;
  }

  // ============ Edge Operations ============

  /**
   * Adds an edge between two nodes
   */
  addEdge(from: string, to: string, options?: AddBlockEdgeOptions): this {
    const edge: BlockEdge = {
      id: `${from}-${to}`,
      start: from,
      end: to,
      label: options?.label,
      edgeType: options?.edgeType || 'arrow',
    };
    this.ast.elements.push(edge);
    return this;
  }

  /**
   * Finds all edges in the diagram
   */
  findEdges(): BlockEdge[] {
    return this.ast.elements.filter(isBlockEdge);
  }

  /**
   * Removes an edge by id or by source/target
   */
  removeEdge(idOrFrom: string, to?: string): this {
    if (to) {
      // Remove by source/target
      this.ast.elements = this.ast.elements.filter(
        (e) => !isBlockEdge(e) || !(e.start === idOrFrom && e.end === to)
      );
    } else {
      // Remove by id
      this.ast.elements = this.ast.elements.filter((e) => !isBlockEdge(e) || e.id !== idOrFrom);
    }
    return this;
  }

  /**
   * Gets the number of edges
   */
  get edgeCount(): number {
    return this.findEdges().length;
  }

  // ============ Space Operations ============

  /**
   * Adds a space block for layout
   */
  addSpace(width: number = 1): this {
    const space: BlockSpace = {
      id: `space_${Date.now()}`,
      type: 'space',
      width,
    };
    this.ast.elements.push(space);
    return this;
  }

  /**
   * Finds all space blocks
   */
  findSpaces(): BlockSpace[] {
    return this.ast.elements.filter(isBlockSpace);
  }

  // ============ Composite Block Operations ============

  /**
   * Adds a composite (nested) block
   */
  addComposite(id: string, label?: string): this {
    const composite: BlockComposite = {
      id,
      type: 'composite',
      label,
      children: [],
    };
    this.ast.elements.push(composite);
    return this;
  }

  /**
   * Gets a composite block by id
   */
  getComposite(id: string): BlockComposite | undefined {
    return this.ast.elements.find((e) => isBlockComposite(e) && e.id === id) as
      | BlockComposite
      | undefined;
  }

  /**
   * Finds all composite blocks
   */
  findComposites(): BlockComposite[] {
    return this.ast.elements.filter(isBlockComposite);
  }

  // ============ Style Operations ============

  /**
   * Defines a CSS class
   */
  defineClass(name: string, css: string): this {
    const classDef: BlockClassDef = {
      type: 'classDef',
      id: name,
      css,
    };
    this.ast.classDefs.set(name, css);
    this.ast.elements.push(classDef);
    return this;
  }

  /**
   * Applies a class to nodes
   */
  applyClass(nodeIds: string | string[], className: string): this {
    const ids = Array.isArray(nodeIds) ? nodeIds.join(', ') : nodeIds;
    const applyClass: BlockApplyClass = {
      type: 'applyClass',
      id: ids,
      styleClass: className,
    };
    for (const nodeId of Array.isArray(nodeIds) ? nodeIds : [nodeIds]) {
      this.ast.classAssignments.set(nodeId, className);
    }
    this.ast.elements.push(applyClass);
    return this;
  }

  /**
   * Applies inline styles to nodes
   */
  applyStyles(nodeIds: string | string[], styles: string): this {
    const ids = Array.isArray(nodeIds) ? nodeIds.join(', ') : nodeIds;
    const applyStyles: BlockApplyStyles = {
      type: 'applyStyles',
      id: ids,
      stylesStr: styles,
    };
    for (const nodeId of Array.isArray(nodeIds) ? nodeIds : [nodeIds]) {
      this.ast.styleAssignments.set(nodeId, styles);
    }
    this.ast.elements.push(applyStyles);
    return this;
  }

  /**
   * Gets all defined classes
   */
  getClassDefs(): Map<string, string> {
    return new Map(this.ast.classDefs);
  }

  // ============ Accessibility ============

  /**
   * Sets the accessibility title
   */
  setAccTitle(title: string): this {
    this.ast.accTitle = title;
    return this;
  }

  /**
   * Gets the accessibility title
   */
  getAccTitle(): string | undefined {
    return this.ast.accTitle;
  }

  /**
   * Sets the accessibility description
   */
  setAccDescr(descr: string): this {
    this.ast.accDescr = descr;
    return this;
  }

  /**
   * Gets the accessibility description
   */
  getAccDescr(): string | undefined {
    return this.ast.accDescr;
  }

  // ============ Element Count ============

  /**
   * Gets the total number of elements
   */
  get elementCount(): number {
    return this.ast.elements.length;
  }
}
