/**
 * Flowchart Renderer
 * 
 * Renders a Flowchart AST back to Mermaid syntax.
 */

import type {
  FlowchartAST,
  FlowchartNode,
  FlowchartLink,
  FlowchartSubgraph,
} from "../types/flowchart.js";
import type { RenderOptions } from "../types/render-options.js";
import { resolveOptions } from "../types/render-options.js";

/**
 * Render node shape syntax
 */
function renderNodeShape(node: FlowchartNode): string {
  const text = node.text?.text || node.id;
  const escapedText = escapeText(text);

  switch (node.shape) {
    case "square":
      return `[${escapedText}]`;
    case "round":
      return `(${escapedText})`;
    case "circle":
      return `((${escapedText}))`;
    case "doublecircle":
      return `(((${escapedText})))`;
    case "ellipse":
      return `(-${escapedText}-)`;
    case "stadium":
      return `([${escapedText}])`;
    case "subroutine":
      return `[[${escapedText}]]`;
    case "cylinder":
      return `[(${escapedText})]`;
    case "diamond":
      return `{${escapedText}}`;
    case "hexagon":
      return `{{${escapedText}}}`;
    case "odd":
      return `>${escapedText}]`;
    case "trapezoid":
      return `[/${escapedText}\\]`;
    case "inv_trapezoid":
      return `[\\${escapedText}/]`;
    case "lean_right":
      return `[/${escapedText}/]`;
    case "lean_left":
      return `[\\${escapedText}\\]`;
    case "rect":
    default:
      // If no text, just return the id
      if (!node.text) {
        return "";
      }
      return `[${escapedText}]`;
  }
}

/**
 * Escape special characters in text
 */
function escapeText(text: string): string {
  // Escape quotes in text
  return text.replace(/"/g, '\\"');
}

/**
 * Render link arrow syntax
 */
function renderLinkArrow(link: FlowchartLink): string {
  const isOpen = link.type === "arrow_open";
  const length = Math.max(1, link.length);
  
  let arrow = "";

  // Start character based on type (for bidirectional)
  if (link.type === "arrow_circle") {
    arrow += "o";
  } else if (link.type === "arrow_cross") {
    arrow += "x";
  }

  // Build the arrow based on stroke type
  switch (link.stroke) {
    case "thick":
      // Thick: === for open, ==> for arrow
      if (isOpen) {
        arrow += "=".repeat(length + 2);
      } else {
        arrow += "=".repeat(length + 1);
      }
      break;
    case "dotted":
      // Dotted: -.- for open, -.-> for arrow
      if (isOpen) {
        arrow += "-.-";
      } else {
        arrow += "-.-";
      }
      break;
    case "normal":
    default:
      // Normal: --- for open, --> for arrow
      if (isOpen) {
        arrow += "-".repeat(length + 2);
      } else {
        arrow += "-".repeat(length + 1);
      }
      break;
  }

  // End character based on type (only for non-open)
  if (!isOpen) {
    switch (link.type) {
      case "arrow_point":
        arrow += ">";
        break;
      case "arrow_circle":
        arrow += "o";
        break;
      case "arrow_cross":
        arrow += "x";
        break;
      default:
        break;
    }
  }

  return arrow;
}

/**
 * Render a single link
 */
function renderLink(link: FlowchartLink): string {
  const arrow = renderLinkArrow(link);
  
  if (link.text?.text) {
    return `${arrow}|${escapeText(link.text.text)}|`;
  }
  
  return arrow;
}

/**
 * Get inline class suffix for a node (:::className)
 */
function getInlineClassSuffix(nodeId: string, ast: FlowchartAST): string {
  const classes = ast.classes.get(nodeId);
  if (classes && classes.length > 0) {
    return `:::${classes.join(",")}`;
  }
  return "";
}

/**
 * Render class definitions
 */
function renderClassDefs(ast: FlowchartAST, indent: string): string[] {
  const lines: string[] = [];
  
  for (const [className, classDef] of ast.classDefs) {
    const styles = Object.entries(classDef.styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    lines.push(`${indent}classDef ${className} ${styles}`);
  }
  
  return lines;
}

/**
 * Render class assignments (when not using inline classes)
 */
function renderClassAssignments(ast: FlowchartAST, indent: string): string[] {
  const lines: string[] = [];
  
  // Group nodes by class
  const classToNodes = new Map<string, string[]>();
  for (const [nodeId, classes] of ast.classes) {
    for (const className of classes) {
      const nodes = classToNodes.get(className) || [];
      nodes.push(nodeId);
      classToNodes.set(className, nodes);
    }
  }
  
  for (const [className, nodes] of classToNodes) {
    lines.push(`${indent}class ${nodes.join(",")} ${className}`);
  }
  
  return lines;
}

/**
 * Render click handlers
 */
function renderClicks(ast: FlowchartAST, indent: string): string[] {
  const lines: string[] = [];
  
  for (const click of ast.clicks) {
    if (click.href) {
      const target = click.target ? ` ${click.target}` : "";
      lines.push(`${indent}click ${click.nodeId} href "${click.href}"${target}`);
    } else if (click.callback) {
      const args = click.callbackArgs ? ` ${click.callbackArgs}` : "";
      lines.push(`${indent}click ${click.nodeId} ${click.callback}${args}`);
    }
  }
  
  return lines;
}

/**
 * Render link styles
 */
function renderLinkStyles(ast: FlowchartAST, indent: string): string[] {
  const lines: string[] = [];
  
  for (const linkStyle of ast.linkStyles) {
    const styles = Object.entries(linkStyle.styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    const index = linkStyle.index === "default" ? "default" : linkStyle.index;
    const interpolate = linkStyle.interpolate ? ` interpolate ${linkStyle.interpolate}` : "";
    lines.push(`${indent}linkStyle ${index} ${styles}${interpolate}`);
  }
  
  return lines;
}

/**
 * Render a subgraph
 */
function renderSubgraph(
  subgraph: FlowchartSubgraph,
  ast: FlowchartAST,
  renderedNodes: Set<string>,
  renderedLinks: Set<number>,
  opts: Required<RenderOptions>
): string[] {
  const lines: string[] = [];
  const indent = opts.indent;
  const innerIndent = indent + indent;
  
  // Subgraph header
  const title = subgraph.title?.text || subgraph.id;
  if (title !== subgraph.id) {
    lines.push(`${indent}subgraph ${subgraph.id}[${escapeText(title)}]`);
  } else {
    lines.push(`${indent}subgraph ${subgraph.id}`);
  }
  
  // Direction if specified
  if (subgraph.direction) {
    lines.push(`${innerIndent}direction ${subgraph.direction}`);
  }
  
  // Get nodes to render (optionally sorted)
  let nodeIds = [...subgraph.nodes];
  if (opts.sortNodes) {
    nodeIds.sort();
  }
  
  // Render nodes in this subgraph
  for (const nodeId of nodeIds) {
    if (!renderedNodes.has(nodeId)) {
      const node = ast.nodes.get(nodeId);
      if (node) {
        const shape = renderNodeShape(node);
        const classSuffix = opts.inlineClasses ? getInlineClassSuffix(nodeId, ast) : "";
        lines.push(`${innerIndent}${node.id}${shape}${classSuffix}`);
        renderedNodes.add(nodeId);
      }
    }
  }
  
  // Render links between nodes in this subgraph
  for (let i = 0; i < ast.links.length; i++) {
    const link = ast.links[i];
    if (
      !renderedLinks.has(i) &&
      subgraph.nodes.includes(link.source) &&
      subgraph.nodes.includes(link.target)
    ) {
      const linkStr = renderLink(link);
      lines.push(`${innerIndent}${link.source} ${linkStr} ${link.target}`);
      renderedLinks.add(i);
    }
  }
  
  lines.push(`${indent}end`);
  
  return lines;
}

/**
 * Build chains of links for compact rendering (A --> B --> C)
 */
function buildLinkChains(
  ast: FlowchartAST,
  renderedLinks: Set<number>
): { chains: { nodeIds: string[]; links: FlowchartLink[] }[]; usedLinkIndices: Set<number> } {
  const chains: { nodeIds: string[]; links: FlowchartLink[] }[] = [];
  const usedLinkIndices = new Set<number>();
  
  // Build adjacency map: source -> list of (target, link, index)
  const outgoing = new Map<string, { target: string; link: FlowchartLink; index: number }[]>();
  for (let i = 0; i < ast.links.length; i++) {
    if (renderedLinks.has(i)) continue;
    const link = ast.links[i];
    const list = outgoing.get(link.source) || [];
    list.push({ target: link.target, link, index: i });
    outgoing.set(link.source, list);
  }
  
  // Count incoming edges for each node
  const incomingCount = new Map<string, number>();
  for (let i = 0; i < ast.links.length; i++) {
    if (renderedLinks.has(i)) continue;
    const link = ast.links[i];
    incomingCount.set(link.target, (incomingCount.get(link.target) || 0) + 1);
  }
  
  // Find chain starting points (nodes with outgoing edges but 0 or multiple incoming)
  const visited = new Set<number>();
  
  for (let i = 0; i < ast.links.length; i++) {
    if (renderedLinks.has(i) || visited.has(i)) continue;
    
    const link = ast.links[i];
    const chain: { nodeIds: string[]; links: FlowchartLink[] } = {
      nodeIds: [link.source],
      links: [],
    };
    
    let current = link.source;
    
    // Follow the chain
    while (true) {
      const edges = outgoing.get(current);
      if (!edges || edges.length !== 1) break;
      
      const edge = edges[0];
      if (visited.has(edge.index)) break;
      
      // Check if target has exactly one incoming edge (from current)
      const targetIncoming = incomingCount.get(edge.target) || 0;
      if (targetIncoming !== 1) {
        // Can still add this edge, but stop after
        chain.nodeIds.push(edge.target);
        chain.links.push(edge.link);
        visited.add(edge.index);
        usedLinkIndices.add(edge.index);
        break;
      }
      
      chain.nodeIds.push(edge.target);
      chain.links.push(edge.link);
      visited.add(edge.index);
      usedLinkIndices.add(edge.index);
      current = edge.target;
    }
    
    if (chain.links.length > 0) {
      chains.push(chain);
    }
  }
  
  return { chains, usedLinkIndices };
}

/**
 * Render a FlowchartAST to Mermaid syntax
 */
export function renderFlowchart(ast: FlowchartAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const lines: string[] = [];
  const indent = opts.indent;
  
  // Header
  lines.push(`flowchart ${ast.direction}`);
  
  // Track what we've rendered
  const renderedNodes = new Set<string>();
  const renderedLinks = new Set<number>();
  
  // Collect nodes that are in subgraphs
  const nodesInSubgraphs = new Set<string>();
  for (const subgraph of ast.subgraphs) {
    for (const nodeId of subgraph.nodes) {
      nodesInSubgraphs.add(nodeId);
    }
  }
  
  // Render subgraphs first
  for (const subgraph of ast.subgraphs) {
    lines.push(...renderSubgraph(subgraph, ast, renderedNodes, renderedLinks, opts));
  }
  
  // Get node order (optionally sorted)
  let nodeEntries = [...ast.nodes.entries()];
  if (opts.sortNodes) {
    nodeEntries.sort((a, b) => a[0].localeCompare(b[0]));
  }
  
  if (opts.compactLinks) {
    // Compact mode: build chains and render them
    const { chains, usedLinkIndices } = buildLinkChains(ast, renderedLinks);
    
    // Render chains
    for (const chain of chains) {
      let line = indent;
      for (let i = 0; i < chain.nodeIds.length; i++) {
        const nodeId = chain.nodeIds[i];
        const node = ast.nodes.get(nodeId);
        
        if (i === 0) {
          // First node in chain - include shape if not rendered
          if (node && !renderedNodes.has(nodeId)) {
            const shape = renderNodeShape(node);
            const classSuffix = opts.inlineClasses ? getInlineClassSuffix(nodeId, ast) : "";
            line += `${nodeId}${shape}${classSuffix}`;
            renderedNodes.add(nodeId);
          } else {
            line += nodeId;
          }
        }
        
        if (i < chain.links.length) {
          const link = chain.links[i];
          const linkStr = renderLink(link);
          const targetId = chain.nodeIds[i + 1];
          const targetNode = ast.nodes.get(targetId);
          
          if (targetNode && !renderedNodes.has(targetId)) {
            const targetShape = renderNodeShape(targetNode);
            const classSuffix = opts.inlineClasses ? getInlineClassSuffix(targetId, ast) : "";
            line += ` ${linkStr} ${targetId}${targetShape}${classSuffix}`;
            renderedNodes.add(targetId);
          } else {
            line += ` ${linkStr} ${targetId}`;
          }
        }
      }
      lines.push(line);
    }
    
    // Mark used links as rendered
    for (const idx of usedLinkIndices) {
      renderedLinks.add(idx);
    }
    
    // Render remaining standalone nodes
    for (const [nodeId, node] of nodeEntries) {
      if (renderedNodes.has(nodeId)) continue;
      const shape = renderNodeShape(node);
      const classSuffix = opts.inlineClasses ? getInlineClassSuffix(nodeId, ast) : "";
      lines.push(`${indent}${node.id}${shape}${classSuffix}`);
      renderedNodes.add(nodeId);
    }
    
    // Render remaining links
    for (let i = 0; i < ast.links.length; i++) {
      if (renderedLinks.has(i)) continue;
      const link = ast.links[i];
      const linkStr = renderLink(link);
      lines.push(`${indent}${link.source} ${linkStr} ${link.target}`);
      renderedLinks.add(i);
    }
  } else {
    // Non-compact mode: original behavior
    // Group links by source for cleaner output
    const linksBySource = new Map<string, { link: FlowchartLink; index: number }[]>();
    for (let i = 0; i < ast.links.length; i++) {
      if (renderedLinks.has(i)) continue;
      const link = ast.links[i];
      const existing = linksBySource.get(link.source) || [];
      existing.push({ link, index: i });
      linksBySource.set(link.source, existing);
    }
    
    // Render remaining nodes and their links
    for (const [nodeId, node] of nodeEntries) {
      if (renderedNodes.has(nodeId)) continue;
      
      const linksFromThis = linksBySource.get(nodeId) || [];
      const classSuffix = opts.inlineClasses ? getInlineClassSuffix(nodeId, ast) : "";
      
      if (linksFromThis.length === 0) {
        // Standalone node
        const shape = renderNodeShape(node);
        lines.push(`${indent}${node.id}${shape}${classSuffix}`);
        renderedNodes.add(nodeId);
      } else {
        // Node with links - render the first link with node definition
        const firstLinkInfo = linksFromThis[0];
        const shape = renderNodeShape(node);
        const linkStr = renderLink(firstLinkInfo.link);
        const targetNode = ast.nodes.get(firstLinkInfo.link.target);
        const targetClassSuffix = opts.inlineClasses ? getInlineClassSuffix(firstLinkInfo.link.target, ast) : "";
        const targetShape = targetNode && !renderedNodes.has(firstLinkInfo.link.target)
          ? renderNodeShape(targetNode)
          : "";
        
        lines.push(`${indent}${node.id}${shape}${classSuffix} ${linkStr} ${firstLinkInfo.link.target}${targetShape}${targetClassSuffix}`);
        renderedNodes.add(nodeId);
        renderedNodes.add(firstLinkInfo.link.target);
        renderedLinks.add(firstLinkInfo.index);
        
        // Render additional links from this node
        for (let i = 1; i < linksFromThis.length; i++) {
          const linkInfo = linksFromThis[i];
          const linkStr = renderLink(linkInfo.link);
          const targetNode = ast.nodes.get(linkInfo.link.target);
          const targetClassSuffix = opts.inlineClasses ? getInlineClassSuffix(linkInfo.link.target, ast) : "";
          const targetShape = targetNode && !renderedNodes.has(linkInfo.link.target)
            ? renderNodeShape(targetNode)
            : "";
          
          lines.push(`${indent}${node.id} ${linkStr} ${linkInfo.link.target}${targetShape}${targetClassSuffix}`);
          renderedNodes.add(linkInfo.link.target);
          renderedLinks.add(linkInfo.index);
        }
      }
    }
    
    // Render any remaining links
    for (let i = 0; i < ast.links.length; i++) {
      if (renderedLinks.has(i)) continue;
      const link = ast.links[i];
      const linkStr = renderLink(link);
      lines.push(`${indent}${link.source} ${linkStr} ${link.target}`);
      renderedLinks.add(i);
    }
  }
  
  // Render class definitions
  lines.push(...renderClassDefs(ast, indent));
  
  // Render class assignments (only if not using inline classes)
  if (!opts.inlineClasses) {
    lines.push(...renderClassAssignments(ast, indent));
  }
  
  // Render click handlers
  lines.push(...renderClicks(ast, indent));
  
  // Render link styles
  lines.push(...renderLinkStyles(ast, indent));
  
  return lines.join("\n");
}