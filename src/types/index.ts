/**
 * Mermaid AST Types
 * 
 * This module exports all AST types for supported Mermaid diagram types.
 */

export * from "./flowchart.js";
export * from "./sequence.js";
export * from "./class.js";

import type { FlowchartAST } from "./flowchart.js";
import type { SequenceAST } from "./sequence.js";
import type { ClassDiagramAST } from "./class.js";

/**
 * Union type for all supported diagram ASTs
 */
export type MermaidAST = FlowchartAST | SequenceAST | ClassDiagramAST;

/**
 * Diagram type identifiers
 */
export type DiagramType = "flowchart" | "sequence" | "class";

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

/**
 * Check if an AST is a class diagram
 */
export function isClassDiagramAST(ast: MermaidAST): ast is ClassDiagramAST {
  return ast.type === "classDiagram";
}