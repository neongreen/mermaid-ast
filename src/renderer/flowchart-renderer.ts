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
  FlowchartText,
  FlowchartNodeShape,
  FlowchartLinkStroke,
  FlowchartLinkType,
} from "../types/flowchart.js";

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
      // The pattern is: -. then - then > (for arrow)
      if (isOpen) {
        arrow += "-.-";
      } else {
        arrow += "-.-";  // -.- then we add the end character
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
 * Render class definitions
 */
function renderClassDefs(ast: FlowchartAST): string[] {
  const lines: string[] = [];
  
  for (const [className, classDef] of ast.classDefs) {
    const styles = Object.entries(classDef.styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    lines.push(`    classDef ${className} ${styles}`);
  }
  
  return lines;
}

/**
 * Render class assignments
 */
function renderClassAssignments(ast: FlowchartAST): string[] {
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
    lines.push(`    class ${nodes.join(",")} ${className}`);
  }
  
  return lines;
}

/**
 * Render click handlers
 */
function renderClicks(ast: FlowchartAST): string[] {
  const lines: string[] = [];
  
  for (const click of ast.clicks) {
    if (click.href) {
      const target = click.target ? ` ${click.target}` : "";
      lines.push(`    click ${click.nodeId} href "${click.href}"${target}`);
    } else if (click.callback) {
      const args = click.callbackArgs ? ` ${click.callbackArgs}` : "";
      lines.push(`    click ${click.nodeId} ${click.callback}${args}`);
    }
  }
  
  return lines;
}

/**
 * Render link styles
 */
function renderLinkStyles(ast: FlowchartAST): string[] {
  const lines: string[] = [];
  
  for (const linkStyle of ast.linkStyles) {
    const styles = Object.entries(linkStyle.styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    const index = linkStyle.index === "default" ? "default" : linkStyle.index;
    const interpolate = linkStyle.interpolate ? ` interpolate ${linkStyle.interpolate}` : "";
    lines.push(`    linkStyle ${index} ${styles}${interpolate}`);
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
  renderedLinks: Set<number>
): string[] {
  const lines: string[] = [];
  
  // Subgraph header
  const title = subgraph.title?.text || subgraph.id;
  if (title !== subgraph.id) {
    lines.push(`    subgraph ${subgraph.id}[${escapeText(title)}]`);
  } else {
    lines.push(`    subgraph ${subgraph.id}`);
  }
  
  // Direction if specified
  if (subgraph.direction) {
    lines.push(`        direction ${subgraph.direction}`);
  }
  
  // Render nodes in this subgraph
  for (const nodeId of subgraph.nodes) {
    if (!renderedNodes.has(nodeId)) {
      const node = ast.nodes.get(nodeId);
      if (node) {
        const shape = renderNodeShape(node);
        lines.push(`        ${node.id}${shape}`);
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
      lines.push(`        ${link.source} ${linkStr} ${link.target}`);
      renderedLinks.add(i);
    }
  }
  
  lines.push(`    end`);
  
  return lines;
}

/**
 * Render a FlowchartAST to Mermaid syntax
 */
export function renderFlowchart(ast: FlowchartAST): string {
  const lines: string[] = [];
  
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
    lines.push(...renderSubgraph(subgraph, ast, renderedNodes, renderedLinks));
  }
  
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
  for (const [nodeId, node] of ast.nodes) {
    if (renderedNodes.has(nodeId)) continue;
    
    const linksFromThis = linksBySource.get(nodeId) || [];
    
    if (linksFromThis.length === 0) {
      // Standalone node
      const shape = renderNodeShape(node);
      lines.push(`    ${node.id}${shape}`);
      renderedNodes.add(nodeId);
    } else {
      // Node with links - render the first link with node definition
      const firstLinkInfo = linksFromThis[0];
      const shape = renderNodeShape(node);
      const linkStr = renderLink(firstLinkInfo.link);
      const targetNode = ast.nodes.get(firstLinkInfo.link.target);
      const targetShape = targetNode && !renderedNodes.has(firstLinkInfo.link.target)
        ? renderNodeShape(targetNode)
        : "";
      
      lines.push(`    ${node.id}${shape} ${linkStr} ${firstLinkInfo.link.target}${targetShape}`);
      renderedNodes.add(nodeId);
      renderedNodes.add(firstLinkInfo.link.target);
      renderedLinks.add(firstLinkInfo.index);
      
      // Render additional links from this node
      for (let i = 1; i < linksFromThis.length; i++) {
        const linkInfo = linksFromThis[i];
        const linkStr = renderLink(linkInfo.link);
        const targetNode = ast.nodes.get(linkInfo.link.target);
        const targetShape = targetNode && !renderedNodes.has(linkInfo.link.target)
          ? renderNodeShape(targetNode)
          : "";
        
        lines.push(`    ${node.id} ${linkStr} ${linkInfo.link.target}${targetShape}`);
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
    lines.push(`    ${link.source} ${linkStr} ${link.target}`);
    renderedLinks.add(i);
  }
  
  // Render class definitions
  lines.push(...renderClassDefs(ast));
  
  // Render class assignments
  lines.push(...renderClassAssignments(ast));
  
  // Render click handlers
  lines.push(...renderClicks(ast));
  
  // Render link styles
  lines.push(...renderLinkStyles(ast));
  
  return lines.join("\n");
}