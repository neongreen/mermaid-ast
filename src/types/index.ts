/**
 * Mermaid AST Types
 * 
 * This module exports all AST types for supported Mermaid diagram types.
 */

export * from "./flowchart.js";
export * from "./sequence.js";

import type { FlowchartAST } from "./flowchart.js";
import type { SequenceAST } from "./sequence.js";

/**
 * Union type for all supported diagram ASTs
 */
export type MermaidAST = FlowchartAST | SequenceAST;

/**
 * Diagram type identifiers
 */
export type DiagramType = "flowchart" | "sequence";

/**
 * Check if an AST is a flowchart
 */
export function isFlowchartAST(ast: MermaidAST): ast is FlowchartAST {
  return ast.type === "flowchart";
}

/**
 * Check if an AST is a sequence diagram
 */
export function isSequenceAST(ast: MermaidAST): ast is SequenceAST {
  return ast.type === "sequence";
}