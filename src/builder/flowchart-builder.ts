/**
 * Flowchart Builder
 *
 * Fluent API for constructing Flowchart ASTs programmatically.
 */

import {
  createEmptyFlowchartAST,
  type FlowchartAST,
  type FlowchartClassDef,
  type FlowchartClickDef,
  type FlowchartDirection,
  type FlowchartLink,
  type FlowchartLinkStroke,
  type FlowchartLinkStyle,
  type FlowchartLinkType,
  type FlowchartNode,
  type FlowchartNodeShape,
  type FlowchartSubgraph,
} from '../types/flowchart.js';

/**
 * Options for adding a node
 */
export interface NodeOptions {
  shape?: FlowchartNodeShape;
  classes?: string[];
}

/**
 * Options for adding a link
 */
export interface LinkOptions {
  text?: string;
  stroke?: FlowchartLinkStroke;
  type?: FlowchartLinkType;
  length?: number;
}

/**
 * Options for build()
 */
export interface BuildOptions {
  validate?: boolean;
}

/**
 * Validation error for invalid AST
 */
export class FlowchartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FlowchartValidationError';
  }
}

/**
 * Builder for subgraphs (used in nested context)
 */
export class SubgraphBuilder {
  private nodes: string[] = [];
  private direction?: FlowchartDirection;
  private parentBuilder: FlowchartBuilder;

  constructor(parentBuilder: FlowchartBuilder) {
    this.parentBuilder = parentBuilder;
  }

  /**
   * Add a node to this subgraph
   */
  node(id: string, text?: string, options?: NodeOptions): this {
    this.parentBuilder.node(id, text, options);
    this.nodes.push(id);
    return this;
  }

  /**
   * Add a link (delegates to parent builder)
   */
  link(source: string, target: string, options?: LinkOptions): this {
    this.parentBuilder.link(source, target, options);
    return this;
  }

  /**
   * Set direction for this subgraph
   */
  setDirection(direction: FlowchartDirection): this {
    this.direction = direction;
    return this;
  }

  /**
   * Get the nodes in this subgraph
   */
  getNodes(): string[] {
    return this.nodes;
  }

  /**
   * Get the direction of this subgraph
   */
  getDirection(): FlowchartDirection | undefined {
    return this.direction;
  }
}

/**
 * Fluent builder for Flowchart ASTs
 */
export class FlowchartBuilder {
  private ast: FlowchartAST;

  constructor(direction: FlowchartDirection = 'TB') {
    this.ast = createEmptyFlowchartAST();
    this.ast.direction = direction;
  }

  /**
   * Add a node to the flowchart
   */
  node(id: string, text?: string, options?: NodeOptions): this {
    const node: FlowchartNode = {
      id,
      shape: options?.shape ?? 'square',
    };

    if (text) {
      node.text = { text, type: 'text' };
    }

    if (options?.classes) {
      node.classes = options.classes;
      // Also add to the classes map
      this.ast.classes.set(id, options.classes);
    }

    this.ast.nodes.set(id, node);
    return this;
  }

  /**
   * Add a link between two nodes
   */
  link(source: string, target: string, options?: LinkOptions): this {
    const link: FlowchartLink = {
      source,
      target,
      stroke: options?.stroke ?? 'normal',
      type: options?.type ?? 'arrow_point',
      length: options?.length ?? 1,
    };

    if (options?.text) {
      link.text = { text: options.text, type: 'text' };
    }

    this.ast.links.push(link);
    return this;
  }

  /**
   * Add a subgraph
   */
  subgraph(
    id: string,
    title: string | undefined,
    builderFn: (builder: SubgraphBuilder) => void
  ): this {
    const subBuilder = new SubgraphBuilder(this);
    builderFn(subBuilder);

    const subgraph: FlowchartSubgraph = {
      id,
      nodes: subBuilder.getNodes(),
    };

    if (title) {
      subgraph.title = { text: title, type: 'text' };
    }

    const direction = subBuilder.getDirection();
    if (direction) {
      subgraph.direction = direction;
    }

    this.ast.subgraphs.push(subgraph);
    return this;
  }

  /**
   * Define a class with styles
   */
  classDef(className: string, styles: Record<string, string>): this {
    const classDef: FlowchartClassDef = {
      id: className,
      styles,
    };
    this.ast.classDefs.set(className, classDef);
    return this;
  }

  /**
   * Assign a class to one or more nodes
   */
  class(nodeIds: string | string[], className: string): this {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
    for (const nodeId of ids) {
      const existing = this.ast.classes.get(nodeId) || [];
      if (!existing.includes(className)) {
        existing.push(className);
      }
      this.ast.classes.set(nodeId, existing);
    }
    return this;
  }

  /**
   * Add a click handler with a callback
   */
  click(nodeId: string, callback: string, callbackArgs?: string): this {
    const clickDef: FlowchartClickDef = {
      nodeId,
      callback,
      callbackArgs,
    };
    this.ast.clicks.push(clickDef);
    return this;
  }

  /**
   * Add a click handler with an href
   */
  clickHref(nodeId: string, href: string, target?: '_self' | '_blank' | '_parent' | '_top'): this {
    const clickDef: FlowchartClickDef = {
      nodeId,
      href,
      target,
    };
    this.ast.clicks.push(clickDef);
    return this;
  }

  /**
   * Add a link style
   */
  linkStyle(index: number | 'default', styles: Record<string, string>, interpolate?: string): this {
    const linkStyle: FlowchartLinkStyle = {
      index,
      styles,
      interpolate,
    };
    this.ast.linkStyles.push(linkStyle);
    return this;
  }

  /**
   * Set the diagram title
   */
  title(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Set the accessibility description
   */
  accDescription(description: string): this {
    this.ast.accDescription = description;
    return this;
  }

  /**
   * Validate the AST
   */
  private validate(): void {
    const errors: string[] = [];

    // Check that all link sources and targets exist
    for (const link of this.ast.links) {
      if (!this.ast.nodes.has(link.source)) {
        errors.push(`Link source node '${link.source}' does not exist`);
      }
      if (!this.ast.nodes.has(link.target)) {
        errors.push(`Link target node '${link.target}' does not exist`);
      }
    }

    // Check that all class assignments reference existing nodes
    for (const [nodeId] of this.ast.classes) {
      if (!this.ast.nodes.has(nodeId)) {
        errors.push(`Class assigned to non-existent node '${nodeId}'`);
      }
    }

    // Check that all click handlers reference existing nodes
    for (const click of this.ast.clicks) {
      if (!this.ast.nodes.has(click.nodeId)) {
        errors.push(`Click handler on non-existent node '${click.nodeId}'`);
      }
    }

    // Check that all subgraph nodes exist
    for (const subgraph of this.ast.subgraphs) {
      for (const nodeId of subgraph.nodes) {
        if (!this.ast.nodes.has(nodeId)) {
          errors.push(`Subgraph '${subgraph.id}' references non-existent node '${nodeId}'`);
        }
      }
    }

    // Check that all class definitions are used (warning, not error)
    // Skip this for now - it's not critical

    if (errors.length > 0) {
      throw new FlowchartValidationError(errors.join('\n'));
    }
  }

  /**
   * Build and return the FlowchartAST
   */
  build(options?: BuildOptions): FlowchartAST {
    const shouldValidate = options?.validate !== false;

    if (shouldValidate) {
      this.validate();
    }

    return this.ast;
  }
}

/**
 * Create a new FlowchartBuilder
 */
export function flowchart(direction: FlowchartDirection = 'TB'): FlowchartBuilder {
  return new FlowchartBuilder(direction);
}
