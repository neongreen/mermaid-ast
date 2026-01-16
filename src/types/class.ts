/**
 * Class Diagram AST Types
 */

export type ClassDirection = 'TB' | 'BT' | 'LR' | 'RL';

export type RelationType =
  | 'aggregation' // o--
  | 'extension' // <|-- or --|>
  | 'composition' // *--
  | 'dependency' // <-- or -->
  | 'lollipop' // ()--
  | 'none';

export type LineType = 'solid' | 'dotted';

export interface ClassRelation {
  id1: string;
  id2: string;
  relation: {
    type1: RelationType;
    type2: RelationType;
    lineType: LineType;
  };
  relationTitle1?: string;
  relationTitle2?: string;
  title?: string;
}

export interface ClassMember {
  text: string;
  visibility?: '+' | '-' | '#' | '~'; // public, private, protected, package
  type?: 'method' | 'attribute';
}

export interface ClassDefinition {
  id: string;
  label?: string;
  members: ClassMember[];
  annotations: string[]; // e.g., "interface", "abstract", "service"
  cssClasses: string[];
  styles: string[];
  link?: string;
  linkTarget?: string;
  tooltip?: string;
  callback?: string;
  callbackArgs?: string;
}

export interface ClassNote {
  text: string;
  forClass?: string; // If attached to a specific class
}

export interface Namespace {
  name: string;
  classes: string[]; // Class IDs in this namespace
}

export interface ClassDefStyle {
  name: string;
  styles: string[];
}

export interface ClassDiagramAST {
  type: 'classDiagram';
  direction: ClassDirection;
  classes: Map<string, ClassDefinition>;
  relations: ClassRelation[];
  namespaces: Map<string, Namespace>;
  notes: ClassNote[];
  classDefs: Map<string, ClassDefStyle>;
  accTitle?: string;
  accDescription?: string;
}

/**
 * Create an empty ClassDiagramAST
 */
export function createClassDiagramAST(): ClassDiagramAST {
  return {
    type: 'classDiagram',
    direction: 'TB',
    classes: new Map(),
    relations: [],
    namespaces: new Map(),
    notes: [],
    classDefs: new Map(),
  };
}
