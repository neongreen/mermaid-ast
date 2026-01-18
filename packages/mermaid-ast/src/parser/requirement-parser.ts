/**
 * Requirement Diagram Parser
 *
 * Parses Mermaid requirement diagram syntax into an AST using the vendored JISON parser.
 */

import type {
  RelationshipType,
  Requirement,
  RequirementAST,
  RequirementDirection,
  RequirementElement,
  RequirementType,
  RiskLevel,
  VerifyMethod,
} from '../types/requirement.js';
import { createEmptyRequirementAST } from '../types/requirement.js';

// @ts-expect-error - JISON parser has no types
import requirementParser from '../vendored/parsers/requirement.js';

/**
 * Requirement type enum for the yy object
 */
const RequirementTypeEnum = {
  REQUIREMENT: 'requirement' as RequirementType,
  FUNCTIONAL_REQUIREMENT: 'functionalRequirement' as RequirementType,
  INTERFACE_REQUIREMENT: 'interfaceRequirement' as RequirementType,
  PERFORMANCE_REQUIREMENT: 'performanceRequirement' as RequirementType,
  PHYSICAL_REQUIREMENT: 'physicalRequirement' as RequirementType,
  DESIGN_CONSTRAINT: 'designConstraint' as RequirementType,
};

/**
 * Risk level enum for the yy object
 */
const RiskLevelEnum = {
  LOW_RISK: 'low' as RiskLevel,
  MED_RISK: 'medium' as RiskLevel,
  HIGH_RISK: 'high' as RiskLevel,
};

/**
 * Verify type enum for the yy object
 */
const VerifyTypeEnum = {
  VERIFY_ANALYSIS: 'analysis' as VerifyMethod,
  VERIFY_DEMONSTRATION: 'demonstration' as VerifyMethod,
  VERIFY_INSPECTION: 'inspection' as VerifyMethod,
  VERIFY_TEST: 'test' as VerifyMethod,
};

/**
 * Relationship type enum for the yy object
 */
const RelationshipsEnum = {
  CONTAINS: 'contains' as RelationshipType,
  COPIES: 'copies' as RelationshipType,
  DERIVES: 'derives' as RelationshipType,
  SATISFIES: 'satisfies' as RelationshipType,
  VERIFIES: 'verifies' as RelationshipType,
  REFINES: 'refines' as RelationshipType,
  TRACES: 'traces' as RelationshipType,
};

/**
 * Temporary storage for requirement/element being built
 */
interface TempRequirement {
  id?: string;
  text?: string;
  risk?: RiskLevel;
  verifyMethod?: VerifyMethod;
}

interface TempElement {
  type?: string;
  docRef?: string;
}

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createRequirementYY(ast: RequirementAST) {
  // Temporary storage for the requirement/element currently being parsed
  let currentRequirement: TempRequirement = {};
  let currentElement: TempElement = {};

  return {
    RequirementType: RequirementTypeEnum,
    RiskLevel: RiskLevelEnum,
    VerifyType: VerifyTypeEnum,
    Relationships: RelationshipsEnum,

    setDirection(direction: string): void {
      ast.direction = direction as RequirementDirection;
    },

    addRequirement(name: string, type: RequirementType): void {
      const requirement: Requirement = {
        name,
        requirementType: type,
        ...currentRequirement,
      };
      ast.requirements.set(name, requirement);
      // Reset temp storage
      currentRequirement = {};
    },

    setNewReqId(id: string): void {
      currentRequirement.id = id;
    },

    setNewReqText(text: string): void {
      currentRequirement.text = text;
    },

    setNewReqRisk(risk: RiskLevel): void {
      currentRequirement.risk = risk;
    },

    setNewReqVerifyMethod(method: VerifyMethod): void {
      currentRequirement.verifyMethod = method;
    },

    addElement(name: string): void {
      const element: RequirementElement = {
        name,
        ...currentElement,
      };
      ast.elements.set(name, element);
      // Reset temp storage
      currentElement = {};
    },

    setNewElementType(type: string): void {
      currentElement.type = type;
    },

    setNewElementDocRef(docRef: string): void {
      currentElement.docRef = docRef;
    },

    addRelationship(type: RelationshipType, source: string, target: string): void {
      ast.relationships.push({
        source,
        target,
        relationshipType: type,
      });
    },

    setClass(entities: string[], classNames: string[]): void {
      for (const entity of entities) {
        const existing = ast.classes.get(entity) || [];
        ast.classes.set(entity, [...existing, ...classNames]);
      }
    },

    defineClass(classNames: string[], styles: string[]): void {
      for (const className of classNames) {
        ast.classDefs.set(className, {
          name: className,
          styles,
        });
      }
    },

    setCssStyle(ids: string[], styles: string[]): void {
      for (const id of ids) {
        const existing = ast.styles.get(id) || [];
        ast.styles.set(id, [...existing, ...styles]);
      }
    },

    setAccTitle(title: string): void {
      ast.accTitle = title;
    },

    setAccDescription(description: string): void {
      ast.accDescription = description;
    },

    // Required by parser but not used
    clear(): void {},
    setDiagramTitle(): void {},
    getLogger(): { debug: () => void; info: () => void; warn: () => void; error: () => void } {
      return {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
    },
  };
}

/**
 * Parse requirement diagram syntax into an AST
 * @param input - Mermaid requirement diagram syntax
 * @returns The parsed AST
 */
export function parseRequirement(input: string): RequirementAST {
  const ast = createEmptyRequirementAST();

  // Normalize input - ensure it starts with requirementDiagram
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('requirementdiagram')) {
    normalizedInput = `requirementDiagram\n${normalizedInput}`;
  }

  // Set up the yy object
  requirementParser.yy = createRequirementYY(ast);

  // Parse the input
  requirementParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is a requirement diagram
 */
export function isRequirementDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('requirementdiagram');
}
